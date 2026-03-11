import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint recalculates dynamic pricing for all participating parking lots.
// It can be called via a CRON job or manually to update prices based on live occupancy.
export async function POST(request: Request) {
  try {
    const rules = await prisma.pricingrule.findMany({
      where: {
        dynamic: true
      },
      include: {
        parkinglot: {
          include: {
            slots: true
          }
        }
      }
    });

    const updates = [];

    for (const rule of rules) {
      const lot = rule.parkinglot;
      if (!lot || lot.slots.length === 0) continue;

      const totalSlots = lot.slots.length;
      const occupiedSlots = lot.slots.filter(
        (s) => s.status === 'OCCUPIED' || s.status === 'RESERVED'
      ).length;

      const occupancyRate = occupiedSlots / totalSlots;
      let multiplier = 1.0;

      // Pricing Logic
      if (occupancyRate >= 0.8) {
        multiplier = 1.2; // 20% Surge
      } else if (occupancyRate <= 0.3) {
        multiplier = 0.8; // 20% Discount
      }

      // Calculate new dynamic hourly rate
      const newPrice = Number((rule.hourlyRate * multiplier).toFixed(2));

      // Check if price actually changed to avoid unnecessary DB writes and audits
      if (rule.currentPrice === newPrice) continue;

      // Create a task to update the pricing rule
      updates.push(
        prisma.pricingrule.update({
          where: { id: rule.id },
          data: { 
            currentPrice: newPrice,
            lastUpdated: new Date()
          }
        })
      );

      // Create a task to update all slot prices in this lot to match
      updates.push(
        prisma.slot.updateMany({
          where: { lotId: lot.id },
          data: { price: newPrice }
        })
      );

      // Log the price audit
      updates.push(
        prisma.priceaudit.create({
          data: {
            id: `audit_${lot.id}_${Date.now()}`,
            parkingLotId: lot.id,
            oldPrice: rule.currentPrice || rule.hourlyRate,
            newPrice: newPrice,
            reason: `Dynamic Pricing: Occupancy at ${(occupancyRate * 100).toFixed(1)}%`,
            triggeredBy: 'SYSTEM_CRON',
            createdAt: new Date()
          }
        })
      );
    }

    // Execute all updates in a single transaction
    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return NextResponse.json({
      success: true,
      message: `Dynamic pricing applied. Updated ${updates.length / 3} parking lots.`,
      evaluatedLots: rules.length
    });

  } catch (error: any) {
    console.error('Dynamic pricing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Fetch the overall status from all active parking lots
    const lots = await prisma.parkinglot.findMany({
      where: { status: 'ACTIVE' },
      include: {
        slots: true,
        pricingrule: true
      }
    });

    let total = 0;
    let available = 0;
    let lowestPrice = Infinity;

    lots.forEach(lot => {
      const lotTotal = lot.slots.length > 0 ? lot.slots.length : lot.totalSlots;
      const lotOccupied = lot.slots.filter(s => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
      
      total += lotTotal;
      available += Math.max(0, lotTotal - lotOccupied);

      // Find the best current price
      const price = lot.pricingrule[0]?.currentPrice || lot.slots[0]?.price || 50;
      if (price < lowestPrice) {
        lowestPrice = price;
      }
    });

    if (lowestPrice === Infinity) {
      lowestPrice = 50; // default fallback if no active rules
    }

    return NextResponse.json({
      total,
      available,
      currentPrice: lowestPrice
    });

  } catch (error: any) {
    console.error('Failed to fetch customer parking status:', error);
    return NextResponse.json(
      { total: 0, available: 0, currentPrice: 50, error: 'Internal Server Error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

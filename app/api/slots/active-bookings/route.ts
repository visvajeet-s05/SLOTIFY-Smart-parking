import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/slots/active-bookings?lotId=xxx
 * 
 * Returns slot IDs that currently have active bookings.
 * Used by the AI Edge Node to determine RESERVED state
 * when direct DB access is unavailable.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get('lotId');

    if (!lotId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: lotId' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Find all slots with active bookings in this lot
    const activeBookings = await prisma.booking.findMany({
      where: {
        parkingLotId: lotId,
        status: { in: ['UPCOMING', 'ACTIVE'] },
        slotId: { not: null },
        startTime: { lte: now },
        endTime: { gte: now },
      },
      select: {
        slotId: true,
        id: true,
        status: true,
        startTime: true,
        endTime: true,
      }
    });

    const bookedSlotIds = activeBookings
      .filter(b => b.slotId !== null)
      .map(b => b.slotId as string);

    return NextResponse.json({
      success: true,
      lotId,
      bookedSlotIds,
      count: bookedSlotIds.length,
      bookings: activeBookings.map(b => ({
        bookingId: b.id,
        slotId: b.slotId,
        status: b.status,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
      })),
      timestamp: now.toISOString(),
    });

  } catch (error: any) {
    console.error('[ACTIVE_BOOKINGS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/slots?lotId=xxx
 * 
 * Returns all slots for a parking lot with:
 *  - Current state (AVAILABLE, RESERVED, OCCUPIED, DISABLED, CLOSED)
 *  - Active booking info (if RESERVED)
 *  - AI confidence
 *  - Last update timestamp
 * 
 * Query params:
 *  - lotId: string (required)
 *  - status: string (optional filter: AVAILABLE, RESERVED, OCCUPIED)
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get('lotId');
    const statusFilter = searchParams.get('status');

    if (!lotId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: lotId' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { lotId };
    if (statusFilter) {
      where.status = statusFilter.toUpperCase();
    }

    // Fetch slots with booking info
    const slots = await prisma.slot.findMany({
      where,
      include: {
        bookings: {
          where: {
            status: { in: ['UPCOMING', 'ACTIVE'] }
          },
          select: {
            id: true,
            customerId: true,
            status: true,
            startTime: true,
            endTime: true,
            vehicleType: true,
          },
          take: 1,
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    // Count by status
    const counts = {
      total: slots.length,
      available: slots.filter(s => s.status === 'AVAILABLE').length,
      reserved: slots.filter(s => s.status === 'RESERVED').length,
      occupied: slots.filter(s => s.status === 'OCCUPIED').length,
      disabled: slots.filter(s => s.status === 'DISABLED').length,
      closed: slots.filter(s => s.status === 'CLOSED').length,
    };

    // Transform response
    const transformedSlots = slots.map(slot => {
      const activeBooking = slot.bookings?.[0] || null;
      return {
        id: slot.id,
        slot_number: slot.slotNumber,
        row: slot.row,
        display_name: slot.displayName || `${slot.row}-${slot.slotNumber}`,
        state: slot.status,
        ai_confidence: slot.aiConfidence,
        updated_by: slot.updatedBy,
        last_updated: slot.updatedAt.toISOString(),
        price: slot.price,
        slot_type: slot.slotType,
        coordinates: {
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
        },
        booking: activeBooking ? {
          id: activeBooking.id,
          user_id: activeBooking.customerId,
          status: activeBooking.status,
          start_time: activeBooking.startTime.toISOString(),
          expiry_time: activeBooking.endTime.toISOString(),
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      lotId,
      counts,
      slots: transformedSlots,
    });

  } catch (error: any) {
    console.error('[SLOTS_GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

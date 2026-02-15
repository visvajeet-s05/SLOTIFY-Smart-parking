import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SlotStatus, UpdatedBy } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { lotId, slots } = body;

    // Validate request body
    if (!lotId || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: lotId (string), slots (array)' },
        { status: 400 }
      );
    }

    // Validate each slot entry
    for (const slot of slots) {
      if (typeof slot.number !== 'number' || !slot.status) {
        return NextResponse.json(
          { error: 'Each slot must have: number (number), status (string)' },
          { status: 400 }
        );
      }
    }

    // Get current slots for this lot to check priority
    const existingSlots = await prisma.slot.findMany({
      where: { lotId },
      select: {
        id: true,
        slotNumber: true,
        status: true,
        updatedBy: true,
      },
    });

    // Create a map for quick lookup
    const slotMap = new Map(existingSlots.map(s => [s.slotNumber, s]));

    const results = {
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each slot update
    for (const slotData of slots) {
      const { number: slotNumber, status: newStatus } = slotData;

      // Map string status to enum
      const statusEnum = mapStatusToEnum(newStatus);
      if (!statusEnum) {
        results.errors.push(`Invalid status "${newStatus}" for slot ${slotNumber}`);
        continue;
      }

      const existingSlot = slotMap.get(slotNumber);
      if (!existingSlot) {
        results.errors.push(`Slot ${slotNumber} not found in lot ${lotId}`);
        continue;
      }

      // DETERMINISTIC LOGIC:
      // AI reports if a car IS THERE (OCCUPIED) or IS NOT THERE (AVAILABLE/EMPTY)
      // We then decide the actual state based on bookings if AI says it is empty.

      let finalStatus: SlotStatus = statusEnum;

      // If AI reports AVAILABLE (Empty):
      // 1. If currently DISABLED or CLOSED, preserve that status.
      // 2. If currently RESERVED or booked, preserve RESERVED.
      if (statusEnum === 'AVAILABLE') {
        if (existingSlot.status === 'DISABLED' || existingSlot.status === 'CLOSED') {
          finalStatus = existingSlot.status;
        } else {
          // Check for active bookings to maintain RESERVED status
          const activeBooking = await prisma.booking.findFirst({
            where: {
              slotId: existingSlot.id,
              status: { in: ['UPCOMING', 'ACTIVE'] }
            }
          });

          if (activeBooking) {
            finalStatus = 'RESERVED';
          }
        }
      }

      // If already correct status, skip
      if (existingSlot.status === finalStatus) {
        results.skipped++;
        continue;
      }

      try {
        // Update slot in database
        await prisma.slot.update({
          where: { id: existingSlot.id },
          data: {
            status: finalStatus,
            updatedBy: 'AI',
            aiConfidence: 95.0,
          },
        });

        // Create status log entry
        await prisma.slotStatusLog.create({
          data: {
            slotId: existingSlot.id,
            oldStatus: existingSlot.status,
            newStatus: finalStatus,
            updatedBy: 'AI',
            aiConfidence: 95.0,
          },
        });

        results.updated++;

        // Broadcast update via WebSocket
        broadcastUpdate(lotId, {
          type: 'SLOT_UPDATE',
          lotId: lotId,
          slotId: existingSlot.id,
          slotNumber: slotNumber,
          status: finalStatus,
          confidence: 95.0,
          source: 'AI',
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        results.errors.push(`Failed to update slot ${slotNumber}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return NextResponse.json({
      success: true,
      lotId,
      results,
    });

  } catch (error) {
    console.error('Error updating slots from camera:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Helper function to map string status to SlotStatus enum
function mapStatusToEnum(status: string): SlotStatus | null {
  const statusMap: Record<string, SlotStatus> = {
    'EMPTY': 'AVAILABLE',
    'OCCUPIED': 'OCCUPIED',
    'AVAILABLE': 'AVAILABLE',
    'RESERVED': 'RESERVED',
    'DISABLED': 'DISABLED',
    'CLOSED': 'CLOSED',
  };

  return statusMap[status.toUpperCase()] || null;
}

// Helper function to broadcast updates via WebSocket
function broadcastUpdate(lotId: string, data: any) {
  try {
    // Check if WebSocket server is available
    const wsPort = process.env.WS_PORT || '4000';

    // Use fetch to notify WebSocket server
    fetch(`http://localhost:${wsPort}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {
      // Silently fail if WebSocket server is not available
      // The WebSocket server will pick up DB changes on next poll
    });
  } catch {
    // WebSocket broadcast is best-effort
  }
}

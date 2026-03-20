import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SlotStatus, UpdatedBy } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * Secure Edge Data Ingestion API
 * This endpoint is used by Edge Nodes (distributed Python services) to update slot status.
 * It requires a valid edgeToken and lotId.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lotId, edgeNodeId, edgeToken, slots } = body;

    if (!lotId || !edgeToken || !edgeNodeId || !Array.isArray(slots)) {
      return NextResponse.json({ error: 'Missing required fields: lotId, edgeNodeId, edgeToken, slots' }, { status: 400 });
    }

    // 1. Authenticate Edge Node
    const parkingLot = await prisma.parkinglot.findFirst({
      where: {
        id: lotId,
        edgeNodeId: edgeNodeId,
        edgeToken: edgeToken,
      }
    });

    if (!parkingLot) {
      return NextResponse.json({ error: 'Authentication failed: Invalid lotId, edgeNodeId or edgeToken' }, { status: 401 });
    }

    // 2. Update Heartbeat
    await prisma.parkinglot.update({
      where: { id: lotId },
      data: { lastHeartbeat: new Date() }
    });

    // 3. Process Slot Updates
    const existingSlots = await prisma.slot.findMany({
      where: { lotId },
      include: {
        bookings: {
          where: { status: { in: ['UPCOMING', 'ACTIVE'] } }
        }
      }
    });

    const slotMap = new Map(existingSlots.map(s => [s.slotNumber, s]));
    const updatesToBroadcast: any[] = [];
    const results = { updated: 0, skipped: 0, errors: 0 };

    for (const slotData of slots) {
      const { number: slotNumber, status: newStatus, confidence = 95.0 } = slotData;

      const mappedStatus = mapStatusToEnum(newStatus);
      if (!mappedStatus) {
        results.errors++;
        continue;
      }

      const existingSlot = slotMap.get(slotNumber);
      if (!existingSlot) {
        results.errors++;
        continue;
      }

      // Business Logic: AI says AVAILABLE, but we check reservations
      let finalStatus: SlotStatus = mappedStatus;
      if (mappedStatus === 'AVAILABLE') {
        if (existingSlot.status === 'DISABLED' || existingSlot.status === 'CLOSED') {
          finalStatus = existingSlot.status;
        } else if (existingSlot.bookings.length > 0) {
          finalStatus = 'RESERVED';
        }
      }

      if (existingSlot.status === finalStatus) {
        results.skipped++;
        continue;
      }

      try {
        // Update DB
        await prisma.slot.update({
          where: { id: existingSlot.id },
          data: {
            status: finalStatus,
            updatedBy: 'AI',
            aiConfidence: confidence,
          },
        });

        // Log Change
        await prisma.slotStatusLog.create({
          data: {
            slotId: existingSlot.id,
            oldStatus: existingSlot.status,
            newStatus: finalStatus,
            updatedBy: 'AI',
            aiConfidence: confidence,
          },
        });

        results.updated++;

        // Queue for broadcast
        updatesToBroadcast.push({
          type: 'SLOT_UPDATE',
          lotId: lotId,
          slotId: existingSlot.id,
          slotNumber: slotNumber,
          status: finalStatus,
          confidence: confidence,
          source: 'AI',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        results.errors++;
      }
    }

    // 4. Multi-Location Broadcast
    if (updatesToBroadcast.length > 0) {
      broadcastBulkUpdate(lotId, updatesToBroadcast);
    }

    return NextResponse.json({ 
      success: true, 
      lotId, 
      edgeNodeId,
      results,
      lastHeartbeat: new Date().toISOString()
    });

  } catch (error: any) {
    const errorLog = `[${new Date().toISOString()}] Edge Update Error: ${error.message}\n${error.stack}\n`;
    fs.appendFileSync(path.join(process.cwd(), 'api_errors.log'), errorLog);
    console.error('Edge Update Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

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

function broadcastBulkUpdate(lotId: string, updates: any[]) {
  try {
    const wsPort = process.env.WS_PORT || '4000';
    fetch(`http://localhost:${wsPort}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'BULK_SLOT_UPDATE',
        lotId,
        updates
      }),
    }).catch(() => { });
  } catch { }
}

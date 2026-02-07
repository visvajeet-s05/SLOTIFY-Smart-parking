import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SlotStatus, UpdatedBy } from "@prisma/client"

// WebSocket server URL
const WS_SERVER = process.env.WS_SERVER_URL || "ws://localhost:4000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lotId, action, row, status } = body

    // Validate required fields
    if (!lotId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: lotId, action" },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ["OPEN_ALL", "CLOSE_ALL", "OPEN_ROW", "CLOSE_ROW", "MAINTENANCE_ROW", "UPDATE_STATUS"]
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      )
    }

    // Determine target status based on action
    let targetStatus: SlotStatus
    let targetRows: string[] = []

    switch (action) {
      case "OPEN_ALL":
        targetStatus = SlotStatus.AVAILABLE
        break
      case "CLOSE_ALL":
        targetStatus = SlotStatus.CLOSED
        break
      case "OPEN_ROW":
        if (!row) {
          return NextResponse.json({ error: "Row required for OPEN_ROW action" }, { status: 400 })
        }
        targetStatus = SlotStatus.AVAILABLE
        targetRows = [row]
        break
      case "CLOSE_ROW":
        if (!row) {
          return NextResponse.json({ error: "Row required for CLOSE_ROW action" }, { status: 400 })
        }
        targetStatus = SlotStatus.CLOSED
        targetRows = [row]
        break
      case "MAINTENANCE_ROW":
        if (!row) {
          return NextResponse.json({ error: "Row required for MAINTENANCE_ROW action" }, { status: 400 })
        }
        targetStatus = SlotStatus.DISABLED
        targetRows = [row]
        break
      case "UPDATE_STATUS":
        if (!status) {
          return NextResponse.json({ error: "Status required for UPDATE_STATUS action" }, { status: 400 })
        }
        targetStatus = status as SlotStatus
        if (row) targetRows = [row]
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {
      lotId: lotId,
      // Don't override RESERVED slots (customer bookings)
      status: { not: SlotStatus.RESERVED }
    }

    // Add row filter if specified
    if (targetRows.length > 0) {
      whereClause.row = { in: targetRows }
    }

    // Get slots to update
    const slotsToUpdate = await prisma.slot.findMany({
      where: whereClause
    })

    if (slotsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No slots to update (all may be RESERVED)",
        updatedCount: 0
      })
    }

    // Update all matching slots
    const updatePromises = slotsToUpdate.map(slot => 
      prisma.slot.update({
        where: { id: slot.id },
        data: {
          status: targetStatus,
          updatedBy: UpdatedBy.OWNER,
          aiConfidence: 100
        }
      })
    )

    const updatedSlots = await Promise.all(updatePromises)

    // Create status logs
    const logPromises = slotsToUpdate.map(slot =>
      prisma.slotStatusLog.create({
        data: {
          slotId: slot.id,
          oldStatus: slot.status,
          newStatus: targetStatus,
          updatedBy: UpdatedBy.OWNER,
          aiConfidence: 100
        }
      })
    )

    await Promise.all(logPromises)

    // Broadcast updates via WebSocket
    try {
      const WebSocket = (await import("ws")).default
      const ws = new WebSocket(WS_SERVER)
      
      ws.on("open", () => {
        // Send bulk update notification
        ws.send(JSON.stringify({
          type: "BULK_SLOT_UPDATE",
          lotId: lotId,
          action: action,
          status: targetStatus,
          updatedCount: updatedSlots.length,
          affectedRows: targetRows,
          timestamp: new Date().toISOString()
        }))

        // Send individual slot updates
        updatedSlots.forEach(slot => {
          ws.send(JSON.stringify({
            type: "SLOT_UPDATE",
            lotId: lotId,
            slotId: slot.id,
            status: targetStatus,
            confidence: 100,
            updatedBy: "OWNER",
            timestamp: new Date().toISOString()
          }))
        })

        ws.close()
      })

      ws.on("error", (err) => {
        console.error("WebSocket error:", err)
      })
    } catch (wsError) {
      console.error("Failed to push WebSocket updates:", wsError)
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`,
      updatedCount: updatedSlots.length,
      status: targetStatus,
      affectedRows: targetRows.length > 0 ? targetRows : "ALL"
    })

  } catch (error) {
    console.error("Error in bulk slot update:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk update" },
      { status: 500 }
    )
  }
}

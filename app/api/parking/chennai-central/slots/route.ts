import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Find Chennai Central parking lot
    const lot = await prisma.parkinglot.findUnique({
      where: { id: "chennai-central" },
      include: {
      slots: {
          orderBy: [
            { row: "asc" },
            { slotNumber: "asc" },
          ],
        },

      },
    });

    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    // Format slots for response with unified slot ID system
    const slots = lot.slots.map((slot: any) => ({
      id: slot.id,
      slotNumber: slot.slotNumber,
      row: slot.row,
      status: slot.status,
      confidence: slot.aiConfidence || 95,
      source: slot.updatedBy || "SYSTEM",
    }));

    return NextResponse.json({
      lot: {
        id: lot.id,
        name: lot.name,
        totalSlots: lot.totalSlots,
      },
      slots,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Find Chennai Central parking lot
    const lot = await prisma.parkingLot.findUnique({
      where: { slug: "chennai-central" },
      include: {
      slots: {
          orderBy: [
            { row: "asc" },
            { index: "asc" },
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
    const slots = lot.slots.map((slot) => ({
      id: slot.id,
      slotNumber: slot.slotNumber,
      slotId: slot.slotId,
      row: slot.row,
      index: slot.index,
      status: slot.status,
      confidence: slot.confidence || 95,
      source: slot.source || "SYSTEM",
    }));


    return NextResponse.json({
      lot: {
        id: lot.id,
        name: lot.name,
        slug: lot.slug,
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

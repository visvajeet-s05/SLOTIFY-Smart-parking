import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const cameraId = searchParams.get('cameraId')

    // First check if the parking lot exists
    let lot: any;
    try {
      // Use case-insensitive mode if unique find fails
      lot = await (prisma.parkinglot as any).findUnique({
        where: { id },
        select: { id: true, name: true, address: true, cameraUrl: true, cameras: { select: { id: true, name: true, url: true, createdAt: true } } }
      })

      if (!lot) {
        lot = await (prisma.parkinglot as any).findFirst({
          where: { id: { equals: id, mode: 'insensitive' } as any },
          select: { id: true, name: true, address: true, cameraUrl: true, cameras: { select: { id: true, name: true, url: true, createdAt: true } } }
        })
      }
    } catch (e) {
      console.warn("⚠️ Complex fetch failed, falling back to simple fetch...", e);
      try {
        lot = await (prisma.parkinglot as any).findUnique({
          where: { id },
          select: { id: true, name: true, address: true, cameraUrl: true }
        });
        if (lot) lot.cameras = [];
      } catch (e2) {
        console.error("❌ Critical fetch failure:", e2);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    if (!lot) {
      return NextResponse.json({ error: "Parking lot not found", lotId: id }, { status: 404 });
    }

    // Fetch all slots
    let slots: any[] = [];
    try {
      slots = await (prisma.slot as any).findMany({
        where: { lotId: { equals: lot.id, mode: 'insensitive' } as any },
        select: {
          id: true,
          lotId: true,
          slotNumber: true,
          status: true,
          price: true,
          x: true,
          y: true,
          width: true,
          height: true,
          row: true,
          slotType: true,
          cameraId: true
        },
        orderBy: { slotNumber: "asc" }
      })
    } catch (e) {
      console.error("❌ Failed to fetch slots:", e);
      // If full slot fetch fails, return empty so frontend doesn't crash
      slots = [];
    }

    // Process cameras
    const cameras = Array.isArray(lot.cameras) ? lot.cameras.sort((a: any, b: any) => {
      const timeDiff = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return timeDiff !== 0 ? timeDiff : (a.id || "").localeCompare(b.id || "");
    }) : [];

    // --- VIRTUAL CAMERA GENERATION ---
    const totalCamerasNeeded = Math.max(1, Math.ceil(slots.length / 30));
    const finalCameras = [...cameras];

    if (finalCameras.length < totalCamerasNeeded) {
      for (let i = finalCameras.length; i < totalCamerasNeeded; i++) {
        finalCameras.push({
          id: `virtual-cam-${i + 1}`,
          name: `Camera ${i + 1}`,
          url: lot.cameraUrl,
          lotId: lot.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVirtual: true
        });
      }
    }

    // --- SLOT ASSIGNMENT & GRID FALLBACK ---
    const slotsWithCamera = slots.map((slot, globalIndex) => {
      let activeSlot = { ...slot };

      if (!activeSlot.cameraId) {
        const cameraIndex = Math.floor(globalIndex / 30);
        if (cameraIndex < finalCameras.length) {
          activeSlot.cameraId = finalCameras[cameraIndex].id;
        }
      }

      const slotIndexInCamera = globalIndex % 30;
      const isMissingCoords = (activeSlot.x === null || activeSlot.x === undefined || activeSlot.x === 0) && 
                              (activeSlot.y === null || activeSlot.y === undefined || activeSlot.y === 0);

      if (isMissingCoords) {
        const GRID_COLS = 6;
        const SLOT_WIDTH = 240;
        const SLOT_HEIGHT = 140;
        const PADDING_X = 40;
        const PADDING_Y = 40;
        const START_X = 150;
        const START_Y = 150;

        const row = Math.floor(slotIndexInCamera / GRID_COLS);
        const col = slotIndexInCamera % GRID_COLS;

        activeSlot.x = START_X + (col * (SLOT_WIDTH + PADDING_X));
        activeSlot.y = START_Y + (row * (SLOT_HEIGHT + PADDING_Y));
        activeSlot.width = SLOT_WIDTH;
        activeSlot.height = SLOT_HEIGHT;
      }

      return activeSlot;
    });

    // --- FILTERING ---
    let finalSlots = slotsWithCamera;
    if (cameraId) {
      finalSlots = slotsWithCamera.filter(s => s.cameraId === cameraId);
    }

    console.log(`✅ Returning ${finalSlots.length} slots for ${id}`);

    return NextResponse.json({
      slots: finalSlots,
      cameraUrl: lot.cameraUrl,
      cameras: finalCameras,
      lot: {
        id: lot.id,
        name: lot.name,
        totalSlots: slots.length,
        address: lot.address
      }
    })



  } catch (error) {
    console.error("❌ Error fetching slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch slots", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

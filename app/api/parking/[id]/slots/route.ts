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

    // First check if the parking lot exists (with cameras fallback)
    let lot: any;
    try {
      lot = await prisma.parkinglot.findUnique({
        where: { id },
        include: { cameras: true }
      })
    } catch (e) {
      console.warn("⚠️ Prisma relation 'cameras' not ready, falling back...");
      lot = await prisma.parkinglot.findUnique({
        where: { id }
      });
      if (lot) lot.cameras = [];
    }

    if (!lot) {
      console.log("❌ Parking lot not found:", id)
      return NextResponse.json(
        { error: "Parking lot not found", lotId: id },
        { status: 404 }
      )
    }

    console.log("✅ Found parking lot:", lot.name)

    // Fetch all slots first, ordered by slotNumber
    let slots = await prisma.slot.findMany({
      where: { lotId: id },
      orderBy: { slotNumber: "asc" }
    })

    // Fetch cameras to determine implicit assignment order
    // Ensure consistent ordering of cameras (stable sort)
    const cameras = lot.cameras ? lot.cameras.sort((a: any, b: any) => {
      const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
    }) : []

    // --- VIRTUAL CAMERA GENERATION ---
    // Ensure we have enough cameras to cover all slots in batches of 30
    const totalCamerasNeeded = Math.ceil(slots.length / 30);
    const finalCameras = [...cameras];

    // If we have more batches of slots than cameras, generate virtual cameras
    if (finalCameras.length < totalCamerasNeeded) {
      for (let i = finalCameras.length; i < totalCamerasNeeded; i++) {
        finalCameras.push({
          id: `virtual-cam-${i + 1}`,
          name: `Camera ${i + 1}`,
          url: lot.cameraUrl, // Inherit main URL
          lotId: lot.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVirtual: true
        });
      }
    }

    // --- SLOT ASSIGNMENT ---
    // Implicitly assign slots to cameras in batches of 30
    const slotsWithCamera = slots.map((slot, globalIndex) => {
      let activeSlot = { ...slot };

      // Determine Camera Assignment
      // batch 0 = cam 0, batch 1 = cam 1, etc.
      // Priority: Explicit ID -> Implicit Batch ID
      if (!activeSlot.cameraId) {
        const cameraIndex = Math.floor(globalIndex / 30);
        if (cameraIndex < finalCameras.length) {
          activeSlot.cameraId = finalCameras[cameraIndex].id;
        }
      }

      // Determine Grid Position (relative to camera batch 0-29)
      const slotIndexInCamera = globalIndex % 30;

      // Generate default grid layout if coordinates represent "unconfigured" state
      if (!activeSlot.x && !activeSlot.y) {
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

    console.log(`✅ Returning ${finalSlots.length} slots for ${id}${cameraId ? ` camera ${cameraId}` : ''}`)

    // Determine return URL
    let targetCameraUrl = lot.cameraUrl
    if (cameraId) {
      const cam = finalCameras.find((c: any) => c.id === cameraId)
      if (cam && cam.url) targetCameraUrl = cam.url
    }

    return NextResponse.json({
      slots: finalSlots,
      cameraUrl: targetCameraUrl,
      cameras: finalCameras, // Return full list including virtual
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

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const cameraId = searchParams.get('cameraId') || searchParams.get('camera_id')

    // Standardized ID handling: trim and handle casing
    const targetId = id.trim();

    // First check if the parking lot exists using the same robust logic as the list API
    let lotData: any;
    try {
      // Try exact find first
      lotData = await (prisma.parkinglot as any).findUnique({
        where: { id: targetId },
        select: {
          id: true,
          name: true,
          address: true,
          cameraUrl: true,
          cameras: {
            select: {
              id: true,
              name: true,
              url: true,
              createdAt: true
            }
          },
          slots: {
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
          }
        }
      })

      // Try case-insensitive fallback if not found
      if (!lotData) {
        lotData = await (prisma.parkinglot as any).findFirst({
          where: { id: { equals: targetId, mode: 'insensitive' } as any },
          select: {
            id: true,
            name: true,
            address: true,
            cameraUrl: true,
            cameras: { select: { id: true, name: true, url: true, createdAt: true } },
            slots: {
               select: {
                id: true, lotId: true, slotNumber: true, status: true, price: true,
                x: true, y: true, width: true, height: true, row: true, slotType: true, cameraId: true
              },
              orderBy: { slotNumber: "asc" }
            }
          }
        })
      }
    } catch (e) {
      console.warn("⚠️ Complex relationship fetch failed, using direct slot query fallback...", e);
      // Even simpler fallback
      const basicLot = await (prisma.parkinglot as any).findFirst({
        where: { id: { equals: targetId, mode: 'insensitive' } as any }
      });
      
      if (basicLot) {
        const slotsFallback = await (prisma.slot as any).findMany({
            where: { lotId: { equals: basicLot.id || targetId, mode: 'insensitive' } as any },
            orderBy: { slotNumber: "asc" }
        });
        lotData = { ...basicLot, slots: slotsFallback, cameras: [] };
      }
    }

    if (!lotData) {
      console.log(`❌ No lot found for ID: ${targetId}`);
      return NextResponse.json({ error: "Parking lot not found", lotId: targetId }, { status: 404 });
    }

    const slots = lotData.slots || [];
    const cameras = Array.isArray(lotData.cameras) ? lotData.cameras.sort((a: any, b: any) => {
      const timeDiff = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return timeDiff !== 0 ? timeDiff : (a.id || "").localeCompare(b.id || "");
    }) : [];

    // --- VIRTUAL CAMERA GENERATION ---
    const totalCamerasNeeded = Math.max(1, Math.ceil(slots.length / 30));
    const finalCameras = [...cameras];

    const ROI_MAP: Record<string, any> = {
      "virtual-cam-1": { x: 0, y: 0, w: 1920, h: 1080 },
      "virtual-cam-2": { x: 0, y: 0, w: 1920, h: 600 },
      "virtual-cam-3": { x: 0, y: 480, w: 1920, h: 600 },
      "virtual-cam-4": { x: 0, y: 0, w: 960, h: 1080 },
      "virtual-cam-5": { x: 960, y: 0, w: 960, h: 1080 },
    };

    if (finalCameras.length < totalCamerasNeeded) {
      for (let i = finalCameras.length; i < totalCamerasNeeded; i++) {
        const id = `virtual-cam-${i + 1}`;
        finalCameras.push({
          id: id,
          name: `Camera ${i + 1}`,
          url: lotData.cameraUrl,
          lotId: lotData.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVirtual: true,
          roi: ROI_MAP[id] || { x: 0, y: 0, w: 1920, h: 1080 }
        });
      }
    }

    // --- SLOT ASSIGNMENT & GRID FALLBACK ---
    const slotsWithCamera = slots.map((slot: any, globalIndex: number) => {
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
        const SLOT_WIDTH = 220;
        const SLOT_HEIGHT = 160;
        const PADDING_X = 50;
        const PADDING_Y = 30;
        
        // Find the camera's ROI to center slots within it
        const targetCam = finalCameras.find(c => c.id === activeSlot.cameraId);
        const roi = targetCam?.roi || { x: 0, y: 0, w: 1920, h: 1080 };

        const row = Math.floor(slotIndexInCamera / GRID_COLS);
        const col = slotIndexInCamera % GRID_COLS;

        // Spread slots within the ROI bounds (using 80% of ROI space to avoid edges)
        const marginX = roi.w * 0.1;
        const marginY = roi.h * 0.1;

        activeSlot.x = roi.x + marginX + (col * (SLOT_WIDTH + PADDING_X));
        activeSlot.y = roi.y + marginY + (row * (SLOT_HEIGHT + PADDING_Y));
        activeSlot.width = SLOT_WIDTH;
        activeSlot.height = SLOT_HEIGHT;
      }

      return activeSlot;
    });

    // --- FILTERING ---
    let finalSlots = slotsWithCamera;
    if (cameraId) {
      finalSlots = slotsWithCamera.filter((s: any) => s.cameraId === cameraId);
    }

    console.log(`✅ Returning ${finalSlots.length} slots for ${id}`);

    return NextResponse.json({
      slots: finalSlots,
      cameraUrl: lotData.cameraUrl,
      cameras: finalCameras,
      lot: {
        id: lotData.id,
        name: lotData.name,
        totalSlots: slots.length,
        address: lotData.address
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

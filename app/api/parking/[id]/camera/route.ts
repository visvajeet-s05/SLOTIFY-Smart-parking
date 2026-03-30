import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params

    // Find parking lot with safety fallback for pending prisma generation
    let parkingLot: any;
    try {
        parkingLot = await prisma.parkinglot.findUnique({
        where: { id: lotId },
        include: {
          cameras: {
            orderBy: { createdAt: 'asc' }
          }
        },
      })
    } catch (e) {
      console.warn("⚠️ Prisma 'cameras' field not generated yet, falling back...");
      parkingLot = await prisma.parkinglot.findUnique({
        where: { id: lotId }
      });
      if (parkingLot) parkingLot.cameras = [];
    }

    if (!parkingLot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      )
    }

    // Check for virtual cameras based on slot count
    const slotCount = await prisma.slot.count({ where: { lotId: parkingLot.id } });
    const totalCamerasNeeded = Math.ceil(slotCount / 30);

    // Start with real cameras
    const finalCameras = [...(parkingLot.cameras || [])];

    // Sort real cameras to match slots API logic
    finalCameras.sort((a: any, b: any) => {
      const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
    });

    const ROI_MAP: Record<string, any> = {
      "virtual-cam-1": { x: 0, y: 0, w: 1920, h: 1080 },
      "virtual-cam-2": { x: 0, y: 0, w: 1920, h: 600 },
      "virtual-cam-3": { x: 0, y: 480, w: 1920, h: 600 },
      "virtual-cam-4": { x: 0, y: 0, w: 960, h: 1080 },
      "virtual-cam-5": { x: 960, y: 0, w: 960, h: 1080 },
    };

    // Append virtual cameras if needed
    if (finalCameras.length < totalCamerasNeeded) {
      for (let i = finalCameras.length; i < totalCamerasNeeded; i++) {
        const id = `virtual-cam-${i + 1}`;
        finalCameras.push({
          id: id,
          name: `Camera ${i + 1}`,
          url: parkingLot.cameraUrl, // Inherit main URL
          lotId: parkingLot.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVirtual: true,
          roi: ROI_MAP[id] || { x: 0, y: 0, w: 1920, h: 1080 }
        });
      }
    }

    // Return camera URL and cameras list
    return NextResponse.json({
      success: true,
      lotId: parkingLot.id,
      name: parkingLot.name,
      streamUrl: parkingLot.cameraUrl || null,
      tunnelUrl: parkingLot.ddnsDomain || null,
      hasCamera: !!(parkingLot.cameraUrl || finalCameras.length > 0),
      cameras: finalCameras
    })

  } catch (error) {
    console.error("Error fetching camera URL:", error)
    return NextResponse.json(
      { error: "Failed to fetch camera URL" },
      { status: 500 }
    )
  }
}

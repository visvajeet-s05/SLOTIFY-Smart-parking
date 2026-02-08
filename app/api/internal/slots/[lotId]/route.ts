import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  try {
    const { lotId } = await params;

    if (!lotId) {
      return NextResponse.json(
        { error: 'Missing lotId parameter' },
        { status: 400 }
      );
    }

    // Fetch parking lot with camera URL
    const parkingLot = await prisma.parkinglot.findUnique({
      where: { id: lotId },
      select: {
        id: true,
        name: true,
        cameraUrl: true,
      },
    });

    if (!parkingLot) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }

    // Fetch all slots for this parking lot with coordinates
    const slots = await prisma.slot.findMany({
      where: { lotId },
      orderBy: { slotNumber: 'asc' },
      select: {
        slotNumber: true,
        x: true,
        y: true,
        width: true,
        height: true,
        status: true,
      },
    });


    // Return in format expected by Python service
    return NextResponse.json({
      lotId: parkingLot.id,
      name: parkingLot.name,
      cameraUrl: parkingLot.cameraUrl,
      slots: slots.map((slot) => ({
        number: slot.slotNumber,
        x: slot.x || 0,
        y: slot.y || 0,
        width: slot.width || 100,
        height: slot.height || 100,
        status: slot.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching slots for lot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get('lotId');
    const edgeToken = searchParams.get('edgeToken');

    if (!lotId || !edgeToken) {
      return NextResponse.json({ error: 'Missing lotId or edgeToken' }, { status: 400 });
    }

    const lot = await prisma.parkinglot.findFirst({
      where: {
        id: lotId,
        edgeToken: edgeToken,
      },
      include: {
        slots: true,
      }
    });

    if (!lot) {
      return NextResponse.json({ error: 'Unauthorized or lot not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      lot: {
        id: lot.id,
        name: lot.name,
        cameraUrl: lot.cameraUrl,
        edgeNodeId: lot.edgeNodeId,
      },
      slots: lot.slots
    });

  } catch (error: any) {
    console.error('Edge Config Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

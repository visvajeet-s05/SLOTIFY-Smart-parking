import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Dynamic Camera URL Management API
 * GET  /api/camera/update?lotId=X&edgeToken=Y  → Returns current camera URL
 * POST /api/camera/update  → Updates camera URL for a lot (authenticated by edgeToken)
 *
 * Used by edge nodes to:
 *   1. Report their CURRENT camera URL (with dynamic IP) on startup
 *   2. Fetch latest camera URL from DB (in case admin changed it)
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lotId = searchParams.get('lotId');
  const edgeToken = searchParams.get('edgeToken');

  if (!lotId || !edgeToken) {
    return NextResponse.json({ error: 'Missing lotId or edgeToken' }, { status: 400 });
  }

  const lot = await prisma.parkinglot.findFirst({
    where: { id: lotId, edgeToken },
    select: { id: true, cameraUrl: true, ddnsDomain: true }
  });

  if (!lot) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    lotId: lot.id,
    cameraUrl: lot.cameraUrl,
    ddnsDomain: lot.ddnsDomain,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lotId, edgeToken, cameraUrl, ddnsDomain } = body;

    if (!lotId || !edgeToken) {
      return NextResponse.json({ error: 'Missing lotId or edgeToken' }, { status: 400 });
    }

    const lot = await prisma.parkinglot.findFirst({
      where: { id: lotId, edgeToken }
    });

    if (!lot) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData: any = {};
    if (cameraUrl) updateData.cameraUrl = cameraUrl;
    if (ddnsDomain) updateData.ddnsDomain = ddnsDomain;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await prisma.parkinglot.update({
      where: { id: lotId },
      data: updateData
    });

    console.log(`[Camera API] Updated ${lotId}: cameraUrl=${cameraUrl} ddnsDomain=${ddnsDomain}`);

    return NextResponse.json({
      success: true,
      lotId,
      cameraUrl: updateData.cameraUrl,
      ddnsDomain: updateData.ddnsDomain,
    });

  } catch (error: any) {
    console.error('[Camera Update] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

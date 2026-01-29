import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const maintenance = await prisma.maintenance.findMany({
      where: { ownerId: session.user.id },
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parkingLotId, title, startTime, endTime } = await request.json();

    if (!parkingLotId || !title || !startTime || !endTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        ownerId: session.user.id,
        parkingLotId,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

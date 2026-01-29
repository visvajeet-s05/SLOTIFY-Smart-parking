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

    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    const incidents = await prisma.incident.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!ownerProfile) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 });
    }

    const { description, parkingId } = await request.json();

    if (!description || !parkingId) {
      return NextResponse.json({ error: 'Description and parkingId are required' }, { status: 400 });
    }

    const incident = await prisma.incident.create({
      data: {
        ownerId: session.user.id,
        parkingId,
        description,
      },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

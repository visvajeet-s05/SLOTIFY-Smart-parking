import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'

const prisma = new PrismaClient()

// POST /api/staff - Add new staff member (for owners)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, role } = await request.json()
    const owner = await prisma.ownerprofile.findUnique({
      where: { userId: session.user.id },
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 })
    }

    // Check if email already exists
    const existingStaff = await prisma.ownerstaff.findFirst({
      where: { ownerId: owner.id, email }
    })

    if (existingStaff) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Create staff member
    const staff = await prisma.ownerstaff.create({
      data: {
        id: crypto.randomUUID(),
        ownerId: owner.id,
        name,
        email,
        role: role?.toUpperCase() || 'SCANNER',
      }
    })

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/staff - List staff for owner
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const owner = await prisma.ownerprofile.findUnique({
      where: { userId: session.user.id },
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 404 })
    }

    const staff = await prisma.ownerstaff.findMany({
      where: { ownerId: owner.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

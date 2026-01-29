import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

// POST /api/staff - Add new staff member (for owners)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, role } = await request.json()

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email }
    })

    if (existingStaff) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        ownerId: session.user.ownerId,
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status
      },
      tempPassword // In real app, send via email
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
    if (!session?.user?.ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await prisma.staff.findMany({
      where: { ownerId: session.user.ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
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

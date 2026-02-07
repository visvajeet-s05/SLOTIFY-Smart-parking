import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/staff/[id] - Update staff status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status, active } = await request.json()
    const { id: staffId } = await params

    // Get owner ID from auth (simplified for now)
    const ownerId = request.headers.get('owner-id')

    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff belongs to owner
    const staff = await prisma.ownerstaff.findFirst({
      where: {
        id: staffId,
        ownerId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // Update status
    const isActive =
      typeof active === "boolean" ? active : (status || "").toUpperCase() === "ACTIVE"

    const updatedStaff = await prisma.ownerstaff.update({
      where: { id: staffId },
      data: { active: isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true
      }
    })

    return NextResponse.json({ staff: updatedStaff })
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

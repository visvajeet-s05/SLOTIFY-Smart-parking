import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/staff/[id] - Update staff status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const staffId = params.id

    // Get owner ID from auth (simplified for now)
    const ownerId = request.headers.get('owner-id')

    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff belongs to owner
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        ownerId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // Update status
    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: { status: status.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    })

    // Log activity
    await prisma.staffActivity.create({
      data: {
        staffId,
        action: `Status changed to ${status.toUpperCase()}`
      }
    })

    return NextResponse.json({ staff: updatedStaff })
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

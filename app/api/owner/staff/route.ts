import { prisma } from "../../../../lib/prisma"
import { getUserFromSession } from "../../../../lib/auth"

export async function POST(req: Request) {
  const user = await getUserFromSession()
  const { email, role } = await req.json()

  const staff = await prisma.staff.create({
    data: {
      ownerId: user!.id,
      email,
      role,
    },
  })

  return Response.json(staff)
}

export async function GET() {
  const user = await getUserFromSession()
  const staff = await prisma.staff.findMany({
    where: { ownerId: user!.id },
  })
  return Response.json(staff)
}

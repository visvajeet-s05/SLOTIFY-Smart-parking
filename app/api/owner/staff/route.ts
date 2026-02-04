import { prisma } from "../../../../lib/prisma"
import { getUserFromSession } from "../../../../lib/auth"
import crypto from "crypto"

export async function POST(req: Request) {
  const user = await getUserFromSession()
  const { email, role, name } = await req.json()
  const owner = await prisma.ownerprofile.findUnique({
    where: { userId: user!.id },
  })

  if (!owner) {
    return new Response("Owner profile not found", { status: 404 })
  }

  const staff = await prisma.ownerstaff.create({
    data: {
      id: crypto.randomUUID(),
      ownerId: owner.id,
      name: name || email?.split("@")[0] || "Staff",
      email,
      role,
    },
  })

  return Response.json(staff)
}

export async function GET() {
  const user = await getUserFromSession()
  const owner = await prisma.ownerprofile.findUnique({
    where: { userId: user!.id },
  })

  if (!owner) {
    return new Response("Owner profile not found", { status: 404 })
  }

  const staff = await prisma.ownerstaff.findMany({
    where: { ownerId: owner.id },
  })
  return Response.json(staff)
}

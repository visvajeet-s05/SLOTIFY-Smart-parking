import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new Response("Unauthorized", { status: 401 })

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!ownerProfile) return new Response("Owner profile not found", { status: 404 })

  const { subject, message } = await req.json()

  const ticket = await prisma.ownerSupportTicket.create({
    data: {
      ownerId: ownerProfile.id,
      subject,
      message,
    },
  })

  return Response.json(ticket)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return new Response("Unauthorized", { status: 401 })

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!ownerProfile) return new Response("Owner profile not found", { status: 404 })

  const tickets = await prisma.ownerSupportTicket.findMany({
    where: { ownerId: ownerProfile.id },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(tickets)
}

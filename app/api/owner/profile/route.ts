import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response("Unauthorized", { status: 401 })

  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    include: { ownerverification: true, parkingsetupprogress: true },
  })

  return Response.json(owner)
}

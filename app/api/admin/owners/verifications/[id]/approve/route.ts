import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = params

  await prisma.ownerverification.update({
    where: { id },
    data: {
      reviewedAt: new Date(),
      reviewedByAdmin: session.user.id,
      rejectionReason: null,
    },
  })

  const verification = await prisma.ownerverification.findUnique({
    where: { id },
    include: { owner: true },
  })

  if (verification) {
    await prisma.ownerprofile.update({
      where: { id: verification.ownerId },
      data: { status: "APPROVED" },
    })
  }

  return Response.json({ success: true })
}

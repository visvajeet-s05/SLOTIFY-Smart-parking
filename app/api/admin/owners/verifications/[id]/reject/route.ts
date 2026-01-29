import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = params

  await prisma.ownerVerification.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  })

  const verification = await prisma.ownerVerification.findUnique({
    where: { id },
  })

  if (verification) {
    await prisma.ownerProfile.update({
      where: { id: verification.ownerId },
      data: { status: "KYC_REJECTED" },
    })
  }

  return Response.json({ success: true })
}

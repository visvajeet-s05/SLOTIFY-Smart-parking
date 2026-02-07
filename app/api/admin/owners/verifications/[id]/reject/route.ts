import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params


  await prisma.ownerverification.update({
    where: { id },
    data: {
      reviewedByAdmin: session.user.id,
      reviewedAt: new Date(),
      rejectionReason: "Rejected by admin",
    },
  })

  const verification = await prisma.ownerverification.findUnique({
    where: { id },
  })

  if (verification) {
    await prisma.ownerprofile.update({
      where: { id: verification.ownerId },
      data: { status: "KYC_REJECTED" },
    })
  }

  return Response.json({ success: true })
}

import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  const verifications = await prisma.ownerverification.findMany({
    include: {
      ownerprofile: {
        include: {
          user: true
        }
      }
    }
  })

  return Response.json(verifications)
}

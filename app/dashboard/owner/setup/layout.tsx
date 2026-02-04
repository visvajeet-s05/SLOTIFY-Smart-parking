import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import crypto from "crypto"

export default async function SetupLayout({ children }: any) {
  const user = await getCurrentUser()

  const owner = await prisma.ownerprofile.findUnique({
    where: { userId: user.id },
    include: { parkinglot: true },
  })

  const lot = owner?.parkinglot[0]

  if (!lot) {
    // Create draft parking lot
    await prisma.parkinglot.create({
      data: {
        id: crypto.randomUUID(),
        ownerId: owner!.id,
        name: "",
        address: "",
        lat: 0,
        lng: 0,
        status: "DRAFT",
        updatedAt: new Date(),
      },
    })
    redirect("/dashboard/owner/setup/location")
  }

  redirect("/dashboard/owner/setup/location")
}

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export default async function SetupLayout({ children }: any) {
  const user = await getCurrentUser()

  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: user.id },
    include: { parkingLots: true },
  })

  const lot = owner?.parkingLots[0]

  if (!lot) {
    // Create draft parking lot
    const newLot = await prisma.parkingLot.create({
      data: {
        ownerId: owner!.id,
        name: "",
        address: "",
        lat: 0,
        lng: 0,
        status: "DRAFT",
        step: "LOCATION",
      },
    })
    redirect("/dashboard/owner/setup/location")
  }

  redirect(`/dashboard/owner/setup/${lot.step.toLowerCase()}`)
}

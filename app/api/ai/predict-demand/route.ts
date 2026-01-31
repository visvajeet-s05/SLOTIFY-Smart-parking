import { prisma } from "@/lib/prisma"
import { predictDemand } from "@/lib/ai/demandPredictor"

export async function POST() {
  const parkings = await prisma.parkinglot.findMany()

  for (const parking of parkings) {
    const bookings = await prisma.booking.findMany({
      where: { parkingLotId: parking.id },
    })

    const hourlyCounts = Array(24).fill(0)
    bookings.forEach(b => {
      hourlyCounts[b.startTime.getHours()]++
    })

    for (let hour = 0; hour < 24; hour++) {
      const score = predictDemand({
        historicalBookings: hourlyCounts,
        hour,
        dayOfWeek: new Date().getDay(),
      })

      await prisma.demandPrediction.create({
        data: {
          parkingId: parking.id,
          hour,
          date: new Date(),
          demandScore: score,
        },
      })
    }
  }

  return Response.json({ success: true })
}
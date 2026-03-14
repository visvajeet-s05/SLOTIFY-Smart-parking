import { prisma } from "@/lib/prisma"

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))

  if (!lat || !lng) {
    return new Response("Missing location", { status: 400 })
  }

  // Fetch nearby parking lots
  let parkingLots: any[] = []
  try {
    parkingLots = await prisma.parkinglot.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        cameraUrl: true,
        edgeNodeId: true,
        lastHeartbeat: true,
        slots: {
          select: { id: true, status: true, price: true }
        }
      }
    })
  } catch (e) {
    console.warn("⚠️ Nearby complex search failed, falling back...", e);
    parkingLots = await prisma.parkinglot.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        cameraUrl: true,
        slots: {
          select: { id: true, status: true, price: true }
        }
      }
    })
  }

  const nearby = parkingLots.filter((p) => {
    const distance = getDistanceKm(lat, lng, p.lat, p.lng)
    return distance <= 25
  })

  return Response.json(nearby)
}
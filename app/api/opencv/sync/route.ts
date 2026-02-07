import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  const data = await fetch("http://localhost:5000/slots-status").then(res => res.json());

  for (const slotId in data) {
    await prisma.slot.update({
      where: { id: slotId },
      data: {
        status: data[slotId] === "OCCUPIED" ? "OCCUPIED" : "AVAILABLE"
      }
    });
  }

  return Response.json({ success: true });
}

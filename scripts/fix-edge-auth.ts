import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lotId = "CHENNAI_CENTRAL";
  const edgeNodeId = "edge-chennai-central-01";
  const edgeToken = "token-chennai-central-secret";

  console.log(`Updating lot ${lotId} with edge authentication credentials...`);

  const updatedLot = await prisma.parkinglot.update({
    where: { id: lotId },
    data: {
      edgeNodeId,
      edgeToken,
    },
  });

  console.log("Successfully updated parking lot:", updatedLot.id);
  console.log("Edge Node ID:", updatedLot.edgeNodeId);
  console.log("Edge Token:", updatedLot.edgeToken);

  // Optional: Reset all slots to AVAILABLE for this lot to clear seeded OCCUPIED states
  console.log(`Resetting all slots in ${lotId} to AVAILABLE...`);
  const resetResult = await prisma.slot.updateMany({
    where: { lotId },
    data: {
      status: "AVAILABLE",
      updatedBy: "SYSTEM",
    },
  });
  console.log(`Reset ${resetResult.count} slots.`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

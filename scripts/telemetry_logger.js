const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// This script simulates a CRON job that runs every 10 minutes to snapshot parking lot occupancy
// into the `demandprediction` table, building a historical time-series dataset.

async function logTelemetry() {
  console.log(`[${new Date().toISOString()}] Telemetry Logger: Snapshotting parking occupancy...`);
  
  try {
    const lots = await prisma.parkinglot.findMany({
      where: { status: 'ACTIVE' },
      include: { slots: true }
    });

    const now = new Date();
    const hour = now.getHours();
    
    let logsCreated = 0;

    for (const lot of lots) {
      if (!lot.slots || lot.slots.length === 0) continue;

      const totalSlots = lot.slots.length;
      const occupiedSlots = lot.slots.filter(s => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
      const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) : 0;

      // Log the real-time fraction to the prediction table
      await prisma.demandprediction.create({
        data: {
          id: `telemetry_${lot.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          parkingId: lot.id,
          hour: hour,
          date: now,
          demandScore: occupancyRate,
          createdAt: now
        }
      });
      logsCreated++;
    }

    console.log(`[${new Date().toISOString()}] Telemetry Logger: Safely saved ${logsCreated} records.`);

  } catch (error) {
    console.error('Telemetry Logger Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// In production, this would be a CRON. Here we export it, and allow running it manually.
if (require.main === module) {
  logTelemetry()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { logTelemetry };

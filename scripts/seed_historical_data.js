const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding historical parking data for PTPI simulation...');

  // Get all lots
  let lots = await prisma.parkinglot.findMany({
    where: {
      status: 'ACTIVE'
    }
  });

  if (lots.length === 0) {
    console.log('No active parking lots found. Fetching any lot...');
    lots = await prisma.parkinglot.findMany();
    if (lots.length === 0) {
        console.error('No parking lots exist in DB.');
        return;
    }
  }
  
  // Clear old predictions
  console.log('Emptying old demand predictions...');
  await prisma.demandprediction.deleteMany();

  const today = new Date();
  const daysToGenerate = 30; // 30 days of synthetic data
  let totalSeeded = 0;

  for (let i = 0; i < daysToGenerate; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - i);
    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const lot of lots) {
      const peakHours = isWeekend 
        ? [12, 13, 14, 15, 16, 17, 18, 19, 20] 
        : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

      const hourlyData = [];

      for (let hour = 0; hour < 24; hour++) {
        const isPeak = peakHours.includes(hour);
        
        // Base occupancy + randomness
        let occupancyRate = 0;
        if (isPeak) {
          occupancyRate = 0.6 + (Math.random() * 0.35);
        } else if (hour >= 0 && hour <= 6) {
          occupancyRate = Math.random() * 0.1;
        } else {
          occupancyRate = 0.2 + (Math.random() * 0.3);
        }

        hourlyData.push({
          id: `pred_${lot.id}_day${i}_hr${hour}_${Math.random().toString(36).substr(2, 5)}`,
          parkingId: lot.id,
          hour: hour,
          date: targetDate,
          demandScore: occupancyRate,
          createdAt: new Date()
        });
        totalSeeded++;
      }

      await prisma.demandprediction.createMany({
        data: hourlyData
      });
    }
  }

  console.log(`Successfully seeded ${totalSeeded} historical demand records for prediction engine.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

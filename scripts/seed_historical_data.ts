import { PrismaClient } from '@prisma/client';
import { subDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding historical parking data for PTPI simulation...');

  // Get all lots
  const lots = await prisma.parkinglot.findMany({
    where: {
      status: 'ACTIVE'
    }
  });

  if (lots.length === 0) {
    console.error('No active parking lots found. Getting all lots instead...');
    const allLots = await prisma.parkinglot.findMany();
    if (allLots.length === 0) {
        console.error('No parking lots found at all in DB.');
        return;
    }
    lots.push(...allLots);
  }
  
  // Clear old predictions to avoid dupes if re-run
  console.log('Emptying old demand predictions...');
  await prisma.demandprediction.deleteMany();

  const today = new Date();
  const daysToGenerate = 30; // 30 days of synthetic data

  let totalSeeded = 0;

  for (let i = 0; i < daysToGenerate; i++) {
    const targetDate = subDays(today, i);
    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const lot of lots) {
      // Create synthetic demand curve
      // Weekdays: High 9 AM - 6 PM
      // Weekends: High 12 PM - 8 PM
      const peakHours = isWeekend 
        ? [12, 13, 14, 15, 16, 17, 18, 19, 20] 
        : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

      const hourlyData = [];

      for (let hour = 0; hour < 24; hour++) {
        const isPeak = peakHours.includes(hour);
        
        // Base occupancy + randomness
        let occupancyRate = 0;
        if (isPeak) {
          // 60% to 95% full during peaks
          occupancyRate = 0.6 + (Math.random() * 0.35);
        } else if (hour >= 0 && hour <= 6) {
          // Night time: very empty (0% to 10%)
          occupancyRate = Math.random() * 0.1;
        } else {
          // Shoulder hours: 20% to 50%
          occupancyRate = 0.2 + (Math.random() * 0.3);
        }

        hourlyData.push({
          id: `pred_${lot.id}_day${i}_hr${hour}`,
          parkingId: lot.id,
          hour: hour,
          date: targetDate,
          demandScore: occupancyRate,
        });
        totalSeeded++;
      }

      // Batch insert for performance
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

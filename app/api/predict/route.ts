import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

type PredictionResult = {
  lotId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  totalSlots: number;
  predictedOccupied: number;
  predictedAvailable: number;
  occupancyRate: number;
  currentPrice: number;
  distanceKm: number | null;
  congestionScore: number;
  recommendationScore?: number;
  co2SavedKg?: number;
  isCityHub?: boolean;
  suggestMultiModal?: boolean;
};

export async function POST(request: Request) {
  try {
    const { targetTime, destLat, destLng } = await request.json();

    if (!targetTime) {
      return NextResponse.json({ error: 'targetTime is required' }, { status: 400 });
    }

    const targetDate = new Date(targetTime);
    const targetHour = targetDate.getHours();
    const targetDayOfWeek = targetDate.getDay();

    // 1. Fetch available active parking lots
    const lots = await prisma.parkinglot.findMany({
      where: { status: 'ACTIVE' },
      include: {
        slots: true,
        pricingrule: true
      }
    });

    if (lots.length === 0) {
      return NextResponse.json({ success: false, error: 'No active parking lots found' }, { status: 404 });
    }

    // 2. Fetch historical demand data for the target hour
    const demandHistory = await prisma.demandprediction.findMany({
      where: {
        hour: targetHour
      }
    });

    const predictions: PredictionResult[] = [];

    for (const lot of lots) {
      // Filter history for this lot, matching the day of the week
      const lotHistory = demandHistory.filter(h => 
        h.parkingId === lot.id && 
        new Date(h.date).getDay() === targetDayOfWeek
      );

      // Query the Python Machine Learning Model
      let predictedOccupancyRate = 0;
      try {
        const pyRes = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lotId: lot.id, targetTime: targetDate.toISOString() })
        });
        
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          predictedOccupancyRate = pyData.occupancyRate;
        } else {
          // Fallback heuristic if ML model fails or has insufficient data
          predictedOccupancyRate = (targetDayOfWeek === 0 || targetDayOfWeek === 6) ? 0.4 : 0.6;
        }
      } catch (e) {
        console.error("Failed to reach Python ML Service, using fallback heuristic.", e);
        predictedOccupancyRate = (targetDayOfWeek === 0 || targetDayOfWeek === 6) ? 0.4 : 0.6;
      }

      const totalSlots = lot.slots.length || lot.totalSlots || 100;
      const predictedOccupied = Math.round(totalSlots * predictedOccupancyRate);
      const predictedAvailable = Math.max(0, totalSlots - predictedOccupied);

      let distanceKm = null;
      if (destLat && destLng) {
        distanceKm = calculateDistance(destLat, destLng, lot.lat, lot.lng);
      }

      // Mock Congestion Score based on time of day to simulate traffic integration (0.0 to 1.0)
      let congestionScore = 0.2;
      if (targetDayOfWeek > 0 && targetDayOfWeek < 6) {
        if (targetHour >= 8 && targetHour <= 10) congestionScore = 0.8;
        if (targetHour >= 17 && targetHour <= 19) congestionScore = 0.9;
      } else {
        if (targetHour >= 12 && targetHour <= 20) congestionScore = 0.6;
      }

      predictions.push({
        lotId: lot.id,
        name: lot.name,
        address: lot.address,
        lat: lot.lat,
        lng: lot.lng,
        totalSlots,
        predictedOccupied,
        predictedAvailable,
        occupancyRate: predictedOccupancyRate,
        currentPrice: lot.pricingrule[0]?.currentPrice || lot.slots[0]?.price || 50,
        distanceKm: distanceKm ? Number(distanceKm.toFixed(2)) : null,
        congestionScore,
        co2SavedKg: 0, // Will be computed in recommendation step
        isCityHub: lot.totalSlots >= 100, // Large lots act as transit hubs
        suggestMultiModal: false
      });
    }

    // 3. Score and sort predictions to recommend the best option
    predictions.forEach(p => {
      // Closer is better
      const maxDistance = 10; // normalize over 10km
      const distScore = p.distanceKm ? Math.max(0, 1 - (p.distanceKm / maxDistance)) : 0.5;
      
      // More available slots is better
      const availScore = 1 - p.occupancyRate;
      
      // Less congested routing is better
      const trafficScore = 1 - p.congestionScore;

      // Algorithm: We emphasize Availability and Distance equally, but apply traffic as a strong factor
      const score = (distScore * 0.4) + (availScore * 0.4) + (trafficScore * 0.2);
      p.recommendationScore = Number(score.toFixed(3));
      
      // Calculate CO2 Saved: Based on reducing 10 to 15 mins of idle cruising traffic time 
      // (Average car emits ~0.4 kg CO2 per mile / ~0.1 kg per idling minute. Cruising uses both).
      // We attribute higher savings to choices that avoid high congestion scoring loops.
      const baseSearchMinsSaved = 12; // Base 12 mins saved by pre-planning
      const trafficMultiplier = 1 + (0.5 * Number(availScore)); // Better availability = less circling = more savings
      // If the destination is highly congested but this lot is a hub a little further out,
      // boost its score and suggest Multi-Modal.
      if (trafficScore < 0.3 && p.isCityHub && p.distanceKm && p.distanceKm > 1) {
        p.recommendationScore += 0.15; // Hub bonus
        p.suggestMultiModal = true;
      }
    });

    predictions.sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

    return NextResponse.json({
      success: true,
      data: {
        targetTime,
        predictions,
        recommended: predictions.length > 0 ? predictions[0] : null
      }
    });

  } catch (error: any) {
    console.error('PTPI Prediction error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

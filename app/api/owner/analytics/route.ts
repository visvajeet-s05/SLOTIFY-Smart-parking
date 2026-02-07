import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lotSlug = searchParams.get("lotSlug") || "chennai-central";
    const days = parseInt(searchParams.get("days") || "7");

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Find the parking lot
    const lot = await prisma.parkingLot.findUnique({
      where: { slug: lotSlug },
      include: {
        slots: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { error: `Parking lot not found: ${lotSlug}` },
        { status: 404 }
      );
    }

    // Fetch status logs separately for all slots in this lot
    const slotIds = lot.slots.map(s => s.id);
    const statusLogs = await prisma.slotStatusLog.findMany({
      where: {
        slotId: { in: slotIds },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group status logs by slot
    const statusLogsBySlot = new Map<string, typeof statusLogs>();
    statusLogs.forEach(log => {
      if (!statusLogsBySlot.has(log.slotId)) {
        statusLogsBySlot.set(log.slotId, []);
      }
      statusLogsBySlot.get(log.slotId)!.push(log);
    });

    // Attach status logs to slots
    lot.slots = lot.slots.map(slot => ({
      ...slot,
      statusLogs: statusLogsBySlot.get(slot.id) || [],
    })) as any;


    // Calculate analytics
    const analytics = {
      overview: calculateOverview(lot),
      peakHours: calculatePeakHours(lot, startDate),
      occupancyTrends: calculateOccupancyTrends(lot, days),
      revenue: calculateRevenue(lot, days),
      aiAccuracy: calculateAIAccuracy(lot, startDate),
      customerMetrics: calculateCustomerMetrics(lot, startDate),
    };

    return NextResponse.json({
      success: true,
      lotSlug,
      period: `${days} days`,
      generatedAt: new Date().toISOString(),
      analytics,
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}

// Calculate overview metrics
function calculateOverview(lot: any) {
  const totalSlots = lot.slots.length;
  const occupiedSlots = lot.slots.filter((s: any) => s.status === "OCCUPIED").length;
  const availableSlots = lot.slots.filter((s: any) => s.status === "AVAILABLE").length;
  const reservedSlots = lot.slots.filter((s: any) => s.status === "RESERVED").length;
  
  const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

  return {
    totalSlots,
    occupiedSlots,
    availableSlots,
    reservedSlots,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
    avgConfidence: calculateAverageConfidence(lot.slots),
  };
}

// Calculate average AI confidence
function calculateAverageConfidence(slots: any[]) {
  const aiUpdates = slots.filter((s: any) => s.source === "AI" && s.confidence > 0);
  if (aiUpdates.length === 0) return 0;
  
  const totalConfidence = aiUpdates.reduce((sum: number, s: any) => sum + s.confidence, 0);
  return Math.round((totalConfidence / aiUpdates.length) * 100) / 100;
}

// Calculate peak hours (24-hour breakdown)
function calculatePeakHours(lot: any, startDate: Date) {
  const hourCounts = new Array(24).fill(0);
  const hourOccupancy = new Array(24).fill(0);

  lot.slots.forEach((slot: any) => {
    slot.statusLogs.forEach((log: any) => {
      if (log.createdAt >= startDate && log.newStatus === "OCCUPIED") {
        const hour = new Date(log.createdAt).getHours();
        hourCounts[hour]++;
      }
    });
  });

  // Find peak hour
  let peakHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });

  return {
    hourlyData: hourCounts.map((count, hour) => ({
      hour,
      count,
      label: `${hour}:00 - ${hour + 1}:00`,
    })),
    peakHour,
    peakHourLabel: `${peakHour}:00 - ${peakHour + 1}:00`,
    peakOccupancy: maxCount,
  };
}

// Calculate occupancy trends over time
function calculateOccupancyTrends(lot: any, days: number) {
  const trends = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    // Count status changes for this date
    const dayLogs = lot.slots.flatMap((s: any) => 
      s.statusLogs.filter((log: any) => 
        log.createdAt.toISOString().startsWith(dateStr)
      )
    );

    const occupiedCount = dayLogs.filter((l: any) => l.newStatus === "OCCUPIED").length;
    const availableCount = dayLogs.filter((l: any) => l.newStatus === "AVAILABLE").length;

    trends.push({
      date: dateStr,
      occupied: occupiedCount,
      available: availableCount,
      total: occupiedCount + availableCount,
    });
  }

  return trends;
}

// Calculate revenue metrics
function calculateRevenue(lot: any, days: number) {
  const bookings = lot.slots
    .filter((s: any) => s.booking)
    .map((s: any) => s.booking);

  const totalBookings = bookings.length;
  const totalRevenue = totalBookings * lot.priceHr; // Simplified calculation
  
  const avgRevenuePerDay = totalRevenue / days;
  const avgBookingsPerDay = totalBookings / days;

  return {
    totalRevenue,
    totalBookings,
    avgRevenuePerDay: Math.round(avgRevenuePerDay * 100) / 100,
    avgBookingsPerDay: Math.round(avgBookingsPerDay * 100) / 100,
    pricePerHour: lot.priceHr,
    estimatedMonthlyRevenue: avgRevenuePerDay * 30,
  };
}

// Calculate AI accuracy metrics
function calculateAIAccuracy(lot: any, startDate: Date) {
  let correctPredictions = 0;
  let totalPredictions = 0;

  lot.slots.forEach((slot: any) => {
    const aiLogs = slot.statusLogs.filter(
      (log: any) => log.source === "AI" && log.createdAt >= startDate
    );

    aiLogs.forEach((aiLog: any) => {
      totalPredictions++;
      
      // Check if there was a subsequent OWNER update that confirms/disproves AI
      const subsequentOwnerLog = slot.statusLogs.find(
        (log: any) => 
          log.source === "OWNER" && 
          log.createdAt > aiLog.createdAt &&
          log.createdAt.getTime() - aiLog.createdAt.getTime() < 5 * 60 * 1000 // Within 5 minutes
      );

      if (subsequentOwnerLog) {
        // If owner didn't change the status, AI was correct
        if (subsequentOwnerLog.newStatus === aiLog.newStatus) {
          correctPredictions++;
        }
      } else {
        // No owner override, assume AI was correct
        correctPredictions++;
      }
    });
  });

  const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

  return {
    totalPredictions,
    correctPredictions,
    accuracy: Math.round(accuracy * 100) / 100,
    confidence: calculateAverageConfidence(lot.slots),
  };
}

// Calculate customer metrics
function calculateCustomerMetrics(lot: any, startDate: Date) {
  const bookings = lot.slots
    .filter((s: any) => s.booking)
    .map((s: any) => s.booking);

  const uniqueCustomers = new Set(bookings.map((b: any) => b.userId)).size;
  const repeatCustomers = bookings.length > uniqueCustomers 
    ? bookings.length - uniqueCustomers 
    : 0;

  return {
    totalCustomers: uniqueCustomers,
    repeatCustomers,
    repeatRate: bookings.length > 0 ? Math.round((repeatCustomers / bookings.length) * 100) : 0,
    avgBookingDuration: 2.5, // Hours - would calculate from actual data
  };
}

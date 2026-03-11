import { NextResponse } from 'next/server';

/**
 * AI Parking Reservation Time Prediction
 * 
 * Research Issue: Users typically overbook their parking time out of anxiety.
 * This leads to artificial congestion because the system thinks the slot will be occupied 
 * for 4 hours when it will actually only be occupied for 2.
 * 
 * Solution: If a user tries to book for an extended period, this AI engine (heuristic simulation 
 * for prototyping) analyzes the venue type, day of week, and time of day to suggest a more 
 * accurate duration, freeing up system capacity and saving the user money.
 */
export async function POST(request: Request) {
  try {
    const { intendedDurationHrs, targetTime, parkingLotId } = await request.json();

    if (!intendedDurationHrs) {
      return NextResponse.json({ error: 'intendedDurationHrs is required' }, { status: 400 });
    }

    // Default: no change needed
    let suggestedHrs = intendedDurationHrs;
    let savingsMessage = null;

    // Simulation Heuristic:
    // If someone books for more than 3 hours, analyze it.
    if (intendedDurationHrs > 3) {
      
      // Simulate that "Malls" on weekends average 3.5 hrs max,
      // and "Street" parking during weekdays averages 1.5 hrs max.
      const date = targetTime ? new Date(targetTime) : new Date();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Mock prediction values
      if (isWeekend) {
         // Weekend average stay is 3.5 hrs
         suggestedHrs = Math.min(intendedDurationHrs, 3.5);
      } else {
         // Weekday average stay is 2.5 hrs
         suggestedHrs = Math.min(intendedDurationHrs, 2.5);
      }

      // If our AI predicts they need less time than they asked for:
      if (suggestedHrs < intendedDurationHrs) {
        const hrsSaved = intendedDurationHrs - suggestedHrs;
        savingsMessage = `Our AI predicts users at this location only stay for ${suggestedHrs} hours. Adjusting your booking could save you money and free up space earlier!`;
      }
    }

    return NextResponse.json({
      intendedDurationHrs,
      suggestedDurationHrs: suggestedHrs,
      difference: intendedDurationHrs - suggestedHrs,
      hasOptimized: suggestedHrs < intendedDurationHrs,
      message: savingsMessage
    });

  } catch (error: any) {
    console.error('Duration Prediction error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

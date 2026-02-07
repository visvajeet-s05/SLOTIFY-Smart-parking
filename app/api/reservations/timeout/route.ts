import { NextRequest, NextResponse } from "next/server";
import { 
  createReservation, 
  cancelReservation, 
  completeReservation,
  checkReservationTimeout,
  getActiveReservations,
  getReservation,
  hasActiveReservation 
} from "@/lib/reservation-manager";

/**
 * POST /api/reservations/timeout
 * Create a new reservation with timeout
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotId, userId } = body;

    if (!slotId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: slotId, userId" },
        { status: 400 }
      );
    }

    // Check if slot already has an active reservation
    if (hasActiveReservation(slotId)) {
      return NextResponse.json(
        { error: "Slot already has an active reservation" },
        { status: 409 }
      );
    }

    const reservation = await createReservation(slotId, userId);

    return NextResponse.json({
      success: true,
      reservation: {
        slotId: reservation.slotId,
        reservedAt: reservation.reservedAt,
        expiresAt: reservation.expiresAt,
        expiresInMinutes: 15,
      },
      message: "Reservation created successfully. Expires in 15 minutes.",
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reservations/timeout
 * Cancel a reservation
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("slotId");

    if (!slotId) {
      return NextResponse.json(
        { error: "Missing required parameter: slotId" },
        { status: 400 }
      );
    }

    const cancelled = await cancelReservation(slotId);

    if (!cancelled) {
      return NextResponse.json(
        { error: "No active reservation found for this slot" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      { error: "Failed to cancel reservation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reservations/timeout
 * Get reservation status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("slotId");

    if (slotId) {
      // Get specific reservation
      const reservation = getReservation(slotId);
      
      if (!reservation) {
        return NextResponse.json(
          { error: "No active reservation found" },
          { status: 404 }
        );
      }

      const now = new Date();
      const timeRemaining = Math.max(0, reservation.expiresAt.getTime() - now.getTime());
      const minutesRemaining = Math.floor(timeRemaining / 60000);
      const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);

      return NextResponse.json({
        reservation: {
          slotId: reservation.slotId,
          userId: reservation.userId,
          reservedAt: reservation.reservedAt,
          expiresAt: reservation.expiresAt,
          timeRemaining: {
            minutes: minutesRemaining,
            seconds: secondsRemaining,
            totalMilliseconds: timeRemaining,
          },
        },
      });
    } else {
      // Get all active reservations
      const reservations = getActiveReservations();
      
      return NextResponse.json({
        count: reservations.length,
        reservations: reservations.map(r => ({
          slotId: r.slotId,
          userId: r.userId,
          reservedAt: r.reservedAt,
          expiresAt: r.expiresAt,
        })),
      });
    }
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reservations/timeout
 * Complete a reservation (convert to booking)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json(
        { error: "Missing required field: slotId" },
        { status: 400 }
      );
    }

    const completed = await completeReservation(slotId);

    if (!completed) {
      return NextResponse.json(
        { error: "No active reservation found for this slot" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reservation completed successfully",
    });
  } catch (error) {
    console.error("Error completing reservation:", error);
    return NextResponse.json(
      { error: "Failed to complete reservation" },
      { status: 500 }
    );
  }
}

import { PrismaClient, SlotStatus, SlotSource } from "@prisma/client";

import { WebSocket } from "ws";

const prisma = new PrismaClient();

// Reservation timeout configuration
const RESERVATION_TIMEOUT_MINUTES = 15;
const WS_URL = "ws://localhost:4000";

interface Reservation {
  slotId: string;
  userId: string;
  reservedAt: Date;
  expiresAt: Date;
}

// In-memory reservation tracking (for quick lookups)
const activeReservations = new Map<string, Reservation>();

/**
 * Create a new reservation with timeout
 */
export async function createReservation(
  slotId: string,
  userId: string
): Promise<Reservation> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000);

  const reservation: Reservation = {
    slotId,
    userId,
    reservedAt: now,
    expiresAt,
  };

  // Store in memory
  activeReservations.set(slotId, reservation);

  // Update slot status in database
  await prisma.parkingSlot.update({
    where: { id: slotId },
    data: {
      status: SlotStatus.RESERVED,
      source: SlotSource.BOOKING,
      confidence: 100,
    },
  });


  // Broadcast reservation created via WebSocket
  await broadcastReservationCreated(slotId);

  // Schedule timeout check
  scheduleTimeoutCheck(slotId, expiresAt);

  console.log(`✅ Reservation created for slot ${slotId}, expires at ${expiresAt.toISOString()}`);

  return reservation;
}

/**
 * Cancel a reservation and release the slot
 */
export async function cancelReservation(slotId: string): Promise<boolean> {
  const reservation = activeReservations.get(slotId);
  
  if (!reservation) {
    return false;
  }

  // Remove from memory
  activeReservations.delete(slotId);

  // Update slot status back to AVAILABLE
  await prisma.parkingSlot.update({
    where: { id: slotId },
    data: {
      status: "AVAILABLE",
      source: "SYSTEM",
      confidence: 100,
    },
  });

  // Broadcast update via WebSocket
  await broadcastReservationExpired(slotId);

  console.log(`❌ Reservation cancelled for slot ${slotId}`);

  return true;
}

/**
 * Complete a reservation (convert to booking)
 */
export async function completeReservation(slotId: string): Promise<boolean> {
  const reservation = activeReservations.get(slotId);
  
  if (!reservation) {
    return false;
  }

  // Remove from memory (slot becomes OCCUPIED via booking)
  activeReservations.delete(slotId);

  console.log(`✅ Reservation completed for slot ${slotId}`);

  return true;
}

/**
 * Check if a reservation has expired and release the slot
 */
export async function checkReservationTimeout(slotId: string): Promise<boolean> {
  const reservation = activeReservations.get(slotId);
  
  if (!reservation) {
    return false;
  }

  const now = new Date();
  
  if (now > reservation.expiresAt) {
    // Reservation has expired
    console.log(`⏰ Reservation expired for slot ${slotId}`);
    
    // Remove from memory
    activeReservations.delete(slotId);

    // Get slot details for WebSocket broadcast
    const slot = await prisma.parkingSlot.findUnique({
      where: { id: slotId },
      include: { lot: true },
    });

    if (slot) {
      // Update slot status back to AVAILABLE
      await prisma.parkingSlot.update({
        where: { id: slotId },
        data: {
          status: "AVAILABLE",
          source: "SYSTEM",
          confidence: 100,
        },
      });

      // Create status log entry
      await prisma.slotStatusLog.create({
        data: {
          slotId: slotId,
          oldStatus: "RESERVED",
          newStatus: "AVAILABLE",
          source: "SYSTEM",
          confidence: 100,
        },
      });

      // Broadcast update via WebSocket
      await broadcastReservationExpired(slotId);

      return true;
    }
  }

  return false;
}

/**
 * Schedule a timeout check for a reservation
 */
function scheduleTimeoutCheck(slotId: string, expiresAt: Date) {
  const now = new Date();
  const delay = expiresAt.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(async () => {
      await checkReservationTimeout(slotId);
    }, delay);
  }
}

/**
 * Broadcast reservation created via WebSocket
 */
async function broadcastReservationCreated(slotId: string) {
  try {
    const ws = new WebSocket(WS_URL);
    
    ws.on("open", () => {
      // Get slot details
      prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: { lot: true },
      }).then((slot) => {
        if (slot) {
          ws.send(
            JSON.stringify({
              lotSlug: slot.lot.slug,
              slotNumber: slot.slotNumber,
              status: "RESERVED",
              source: SlotSource.BOOKING,
              confidence: 100,
              reason: "RESERVATION_CREATED",
              timestamp: new Date().toISOString(),
            })
          );

        }
        ws.close();
      });
    });

    ws.on("error", (err) => {
      console.error("WebSocket broadcast error:", err);
    });
  } catch (error) {
    console.error("Failed to broadcast reservation creation:", error);
  }
}

/**
 * Broadcast reservation expiration via WebSocket
 */
async function broadcastReservationExpired(slotId: string) {
  try {
    const ws = new WebSocket(WS_URL);
    
    ws.on("open", () => {
      // Get slot details
      prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: { lot: true },
      }).then((slot) => {
        if (slot) {
          ws.send(
            JSON.stringify({
              lotSlug: slot.lot.slug,
              slotNumber: slot.slotNumber,
              status: "AVAILABLE",
              source: SlotSource.AI,
              confidence: 100,
              reason: "RESERVATION_TIMEOUT",
              timestamp: new Date().toISOString(),
            })
          );

        }
        ws.close();
      });
    });

    ws.on("error", (err) => {
      console.error("WebSocket broadcast error:", err);
    });
  } catch (error) {
    console.error("Failed to broadcast reservation expiration:", error);
  }
}

/**
 * Get all active reservations
 */
export function getActiveReservations(): Reservation[] {
  return Array.from(activeReservations.values());
}

/**
 * Get reservation for a specific slot
 */
export function getReservation(slotId: string): Reservation | undefined {
  return activeReservations.get(slotId);
}

/**
 * Check if a slot has an active reservation
 */
export function hasActiveReservation(slotId: string): boolean {
  return activeReservations.has(slotId);
}

/**
 * Initialize reservation manager (check for existing reservations on startup)
 */
export async function initializeReservations() {
  console.log("🔄 Initializing reservation manager...");
  
  // Find all RESERVED slots in database
  const reservedSlots = await prisma.parkingSlot.findMany({
    where: { status: "RESERVED" },
  });

  // Check each one and set up timeout handlers
  for (const slot of reservedSlots) {
    // For now, set a default timeout of 15 minutes from now
    // In production, you'd store the reservation time in the database
    const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000);
    
    const reservation: Reservation = {
      slotId: slot.id,
      userId: "unknown", // Would be stored in a reservations table
      reservedAt: new Date(),
      expiresAt,
    };

    activeReservations.set(slot.id, reservation);
    scheduleTimeoutCheck(slot.id, expiresAt);
  }

  console.log(`✅ Initialized ${reservedSlots.length} active reservations`);
}

// Auto-initialize on module load
initializeReservations().catch(console.error);

import { WebSocketServer, WebSocket } from "ws";
import { PrismaClient, UpdatedBy, SlotStatus } from "@prisma/client";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { redis, CACHE_KEYS, CACHE_TTL } from "../redis.ts";



const prisma = new PrismaClient();

// Batch update queue for high-frequency AI updates
const batchUpdates = new Map<string, any>();
let batchTimeout: NodeJS.Timeout | null = null;
const BATCH_INTERVAL = 5000; // 5 seconds

type SlotUpdate = {
  lotSlug: string;
  slotNumber: number;
  status: SlotStatus;
  confidence?: number;
  source: UpdatedBy;
};

const PORT = 4000;

// Create HTTP server for health checks
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'smart-parking-ws-server',
      connections: wss.clients.size
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server });

// Slot Priority Logic (IMPORTANT)
function canOverride(existing: UpdatedBy, incoming: UpdatedBy): boolean {
  const priority: Record<string, number> = { OWNER: 3, SYSTEM: 3, BOOKING: 2, AI: 1 };
  return priority[incoming] >= priority[existing];
}


console.log(`🟢 WebSocket Server running on ws://localhost:${PORT}`);
server.listen(PORT, () => {
  console.log(`🚀 HTTP/WebSocket server listening on port ${PORT}`);
});

wss.on("connection", (ws: WebSocket) => {
  console.log("🔌 New client connected");

  ws.on("message", async (raw: Buffer) => {
    try {
      const data: SlotUpdate = JSON.parse(raw.toString());
      console.log("📥 Received slot update:", data);

      // Priority check: OWNER updates bypass batching
      if (data.source === "OWNER") {
        await processImmediateUpdate(data);
      } else {
        // AI updates go to batch queue
        queueBatchUpdate(data);
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  wss.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  wss.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

// Process immediate update (for OWNER priority)
async function processImmediateUpdate(data: SlotUpdate) {
  try {
    // Update Redis cache first
    const cacheKey = CACHE_KEYS.slotStatus(data.lotSlug, data.slotNumber);
    await redis.setex(
      cacheKey,
      CACHE_TTL.slotStatus,
      JSON.stringify({
        status: data.status,
        confidence: data.confidence,
        source: data.source,
        timestamp: new Date().toISOString(),
      })
    );

    // Find the parking lot
    const lot = await prisma.parkinglot.findUnique({
      where: { id: data.lotSlug },
      include: { slots: true },
    });

    if (!lot) {
      console.error("❌ Parking lot not found:", data.lotSlug);
      return;
    }

    // Find the specific slot
    const slot = lot.slots.find((s: any) => s.slotNumber === data.slotNumber);
    if (!slot) {
      console.error("❌ Slot not found:", data.slotNumber);
      return;
    }

    // Priority check: can this update override the existing status?
    if (!canOverride(slot.updatedBy, data.source)) {
      console.log(`⛔ Blocked: ${data.source} cannot override ${slot.updatedBy}`);
      return;
    }

    // Update slot in DB
    await prisma.slot.update({
      where: { id: slot.id },
      data: {
        status: data.status,
        aiConfidence: data.confidence ?? 100,
        updatedBy: data.source,
      },
    });

    // Create status log entry
    await prisma.slotStatusLog.create({
      data: {
        slotId: slot.id,
        oldStatus: slot.status,
        newStatus: data.status,
        updatedBy: data.source,
        aiConfidence: data.confidence ?? 100,
      },
    });

    // Broadcast update
    broadcastUpdate(data);
    console.log(`✅ Immediate update processed: Slot ${data.slotNumber} -> ${data.status}`);
  } catch (error) {
    console.error("❌ Error in immediate update:", error);
  }
}

// Queue update for batch processing
function queueBatchUpdate(data: SlotUpdate) {
  const key = `${data.lotSlug}-${data.slotNumber}`;
  batchUpdates.set(key, data);
  console.log(`📝 Queued batch update: ${key}`);

  if (!batchTimeout) {
    batchTimeout = setTimeout(processBatchUpdates, BATCH_INTERVAL);
  }
}

// Process all queued batch updates
async function processBatchUpdates() {
  if (batchUpdates.size === 0) {
    batchTimeout = null;
    return;
  }

  console.log(`🔄 Processing ${batchUpdates.size} batched updates...`);

  const updates = Array.from(batchUpdates.values());
  batchUpdates.clear();
  batchTimeout = null;

  // Process all updates in parallel
  await Promise.all(
    updates.map(async (data) => {
      try {
        // Update Redis cache
        const cacheKey = CACHE_KEYS.slotStatus(data.lotSlug, data.slotNumber);
        await redis.setex(
          cacheKey,
          CACHE_TTL.slotStatus,
          JSON.stringify({
            status: data.status,
            confidence: data.confidence,
            source: data.source,
            timestamp: new Date().toISOString(),
          })
        );

        // Find the parking lot
        const lot = await prisma.parkinglot.findUnique({
          where: { id: data.lotSlug },
          include: { slots: true },
        });

        if (!lot) return;

        // Find the specific slot
        const slot = lot.slots.find((s: any) => s.slotNumber === data.slotNumber);
        if (!slot) return;

        // Priority check: can this update override the existing status?
        if (!canOverride(slot.updatedBy, data.source)) {
          console.log(`⛔ Blocked: ${data.source} cannot override ${slot.updatedBy}`);
          return;
        }

        // Update slot in DB
        await prisma.slot.update({
          where: { id: slot.id },
          data: {
            status: data.status,
            aiConfidence: data.confidence ?? 100,
            updatedBy: data.source,
          },
        });

        // Create status log entry
        await prisma.slotStatusLog.create({
          data: {
            slotId: slot.id,
            oldStatus: slot.status,
            newStatus: data.status,
            updatedBy: data.source,
            aiConfidence: data.confidence ?? 100,
          },
        });

        // Broadcast update
        broadcastUpdate(data);
      } catch (error) {
        console.error("❌ Error in batch update:", error);
      }
    })
  );

  console.log("✅ Batch updates completed");
}

// Broadcast update to all connected clients
function broadcastUpdate(data: SlotUpdate) {
  const broadcastData = JSON.stringify({
    ...data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(broadcastData);
    }
  });

  console.log("📤 Broadcasted to all clients");
}

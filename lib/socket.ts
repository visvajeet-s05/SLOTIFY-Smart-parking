import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { redis } from "./redis"
import { prisma } from "./prisma"

// Global variable to store the Socket.IO server instance
declare global {
  var io: Server | undefined
}

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  })

  // Use Redis adapter for horizontal scaling
  io.adapter(createAdapter(redis, redis.duplicate()))

  // Store the instance globally for access in other modules
  global.io = io

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join area for real-time updates
    socket.on("join-area", async (areaId: string) => {
      socket.join(areaId)
      console.log(`Socket ${socket.id} joined area ${areaId}`)
      
      // Track user presence in area
      await redis.sadd(`area:${areaId}:users`, socket.id)
      await redis.expire(`area:${areaId}:users`, 300) // 5 minutes
    })

    // Leave area
    socket.on("leave-area", async (areaId: string) => {
      socket.leave(areaId)
      console.log(`Socket ${socket.id} left area ${areaId}`)
      
      // Remove user presence from area
      await redis.srem(`area:${areaId}:users`, socket.id)
    })

    // Update parking availability
    socket.on("update-availability", async (data: {
      areaId: string
      slotId: string
      isAvailable: boolean
      price?: number
    }) => {
      try {
        // Update database
        await prisma.parkingslot.update({
          where: { id: data.slotId },
          data: { 
            isActive: data.isAvailable
          }
        })

        // Broadcast to all clients in the area
        io.to(data.areaId).emit("availability:update", {
          slotId: data.slotId,
          isAvailable: data.isAvailable,
          price: data.price,
          timestamp: new Date().toISOString()
        })

        // Clear cache for this area
        await redis.del(`parking:${data.areaId}:nearby`)
        
        console.log(`Updated availability for slot ${data.slotId} in area ${data.areaId}`)
      } catch (error) {
        console.error("Error updating availability:", error)
        socket.emit("error", { message: "Failed to update availability" })
      }
    })

    // Update pricing
    socket.on("update-price", async (data: {
      slotId: string
      newPrice: number
      reason?: string
    }) => {
      try {
        // Note: currentPrice field doesn't exist in the schema
        // This functionality would need to be implemented in pricingrule model
        console.log(`Price update requested for slot ${data.slotId} to ${data.newPrice}`)
        
        // Broadcast price update
        io.emit("price:update", {
          slotId: data.slotId,
          newPrice: data.newPrice,
          reason: data.reason,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error("Error updating price:", error)
        socket.emit("error", { message: "Failed to update price" })
      }
    })

    // Booking confirmation
    socket.on("booking-confirmed", async (data: {
      bookingId: string
      slotId: string
      userId: string
      startTime: Date
      endTime: Date
    }) => {
      try {
        // Update booking status
        await prisma.booking.update({
          where: { id: data.bookingId },
          data: { status: "ACTIVE" }
        })

        // Update slot availability
        await prisma.parkingslot.update({
          where: { id: data.slotId },
          data: { isActive: false }
        })

        // Broadcast booking confirmation
        io.emit("booking:confirmed", {
          bookingId: data.bookingId,
          slotId: data.slotId,
          userId: data.userId,
          startTime: data.startTime,
          endTime: data.endTime,
          timestamp: new Date().toISOString()
        })

        console.log(`Booking ${data.bookingId} confirmed`)
      } catch (error) {
        console.error("Error confirming booking:", error)
        socket.emit("error", { message: "Failed to confirm booking" })
      }
    })

    // Disconnect handler
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`)
      
      // Remove from all areas
      const areas = await redis.keys("area:*:users")
      for (const area of areas) {
        await redis.srem(area, socket.id)
      }
    })

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  })

  return io
}

// Broadcast availability updates to specific area
export async function notifyAvailability(areaId: string, data: any) {
  if (global.io) {
    global.io.to(areaId).emit("availability:update", {
      ...data,
      timestamp: new Date().toISOString()
    })
  }
}

// Broadcast system-wide updates
export async function broadcastSystemUpdate(type: string, data: any) {
  if (global.io) {
    global.io.emit(type, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }
}

// Get active users in area
export async function getActiveUsersInArea(areaId: string): Promise<string[]> {
  return await redis.smembers(`area:${areaId}:users`)
}

// Get area statistics
export async function getAreaStats(parkingLotId: string) {
  const users = await getActiveUsersInArea(parkingLotId)
  const totalSlots = await prisma.parkingslot.count({
    where: { parkingLotId }
  })
  const availableSlots = await prisma.parkingslot.count({
    where: { parkingLotId, isActive: true }
  })

  return {
    parkingLotId,
    activeUsers: users.length,
    totalSlots,
    availableSlots,
    occupancyRate: totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0,
    timestamp: new Date().toISOString()
  }
}

// Health check endpoint for load balancers
export function setupHealthCheck(server: any) {
  server.get("/api/health", (req: any, res: any) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      redis: redis.status === "ready" ? "connected" : "disconnected",
      websocket: global.io ? "active" : "inactive"
    })
  })

  server.get("/api/ready", (req: any, res: any) => {
    res.json({
      status: "ready",
      timestamp: new Date().toISOString()
    })
  })
}
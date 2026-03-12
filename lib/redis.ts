import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("🟢 Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// Cache keys
export const CACHE_KEYS = {
  slotStatus: (lotSlug: string, slotNumber: number) => `slot:${lotSlug}:${slotNumber}`,
  lotSlots: (lotSlug: string) => `lot:${lotSlug}:slots`,
  slotBatch: "slot:batch:updates",
};

// Cache TTL in seconds
export const CACHE_TTL = {
  slotStatus: 10, // 10 seconds for individual slot
  lotSlots: 5,    // 5 seconds for lot data
};

export async function incrementRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ success: boolean, current: number }> {
    const current = await redis.incr(key);
    if (current === 1) {
        await redis.expire(key, windowSeconds);
    }
    return {
        success: current <= limit,
        current
    };
}

export default redis;

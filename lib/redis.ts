import Redis from "ioredis";
const REDIS_URL = process.env.REDIS_URL;
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

let redisInstance: Redis | null = null;

export const getRedis = () => {
    if (redisInstance) return redisInstance;
    
    // During build or if no URL is provided, return a mock or handle gracefully
    if (IS_BUILD || !REDIS_URL) {
        console.warn("⚠️ Redis: Skipping connection (Build Mode or No REDIS_URL)");
        // Return a proxy that ignores calls to prevent crashing during build
        return new Proxy({}, {
            get: () => () => Promise.resolve(null)
        }) as unknown as Redis;
    }

    redisInstance = new Redis(REDIS_URL, {
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false, // Don't queue commands if disconnected
    });

    redisInstance.on("connect", () => {
        console.log("🟢 Redis connected");
    });

    redisInstance.on("error", (err) => {
        console.error("❌ Redis error:", err);
    });

    return redisInstance;
};

// For backwards compatibility with existing imports
export const redis = getRedis();

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

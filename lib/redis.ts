import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
})

// Cache nearby parking (25km)
export async function getCachedParking(key: string) {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedParking(key: string, data: any) {
  await redis.set(key, JSON.stringify(data), "EX", 60) // 1 min
}

// Cache owner dashboard metrics
export async function getCachedOwnerMetrics(key: string) {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedOwnerMetrics(key: string, data: any) {
  await redis.set(key, JSON.stringify(data), "EX", 300) // 5 minutes
}

// Cache admin analytics
export async function getCachedAdminAnalytics(key: string) {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedAdminAnalytics(key: string, data: any) {
  await redis.set(key, JSON.stringify(data), "EX", 600) // 10 minutes
}

// Session management
export async function setSession(userId: string, sessionData: any) {
  await redis.set(`session:${userId}`, JSON.stringify(sessionData), "EX", 86400) // 24 hours
}

export async function getSession(userId: string) {
  const session = await redis.get(`session:${userId}`)
  return session ? JSON.parse(session) : null
}

export async function deleteSession(userId: string) {
  await redis.del(`session:${userId}`)
}

// Rate limiting
export async function incrementRateLimit(key: string, windowMs: number = 60000) {
  const now = Date.now()
  const pipeline = redis.pipeline()
  
  pipeline.zremrangebyscore(key, 0, now - windowMs)
  pipeline.zadd(key, now, `${now}-${Math.random()}`)
  pipeline.zcard(key)
  pipeline.expire(key, Math.ceil(windowMs / 1000))
  
  const results = await pipeline.exec()
  return results?.[2]?.[1] as number
}

// WebSocket presence tracking
export async function joinArea(userId: string, areaId: string) {
  await redis.sadd(`area:${areaId}:users`, userId)
  await redis.expire(`area:${areaId}:users`, 300) // 5 minutes
}

export async function leaveArea(userId: string, areaId: string) {
  await redis.srem(`area:${areaId}:users`, userId)
}

export async function getAreaUsers(areaId: string) {
  return await redis.smembers(`area:${areaId}:users`)
}
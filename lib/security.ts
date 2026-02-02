import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface SecurityConfig {
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  sessionTimeoutMinutes: number
  maxFailedAttempts: number
  lockoutDurationMinutes: number
  jwtSecret: string
  saltRounds: number
}

const DEFAULT_CONFIG: SecurityConfig = {
  passwordMinLength: 8,
  passwordRequireSpecialChars: true,
  sessionTimeoutMinutes: 60,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  saltRounds: 10
}

export class SecurityManager {
  private config: SecurityConfig

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.config.saltRounds)
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters long`)
    }

    if (this.config.passwordRequireSpecialChars) {
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character')
      }
    }

    const hasUpperCase = /[A-Z]/.test(password)
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter')
    }

    const hasLowerCase = /[a-z]/.test(password)
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter')
    }

    const hasNumber = /[0-9]/.test(password)
    if (!hasNumber) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async trackFailedLogin(email: string): Promise<{ locked: boolean; attempts: number; remaining: number }> {
    const failedAttemptKey = `login:attempts:${email}`
    const lockoutKey = `login:lockout:${email}`

    let attempts = 1
    let isLocked = false

    const existingAttempts = await this.getCacheValue(failedAttemptKey)
    if (existingAttempts) {
      attempts = parseInt(existingAttempts) + 1
    }

    await this.setCacheValue(failedAttemptKey, attempts.toString(), this.config.lockoutDurationMinutes * 60)

    if (attempts >= this.config.maxFailedAttempts) {
      isLocked = true
      await this.setCacheValue(lockoutKey, 'locked', this.config.lockoutDurationMinutes * 60)
    }

    return {
      locked: isLocked,
      attempts,
      remaining: Math.max(0, this.config.maxFailedAttempts - attempts)
    }
  }

  async clearFailedLogin(email: string): Promise<void> {
    await Promise.all([
      this.deleteCacheValue(`login:attempts:${email}`),
      this.deleteCacheValue(`login:lockout:${email}`)
    ])
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const lockoutKey = `login:lockout:${email}`
    const lockout = await this.getCacheValue(lockoutKey)
    
    if (!lockout) {
      return false
    }

    return true
  }

  async recordLoginAudit(userId: string, ipAddress: string, userAgent: string): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'LOGIN_SUCCESS',
        metadata: {
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  async recordLogoutAudit(userId: string): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        metadata: {
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  async recordFailedLoginAudit(email: string, ipAddress: string, userAgent: string): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId: '',
        action: 'LOGIN_FAILED',
        metadata: {
          email,
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  async recordPasswordChange(userId: string, ipAddress: string): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        metadata: {
          ipAddress,
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  generateJwtToken(payload: any, expiresIn: string = '24h'): string {
    return jwt.sign(payload, this.config.jwtSecret, { expiresIn })
  }

  verifyJwtToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwtSecret)
    } catch (error) {
      return null
    }
  }

  async getSession(userId: string): Promise<any> {
    const sessionKey = `session:${userId}`
    return await this.getCacheValue(sessionKey)
  }

  async createSession(userId: string, sessionData: any): Promise<void> {
    const sessionKey = `session:${userId}`
    await this.setCacheValue(sessionKey, JSON.stringify(sessionData), this.config.sessionTimeoutMinutes * 60)
  }

  async invalidateSession(userId: string): Promise<void> {
    await this.deleteCacheValue(`session:${userId}`)
  }

  async refreshSession(userId: string): Promise<void> {
    const sessionKey = `session:${userId}`
    const sessionData = await this.getCacheValue(sessionKey)
    
    if (sessionData) {
      await this.setCacheValue(sessionKey, sessionData, this.config.sessionTimeoutMinutes * 60)
    }
  }

  async isSessionExpired(userId: string): Promise<boolean> {
    const sessionKey = `session:${userId}`
    const ttl = await this.getCacheTTL(sessionKey)
    
    return ttl === -2 || ttl === -1
  }

  async encryptData(data: string): Promise<string> {
    // Simple encryption for demonstration purposes
    // In production, use proper encryption methods
    return Buffer.from(data).toString('base64')
  }

  async decryptData(encryptedData: string): Promise<string> {
    return Buffer.from(encryptedData, 'base64').toString('utf8')
  }

  async auditAction(action: string, userId: string, details: any): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: {
          ...details,
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  async sanitizeInput(input: any): Promise<any> {
    if (typeof input === 'string') {
      return input
        .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
        .replace(/<[^>]+>/g, '')
        .trim()
    }
    
    if (typeof input === 'object') {
      if (Array.isArray(input)) {
        return input.map(item => this.sanitizeInput(item))
      }
      
      const sanitized = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value)
      }
      return sanitized
    }
    
    return input
  }

  // Helper methods for cache operations
  private async getCacheValue(key: string): Promise<string | null> {
    // In production, use Redis
    const cache = await import('./redis')
    const value = await cache.redis.get(key)
    return value
  }

  private async setCacheValue(key: string, value: string, ttl: number): Promise<void> {
    // In production, use Redis
    const cache = await import('./redis')
    await cache.redis.set(key, value, 'EX', ttl)
  }

  private async deleteCacheValue(key: string): Promise<void> {
    // In production, use Redis
    const cache = await import('./redis')
    await cache.redis.del(key)
  }

  private async getCacheTTL(key: string): Promise<number> {
    // In production, use Redis
    const cache = await import('./redis')
    const ttl = await cache.redis.ttl(key)
    return ttl
  }
}

export const securityManager = new SecurityManager()

// Middleware for security checks
export function createSecurityMiddleware(securityManager: SecurityManager) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Security headers
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:")
    
    // Rate limiting (simple implementation)
    const rateLimitKey = `rate:${req.ip}`
    const cache = await import('./redis')
    const currentRequests = await cache.incrementRateLimit(rateLimitKey, 60000)
    
    if (currentRequests > 100) {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later'
      })
      return
    }
    
    next()
  }
}
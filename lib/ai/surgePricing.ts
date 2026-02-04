import { PrismaClient } from "@prisma/client"
import { demandModel } from "./demandModel"

const prisma = new PrismaClient()

export interface SurgePricingConfig {
  minMultiplier: number
  maxMultiplier: number
  baseThreshold: number
  maxThreshold: number
  timeWindow: number
  updateInterval: number
}

const DEFAULT_CONFIG: SurgePricingConfig = {
  minMultiplier: 1.0,
  maxMultiplier: 3.0,
  baseThreshold: 0.3,
  maxThreshold: 0.8,
  timeWindow: 3600,
  updateInterval: 600
}

export class SurgePricingEngine {
  private config: SurgePricingConfig
  private isRunning: boolean = false
  private interval: NodeJS.Timeout | null = null

  constructor(config: Partial<SurgePricingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Surge pricing engine started')

    this.interval = setInterval(
      () => this.executePriceUpdates(),
      this.config.updateInterval * 1000
    )

    await this.executePriceUpdates()
  }

  stop(): void {
    if (!this.isRunning) return

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }

    this.isRunning = false
    console.log('Surge pricing engine stopped')
  }

  private async executePriceUpdates(): Promise<void> {
    try {
      const activeAreas = await this.getActiveParkingAreas()

      for (const area of activeAreas) {
        const surgeMultiplier = await this.calculateSurgeMultiplier(area.id)
        await this.updateAreaPrices(area.id, surgeMultiplier)
      }

      console.log('Surge pricing updates completed')
    } catch (error) {
      console.error('Error executing surge pricing updates:', error)
    }
  }

  private async getActiveParkingAreas(): Promise<any[]> {
    return await prisma.parkinglot.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        parkingslot: true
      }
    })
  }

  private async calculateSurgeMultiplier(areaId: string): Promise<number> {
    const currentTime = new Date()
    const timeWindow = this.config.timeWindow

    const bookings = await prisma.booking.count({
      where: {
        parkingLotId: areaId,
        startTime: {
          gte: new Date(currentTime.getTime() - timeWindow * 1000)
        },
        status: 'ACTIVE'
      }
    })

    const slots = await prisma.parkingslot.findMany({
      where: {
        parkingLotId: areaId
      }
    })

    const totalSlots = slots.length
    const activeSlots = slots.filter((slot) => slot.isActive).length
    const occupancyRate = totalSlots > 0 ? (totalSlots - activeSlots) / totalSlots : 0
    const bookingRate = bookings / (timeWindow / 3600)

    const rawMultiplier = this.calculateBaseMultiplier(occupancyRate, bookingRate)

    const demandScore = await this.getDemandScore(areaId)
    const finalMultiplier = rawMultiplier * (1 + demandScore * 0.5)

    return Math.max(
      this.config.minMultiplier,
      Math.min(this.config.maxMultiplier, finalMultiplier)
    )
  }

  private calculateBaseMultiplier(occupancyRate: number, bookingRate: number): number {
    const occupancyFactor = this.calculateOccupancyFactor(occupancyRate)
    const bookingFactor = this.calculateBookingFactor(bookingRate)

    const combinedFactor = (occupancyFactor * 0.7) + (bookingFactor * 0.3)

    return 1 + combinedFactor
  }

  private calculateOccupancyFactor(occupancyRate: number): number {
    if (occupancyRate <= this.config.baseThreshold) {
      return 0
    }

    if (occupancyRate >= this.config.maxThreshold) {
      return 1
    }

    return (occupancyRate - this.config.baseThreshold) / (this.config.maxThreshold - this.config.baseThreshold)
  }

  private calculateBookingFactor(bookingRate: number): number {
    const baseRate = 2 // bookings per hour
    const maxRate = 20 // bookings per hour

    const normalizedRate = Math.min(bookingRate / maxRate, 1)

    return Math.log(normalizedRate * baseRate + 1) / Math.log(baseRate + 1)
  }

  private async getDemandScore(areaId: string): Promise<number> {
    try {
      const rule = await prisma.pricingrule.findFirst({
        where: { parkingLotId: areaId },
        orderBy: { createdAt: "desc" }
      })

      if (rule) {
        const currentPrice = rule.currentPrice ?? rule.basePrice ?? 0
        const pricePrediction = await demandModel.predictPrice(areaId, currentPrice)
        return Math.min(pricePrediction.confidence, 1.0)
      }

      return 0.5
    } catch (error) {
      console.error('Error getting demand score:', error)
      return 0.3
    }
  }

  private async updateAreaPrices(areaId: string, multiplier: number): Promise<void> {
    const rule = await prisma.pricingrule.findFirst({
      where: { parkingLotId: areaId },
      orderBy: { createdAt: "desc" }
    })

    if (!rule) {
      return
    }

    const currentPrice = rule.currentPrice ?? rule.basePrice ?? 10
    const newPrice = Math.round(currentPrice * multiplier * 100) / 100

    if (Math.abs(newPrice - (rule.currentPrice || 0)) > 0.5) {
      await prisma.pricingrule.update({
        where: { id: rule.id },
        data: {
          currentPrice: newPrice,
          lastUpdated: new Date()
        }
      })

      this.notifyPriceUpdate(areaId, newPrice, multiplier)
    }
  }

  private notifyPriceUpdate(slotId: string, newPrice: number, multiplier: number): void {
    console.log(`Price update: Slot ${slotId} - ₹${newPrice} (${multiplier.toFixed(2)}x)`)
    
    if (global.io) {
      global.io.emit('price:update', {
        slotId: slotId,
        newPrice: newPrice,
        multiplier: multiplier,
        reason: multiplier > 1.2 ? 'High demand' : 'Normal pricing',
        timestamp: new Date().toISOString()
      })
    }
  }

  async getAreaSurgeInfo(areaId: string): Promise<{ multiplier: number; occupancyRate: number; bookingRate: number; demandScore: number }> {
    const slots = await prisma.parkingslot.findMany({
      where: {
        parkingLotId: areaId
      }
    })

    const totalSlots = slots.length
    const activeSlots = slots.filter((s: any) => s.isActive).length
    const occupancyRate = totalSlots > 0 ? (totalSlots - activeSlots) / totalSlots : 0

    const bookings = await prisma.booking.count({
      where: {
        parkingLotId: areaId,
        startTime: {
          gte: new Date(Date.now() - this.config.timeWindow * 1000)
        },
        status: 'ACTIVE'
      }
    })

    const bookingRate = bookings / (this.config.timeWindow / 3600)
    const demandScore = await this.getDemandScore(areaId)
    const multiplier = await this.calculateSurgeMultiplier(areaId)

    return {
      multiplier,
      occupancyRate,
      bookingRate,
      demandScore
    }
  }

  async getGlobalSurgeStatistics(): Promise<{
    avgMultiplier: number
    highSurgeAreas: number
    activeAreas: number
    totalSlots: number
    occupiedSlots: number
  }> {
    const areas = await this.getActiveParkingAreas()
    const multipliers: number[] = []
    const highSurgeAreas: number[] = []
    let totalSlots = 0
    let occupiedSlots = 0

    for (const area of areas) {
      const surgeInfo = await this.getAreaSurgeInfo(area.id)
      multipliers.push(surgeInfo.multiplier)
      
      if (surgeInfo.multiplier > 1.5) {
        highSurgeAreas.push(area.id)
      }

      area.parkingslot.forEach((slot: any) => {
        totalSlots++
        if (!slot.isActive) {
          occupiedSlots++
        }
      })
    }

    const avgMultiplier = multipliers.length > 0 
      ? multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length
      : 1.0

    return {
      avgMultiplier,
      highSurgeAreas: highSurgeAreas.length,
      activeAreas: areas.length,
      totalSlots,
      occupiedSlots
    }
  }
}

export const surgePricingEngine = new SurgePricingEngine()

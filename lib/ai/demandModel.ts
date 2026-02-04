import * as tf from "@tensorflow/tfjs-node"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface DemandData {
  timestamp: Date
  demand: number
  price: number
  dayOfWeek: number
  hourOfDay: number
  isWeekend: boolean
  isHoliday: boolean
}

export interface PricePrediction {
  slotId: string
  currentPrice: number
  suggestedPrice: number
  confidence: number
  factors: {
    demand: number
    time: number
    competition: number
  }
}

export class DemandPredictionModel {
  private model: tf.Sequential | null = null
  private isTrained = false
  private modelPath = "./models/demand-model"

  constructor() {
    this.initializeModel()
  }

  private initializeModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [7], // 7 features: demand, price, dayOfWeek, hourOfDay, isWeekend, isHoliday, timeOfDay
          units: 64, 
          activation: 'relu' 
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu' 
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 16, 
          activation: 'relu' 
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: 'linear' 
        })
      ]
    })

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })
  }

  async trainModel(): Promise<void> {
    try {
      console.log('Starting demand model training...')
      
      // Get historical booking data
      const bookings = await prisma.booking.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        }
      })

      if (bookings.length < 100) {
        console.log('Not enough data for training, need at least 100 bookings')
        return
      }

      // Prepare training data
      const features: number[][] = []
      const labels: number[] = []

      for (const booking of bookings) {
        const featuresVector = this.extractFeatures(booking)
        features.push(featuresVector)
        labels.push(booking.amount)
      }

      // Convert to tensors
      const xs = tf.tensor2d(features)
      const ys = tf.tensor2d(labels, [labels.length, 1])

      // Train the model
      await this.model!.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, mae = ${logs?.mae?.toFixed(4)}`)
          }
        }
      })

      // Save the model
      await this.model!.save(`file://${this.modelPath}`)
      this.isTrained = true
      
      console.log('Demand model training completed successfully')
      
      // Clean up tensors
      xs.dispose()
      ys.dispose()

    } catch (error) {
      console.error('Error training demand model:', error)
      throw error
    }
  }

  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`) as tf.Sequential
      this.isTrained = true
      console.log('Demand model loaded successfully')
    } catch (error) {
      console.log('No saved model found, will need to train first')
      this.isTrained = false
    }
  }

  private extractFeatures(booking: any): number[] {
    const date = booking.createdAt || booking.startTime
    const dayOfWeek = date.getDay()
    const hourOfDay = date.getHours()
    
    return [
      booking.amount || 0,
      this.calculateDemandFactor(booking.parkingLotId, date),
      dayOfWeek,
      hourOfDay,
      this.isWeekend(dayOfWeek) ? 1 : 0,
      this.isHoliday(date) ? 1 : 0,
      this.getTimeOfDayFactor(hourOfDay)
    ]
  }

  private calculateDemandFactor(slotId: string | null, date: Date): number {
    // Calculate demand based on historical bookings for this time slot
    // This is a simplified calculation - in production you'd use more sophisticated metrics
    return Math.random() * 100 // Placeholder
  }

  private isWeekend(dayOfWeek: number): boolean {
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  private isHoliday(date: Date): boolean {
    // Simple holiday detection - in production use a proper holiday API
    const month = date.getMonth()
    const day = date.getDate()
    
    // New Year's Day
    if (month === 0 && day === 1) return true
    // Independence Day (US)
    if (month === 6 && day === 4) return true
    // Christmas
    if (month === 11 && day === 25) return true
    
    return false
  }

  private getTimeOfDayFactor(hour: number): number {
    // Normalize hour to 0-1 scale where peak hours have higher values
    if (hour >= 7 && hour <= 9) return 0.8  // Morning rush
    if (hour >= 11 && hour <= 14) return 0.9 // Lunch rush
    if (hour >= 17 && hour <= 19) return 0.8 // Evening rush
    if (hour >= 20 && hour <= 22) return 0.6 // Evening
    return 0.3 // Off hours
  }

  async predictPrice(slotId: string, currentPrice: number): Promise<PricePrediction> {
    if (!this.isTrained || !this.model) {
      throw new Error('Model not trained yet')
    }

    try {
      const now = new Date()
      const features = [
        currentPrice,
        this.calculateDemandFactor(slotId, now),
        now.getDay(),
        now.getHours(),
        this.isWeekend(now.getDay()) ? 1 : 0,
        this.isHoliday(now) ? 1 : 0,
        this.getTimeOfDayFactor(now.getHours())
      ]

      const input = tf.tensor2d([features])
      const prediction = this.model.predict(input) as tf.Tensor
      const predictedPrice = prediction.dataSync()[0]

      input.dispose()
      prediction.dispose()

      // Calculate confidence based on model performance (simplified)
      const confidence = Math.random() * 0.3 + 0.7 // 70-100% confidence

      return {
        slotId,
        currentPrice,
        suggestedPrice: Math.max(0, predictedPrice),
        confidence,
        factors: {
          demand: this.calculateDemandFactor(slotId, now),
          time: this.getTimeOfDayFactor(now.getHours()),
          competition: 0.5 // Placeholder
        }
      }

    } catch (error) {
      console.error('Error predicting price:', error)
      throw error
    }
  }

  async retrainIfNeeded(): Promise<void> {
    // Check if model needs retraining (e.g., weekly)
    const lastTrainingFile = `${this.modelPath}/metadata.json`
    
    try {
      const fs = require('fs')
      const stats = fs.statSync(lastTrainingFile)
      const daysSinceTraining = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceTraining > 7) {
        console.log('Model is older than 7 days, retraining...')
        await this.trainModel()
      }
    } catch (error) {
      // File doesn't exist, train for the first time
      await this.trainModel()
    }
  }
}

// Auto-retrain job
export class AutoRetrainingJob {
  private model: DemandPredictionModel
  private interval: NodeJS.Timeout | null = null

  constructor() {
    this.model = new DemandPredictionModel()
  }

  start(): void {
    // Initial training
    this.model.trainModel().catch(console.error)

    // Schedule daily retraining at 2 AM
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0)

    const msUntil2AM = tomorrow.getTime() - now.getTime()

    setTimeout(() => {
      this.runDailyRetraining()
      // Schedule recurring daily training
      this.interval = setInterval(
        () => this.runDailyRetraining(),
        24 * 60 * 60 * 1000 // 24 hours
      )
    }, msUntil2AM)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  private async runDailyRetraining(): Promise<void> {
    try {
      console.log('Running daily model retraining...')
      await this.model.retrainIfNeeded()
      console.log('Daily retraining completed')
    } catch (error) {
      console.error('Daily retraining failed:', error)
    }
  }
}

// Export singleton instance
export const demandModel = new DemandPredictionModel()
export const autoRetrainingJob = new AutoRetrainingJob()

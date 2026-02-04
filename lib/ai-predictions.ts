import * as tf from '@tensorflow/tfjs-node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PredictionInput {
  hour: number
  dayOfWeek: number
  availableSlots: number
  totalSlots: number
  bookingsLastHour: number
  weather?: number
  cityDensity?: number
}

export class DemandPredictor {
  private model: tf.Sequential | null = null

  constructor() {
    this.initializeModel()
  }

  private initializeModel() {
    this.model = tf.sequential()

    // Input layer: [hour, dayOfWeek, availableSlots, totalSlots, bookingsLastHour, weather, cityDensity]
    this.model.add(tf.layers.dense({ units: 32, inputShape: [7], activation: 'relu' }))
    this.model.add(tf.layers.dense({ units: 16, activation: 'relu' }))
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })) // Output: demand score 0-1

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })
  }

  /**
   * Predict demand score for a parking lot
   */
  async predictDemand(input: PredictionInput): Promise<number> {
    if (!this.model) throw new Error('Model not initialized')

    const tensorInput = tf.tensor2d([[
      input.hour,
      input.dayOfWeek,
      input.availableSlots,
      input.totalSlots,
      input.bookingsLastHour,
      input.weather || 0,
      input.cityDensity || 0
    ]])

    const prediction = this.model.predict(tensorInput) as tf.Tensor
    const score = (await prediction.data())[0]

    tensorInput.dispose()
    prediction.dispose()

    return Math.max(0, Math.min(1, score)) // Ensure 0-1 range
  }

  /**
   * Train the model with historical data
   */
  async trainModel() {
    if (!this.model) throw new Error('Model not initialized')

    // Get training data from past bookings
    const trainingData = await this.getTrainingData()

    if (trainingData.inputs.length === 0) {
      console.log('No training data available')
      return
    }

    const inputs = tf.tensor2d(trainingData.inputs)
    const labels = tf.tensor2d(trainingData.labels, [trainingData.labels.length, 1])

    await this.model.fit(inputs, labels, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch: number, logs?: tf.Logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`)
        }
      }
    })

    inputs.dispose()
    labels.dispose()
  }

  /**
   * Get training data from historical bookings
   */
  private async getTrainingData(): Promise<{ inputs: number[][], labels: number[] }> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        parkinglot: { include: { parkingslot: true } }
      }
    })

    const inputs: number[][] = []
    const labels: number[] = []

    // Group bookings by hour and parking lot
    const hourlyData = new Map<string, { bookings: number, totalSlots: number }>()

    for (const booking of bookings) {
      const key = `${booking.parkingLotId}-${booking.createdAt.getHours()}-${booking.createdAt.getDay()}`
      const existing = hourlyData.get(key) || { bookings: 0, totalSlots: booking.parkinglot.parkingslot.length }

      hourlyData.set(key, {
        bookings: existing.bookings + 1,
        totalSlots: existing.totalSlots
      })
    }

    for (const [key, data] of hourlyData) {
      const [parkingLotId, hour, dayOfWeek] = key.split('-').map(Number)

      // Calculate demand score based on booking rate
      const demandScore = Math.min(data.bookings / data.totalSlots, 1)

      inputs.push([
        hour,
        dayOfWeek,
        data.totalSlots - data.bookings, // available slots (approximate)
        data.totalSlots,
        data.bookings,
        0, // weather (placeholder)
        0  // city density (placeholder)
      ])

      labels.push(demandScore)
    }

    return { inputs, labels }
  }

  /**
   * Save model predictions to database
   */
  async savePredictions(parkingLotId: string, predictions: Array<{ hour: number, date: Date, score: number }>) {
    for (const pred of predictions) {
      await prisma.demandprediction.upsert({
        where: {
          id: `${parkingLotId}-${pred.hour}-${pred.date.toISOString().split('T')[0]}`
        },
        update: { demandScore: pred.score },
        create: {
          id: `${parkingLotId}-${pred.hour}-${pred.date.toISOString().split('T')[0]}`,
          parkingId: parkingLotId,
          hour: pred.hour,
          date: pred.date,
          demandScore: pred.score
        }
      })
    }
  }

  /**
   * Generate predictions for next 24 hours
   */
  async generatePredictions(parkingLotId: string): Promise<Array<{ hour: number, date: Date, score: number }>> {
    const predictions: Array<{ hour: number, date: Date, score: number }> = []
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get parking lot data
    const parkingLot = await prisma.parkinglot.findUnique({
      where: { id: parkingLotId },
      include: { parkingslot: true }
    })

    if (!parkingLot) return predictions

    const totalSlots = parkingLot.parkingslot.length

    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(tomorrow)
      date.setHours(hour, 0, 0, 0)

      // Get recent bookings for this hour pattern
      const recentBookings = await this.getRecentBookingsForHour(parkingLotId, hour)

      const input: PredictionInput = {
        hour,
        dayOfWeek: date.getDay(),
        availableSlots: totalSlots - recentBookings, // approximate
        totalSlots,
        bookingsLastHour: recentBookings,
        weather: 0, // TODO: integrate weather API
        cityDensity: 0 // TODO: calculate city density
      }

      const score = await this.predictDemand(input)

      predictions.push({ hour, date, score })
    }

    return predictions
  }

  private async getRecentBookingsForHour(parkingLotId: string, hour: number): Promise<number> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const bookings = await prisma.booking.count({
      where: {
        parkingLotId,
        createdAt: { gte: sevenDaysAgo },
        AND: [
          { createdAt: { gte: new Date(new Date().setHours(hour, 0, 0, 0)) } },
          { createdAt: { lt: new Date(new Date().setHours(hour + 1, 0, 0, 0)) } }
        ]
      }
    })

    return Math.round(bookings / 7) // Average over last 7 days
  }
}

// Singleton instance
export const demandPredictor = new DemandPredictor()

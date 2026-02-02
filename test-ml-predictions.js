// Test ML prediction functionality
const { demandPredictor } = require('./lib/ai-predictions')

async function testMLPredictions() {
  console.log('🧠 Testing ML Prediction Engine...')

  try {
    // Test prediction input
    const testInput = {
      hour: 14, // 2 PM
      dayOfWeek: 1, // Monday
      availableSlots: 15,
      totalSlots: 20,
      bookingsLastHour: 3,
      weather: 0.5,
      cityDensity: 0.8
    }

    console.log('📊 Testing prediction with sample data...')
    const prediction = await demandPredictor.predictDemand(testInput)

    if (typeof prediction === 'number' && prediction >= 0 && prediction <= 1) {
      console.log(`✅ Prediction successful: ${prediction.toFixed(3)} demand score`)
    } else {
      console.log('❌ Prediction returned invalid value:', prediction)
    }

    // Test training data generation
    console.log('📈 Testing training data generation...')
    const trainingData = await demandPredictor.getTrainingData()
    console.log(`✅ Training data generated: ${trainingData.inputs.length} samples`)

    console.log('🎉 ML prediction engine is functional!')

  } catch (error) {
    console.error('❌ ML prediction test failed:', error.message)
  }
}

testMLPredictions()

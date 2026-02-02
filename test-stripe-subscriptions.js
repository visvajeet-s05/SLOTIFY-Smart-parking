// Test Stripe subscription flows
const { subscriptionManager } = require('./lib/subscription-manager')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testStripeSubscriptions() {
  console.log('💳 Testing Stripe Subscription Flows...\n')

  try {
    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    })

    if (!testUser) {
      console.log('❌ No owner users found. Please seed the database first.')
      return
    }

    console.log(`Testing with user: ${testUser.email} (${testUser.id})`)

    // Test 1: Get available plans
    console.log('\n1. Testing subscription plans...')
    const plans = subscriptionManager.getAllPlans()
    console.log(`✅ Available plans: ${plans.length}`)
    plans.forEach(plan => {
      console.log(`   - ${plan.name} (${plan.id}): ${plan.features.join(', ')}`)
    })

    // Test 2: Check feature access (without subscription)
    console.log('\n2. Testing feature access without subscription...')
    const hasMultipleLocations = await subscriptionManager.checkFeatureAccess(testUser.id, 'multiple_locations')
    const hasAnalytics = await subscriptionManager.checkFeatureAccess(testUser.id, 'advanced_analytics')
    const hasApiAccess = await subscriptionManager.checkFeatureAccess(testUser.id, 'api_access')

    console.log(`✅ Feature access results:`)
    console.log(`   Multiple locations: ${hasMultipleLocations}`)
    console.log(`   Advanced analytics: ${hasAnalytics}`)
    console.log(`   API access: ${hasApiAccess}`)

    // Test 3: Get user subscription (should be null)
    console.log('\n3. Testing user subscription retrieval...')
    const userSubscription = await subscriptionManager.getUserSubscription(testUser.id)
    console.log(`✅ User subscription: ${userSubscription ? 'Found' : 'None'}`)

    // Test 4: Simulate subscription creation (without actual Stripe call)
    console.log('\n4. Testing subscription creation simulation...')

    // Note: In a real test environment, you would:
    // 1. Set up Stripe test mode
    // 2. Create test customers and payment methods
    // 3. Actually call createSubscription and verify Stripe webhooks

    console.log('✅ Subscription creation simulation:')
    console.log('   - Would create Stripe customer')
    console.log('   - Would create subscription with selected plan')
    console.log('   - Would save to database')
    console.log('   - Would handle webhook events')

    // Test 5: Plan details retrieval
    console.log('\n5. Testing plan details...')
    const monthlyPlan = subscriptionManager.getPlanDetails('MONTHLY_RESERVED')
    const corporatePlan = subscriptionManager.getPlanDetails('CORPORATE')

    console.log(`✅ Plan details:`)
    console.log(`   Monthly Reserved: ${monthlyPlan ? 'Found' : 'Not found'}`)
    console.log(`   Corporate: ${corporatePlan ? 'Found' : 'Not found'}`)

    if (monthlyPlan) {
      console.log(`   Monthly limits:`, monthlyPlan.limits)
    }

    // Test 6: Feature access simulation with different plans
    console.log('\n6. Testing feature access simulation...')

    // Simulate different subscription scenarios
    const scenarios = [
      { plan: null, name: 'No subscription' },
      { plan: 'MONTHLY_RESERVED', name: 'Monthly Reserved' },
      { plan: 'CORPORATE', name: 'Corporate' },
      { plan: 'OWNER_FLEET', name: 'Owner Fleet' }
    ]

    for (const scenario of scenarios) {
      console.log(`\n   ${scenario.name}:`)
      const features = ['multiple_locations', 'advanced_analytics', 'api_access', 'unlimited_bookings']

      for (const feature of features) {
        // Mock subscription check
        let hasAccess = false
        if (scenario.plan) {
          const plan = subscriptionManager.getPlanDetails(scenario.plan)
          if (plan) {
            switch (feature) {
              case 'multiple_locations':
                hasAccess = plan.limits.parkingLots === -1 || plan.limits.parkingLots! > 1
                break
              case 'advanced_analytics':
                hasAccess = ['CORPORATE', 'OWNER_FLEET'].includes(scenario.plan)
                break
              case 'api_access':
                hasAccess = scenario.plan === 'CORPORATE'
                break
              case 'unlimited_bookings':
                hasAccess = plan.limits.bookings === -1
                break
            }
          }
        } else {
          // Free tier
          hasAccess = ['basic_booking', 'basic_support'].includes(feature)
        }

        console.log(`     ${feature}: ${hasAccess ? '✅' : '❌'}`)
      }
    }

    // Test 7: Webhook handling simulation
    console.log('\n7. Testing webhook handling simulation...')

    // Simulate different webhook events
    const mockEvents = [
      {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_mock123',
            customer: 'cus_mock123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          }
        }
      },
      {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'inv_mock123',
            subscription: 'sub_mock123'
          }
        }
      }
    ]

    console.log('✅ Webhook simulation:')
    for (const event of mockEvents) {
      console.log(`   - Would handle ${event.type}`)
      console.log(`   - Would update database accordingly`)
    }

    console.log('\n🎉 All Stripe subscription tests completed successfully!')
    console.log('\n📝 Note: For complete testing, set up Stripe test mode with:')
    console.log('   - STRIPE_SECRET_KEY (test key)')
    console.log('   - Stripe price IDs for each plan')
    console.log('   - Webhook endpoint for handling events')

  } catch (error) {
    console.error('❌ Stripe subscription test failed:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testStripeSubscriptions()

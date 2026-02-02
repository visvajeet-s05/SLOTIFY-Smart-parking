const EventEmitter = require('events');
const { Kafka } = require('kafkajs');

class EventSystem extends EventEmitter {
  constructor() {
    super();
    this.kafka = null;
    this.producer = null;
    this.consumer = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      this.kafka = new Kafka({
        clientId: 'slotify-event-system',
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        ssl: process.env.NODE_ENV === 'production',
        sasl: process.env.NODE_ENV === 'production' ? {
          mechanism: 'scram-sha-256',
          username: process.env.KAFKA_USERNAME,
          password: process.env.KAFKA_PASSWORD
        } : undefined
      });

      this.producer = this.kafka.producer();
      this.consumer = this.kafka.consumer({ groupId: 'slotify-event-consumer' });

      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;

      console.log('Event system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize event system:', error);
      throw error;
    }
  }

  async publishEvent(topic, event) {
    if (!this.isConnected) {
      throw new Error('Event system not initialized');
    }

    try {
      await this.producer.send({
        topic,
        messages: [{
          key: event.id || Date.now().toString(),
          value: JSON.stringify(event),
          timestamp: Date.now().toString()
        }]
      });

      console.log(`Event published to ${topic}:`, event.type);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async subscribeToTopic(topic, handler) {
    if (!this.isConnected) {
      throw new Error('Event system not initialized');
    }

    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = JSON.parse(message.value.toString());
            await handler(event);
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      });

      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      throw error;
    }
  }

  // Domain events
  async publishPriceUpdate(parkingLotId, oldPrice, newPrice, reason, region) {
    const event = {
      id: `price-update-${Date.now()}`,
      type: 'PRICE_UPDATE',
      timestamp: new Date().toISOString(),
      data: {
        parkingLotId,
        oldPrice,
        newPrice,
        reason,
        region,
        triggeredBy: 'SYSTEM'
      }
    };

    await this.publishEvent('price-updates', event);
  }

  async publishBookingCreated(booking, region) {
    const event = {
      id: `booking-created-${booking.id}`,
      type: 'BOOKING_CREATED',
      timestamp: new Date().toISOString(),
      data: {
        ...booking,
        region
      }
    };

    await this.publishEvent('bookings', event);
  }

  async publishPaymentProcessed(payment, region) {
    const event = {
      id: `payment-processed-${payment.id}`,
      type: 'PAYMENT_PROCESSED',
      timestamp: new Date().toISOString(),
      data: {
        ...payment,
        region
      }
    };

    await this.publishEvent('payments', event);
  }

  async publishSlotStatusChanged(slotId, status, region) {
    const event = {
      id: `slot-status-${slotId}-${Date.now()}`,
      type: 'SLOT_STATUS_CHANGED',
      timestamp: new Date().toISOString(),
      data: {
        slotId,
        status,
        region
      }
    };

    await this.publishEvent('slot-status', event);
  }

  async publishEventCreated(event, region) {
    const domainEvent = {
      id: `event-created-${event.id}`,
      type: 'EVENT_CREATED',
      timestamp: new Date().toISOString(),
      data: {
        ...event,
        region
      }
    };

    await this.publishEvent('events', domainEvent);
  }

  async publishOwnerSettlement(ownerId, amount, referenceId, region) {
    const event = {
      id: `settlement-${ownerId}-${Date.now()}`,
      type: 'OWNER_SETTLEMENT',
      timestamp: new Date().toISOString(),
      data: {
        ownerId,
        amount,
        referenceId,
        region
      }
    };

    await this.publishEvent('owner-settlements', event);
  }

  // Event handlers for cross-region synchronization
  setupEventHandlers() {
    // Handle price updates across regions
    this.subscribeToTopic('price-updates', async (event) => {
      if (event.type === 'PRICE_UPDATE') {
        console.log('Processing price update event:', event.data);
        // Update local pricing in other regions
        await this.handlePriceUpdate(event.data);
      }
    });

    // Handle booking synchronization
    this.subscribeToTopic('bookings', async (event) => {
      if (event.type === 'BOOKING_CREATED') {
        console.log('Processing booking event:', event.data);
        // Sync booking to local region
        await this.handleBookingSync(event.data);
      }
    });

    // Handle payment synchronization
    this.subscribeToTopic('payments', async (event) => {
      if (event.type === 'PAYMENT_PROCESSED') {
        console.log('Processing payment event:', event.data);
        // Sync payment to local region
        await this.handlePaymentSync(event.data);
      }
    });

    // Handle slot status synchronization
    this.subscribeToTopic('slot-status', async (event) => {
      if (event.type === 'SLOT_STATUS_CHANGED') {
        console.log('Processing slot status event:', event.data);
        // Update slot status in local region
        await this.handleSlotStatusSync(event.data);
      }
    });

    // Handle event synchronization
    this.subscribeToTopic('events', async (event) => {
      if (event.type === 'EVENT_CREATED') {
        console.log('Processing event creation:', event.data);
        // Sync event to local region
        await this.handleEventSync(event.data);
      }
    });

    // Handle owner settlement synchronization
    this.subscribeToTopic('owner-settlements', async (event) => {
      if (event.type === 'OWNER_SETTLEMENT') {
        console.log('Processing owner settlement:', event.data);
        // Sync settlement to local region
        await this.handleSettlementSync(event.data);
      }
    });
  }

  // Placeholder methods for event handling
  async handlePriceUpdate(data) {
    // Implement price update logic
    console.log('Handling price update:', data);
  }

  async handleBookingSync(data) {
    // Implement booking sync logic
    console.log('Handling booking sync:', data);
  }

  async handlePaymentSync(data) {
    // Implement payment sync logic
    console.log('Handling payment sync:', data);
  }

  async handleSlotStatusSync(data) {
    // Implement slot status sync logic
    console.log('Handling slot status sync:', data);
  }

  async handleEventSync(data) {
    // Implement event sync logic
    console.log('Handling event sync:', data);
  }

  async handleSettlementSync(data) {
    // Implement settlement sync logic
    console.log('Handling settlement sync:', data);
  }

  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    this.isConnected = false;
    console.log('Event system disconnected');
  }
}

module.exports = EventSystem;
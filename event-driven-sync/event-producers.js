// Event Producers for Multi-Region Synchronization
// Node.js event producers for Kafka

const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

class EventProducer {
  constructor(config) {
    this.kafka = new Kafka({
      clientId: config.clientId || 'slotify-producer',
      brokers: config.brokers,
      ssl: config.ssl || false,
      sasl: config.sasl || undefined,
    });
    this.producer = this.kafka.producer();
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }

  async produce(topic, key, value, headers = {}) {
    try {
      await this.producer.send({
        topic,
        messages: [{
          key: key || uuidv4(),
          value: JSON.stringify(value),
          headers: {
            'event-type': value.eventType || 'generic',
            'entity-type': value.entityType || 'unknown',
            'entity-id': value.entityId || '',
            'region': value.region || 'unknown',
            'timestamp': new Date().toISOString(),
            ...headers
          }
        }]
      });
    } catch (error) {
      console.error('Error producing message:', error);
      throw error;
    }
  }
}

// Parking Lot Event Producer
class ParkingLotEventProducer extends EventProducer {
  constructor(config) {
    super({ ...config, clientId: 'parking-lot-producer' });
  }

  async produceParkingLotCreated(parkingLot, region) {
    await this.produce('slotify-parking-events', null, {
      eventType: 'PARKING_LOT_CREATED',
      entityType: 'PARKING_LOT',
      entityId: parkingLot.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: parkingLot,
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }

  async produceParkingLotUpdated(parkingLot, region, changes) {
    await this.produce('slotify-parking-events', parkingLot.id, {
      eventType: 'PARKING_LOT_UPDATED',
      entityType: 'PARKING_LOT',
      entityId: parkingLot.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: parkingLot,
      changes: changes,
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }

  async produceParkingLotDeleted(parkingLotId, region) {
    await this.produce('slotify-parking-events', parkingLotId, {
      eventType: 'PARKING_LOT_DELETED',
      entityType: 'PARKING_LOT',
      entityId: parkingLotId,
      region: region,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }
}

// Parking Slot Event Producer
class ParkingSlotEventProducer extends EventProducer {
  constructor(config) {
    super({ ...config, clientId: 'parking-slot-producer' });
  }

  async produceSlotStatusChanged(slot, region, oldStatus, newStatus) {
    await this.produce('slotify-parking-events', slot.id, {
      eventType: 'PARKING_SLOT_STATUS_CHANGED',
      entityType: 'PARKING_SLOT',
      entityId: slot.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: slot,
      changes: {
        oldStatus: oldStatus,
        newStatus: newStatus
      },
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }

  async produceSlotPriceUpdated(slot, region, oldPrice, newPrice) {
    await this.produce('slotify-price-events', slot.id, {
      eventType: 'PARKING_SLOT_PRICE_UPDATED',
      entityType: 'PARKING_SLOT',
      entityId: slot.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: slot,
      changes: {
        oldPrice: oldPrice,
        newPrice: newPrice
      },
      metadata: {
        source: 'pricing-engine',
        version: '1.0'
      }
    });
  }
}

// Booking Event Producer
class BookingEventProducer extends EventProducer {
  constructor(config) {
    super({ ...config, clientId: 'booking-producer' });
  }

  async produceBookingCreated(booking, region) {
    await this.produce('slotify-booking-events', booking.id, {
      eventType: 'BOOKING_CREATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: booking,
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }

  async produceBookingUpdated(booking, region, changes) {
    await this.produce('slotify-booking-events', booking.id, {
      eventType: 'BOOKING_UPDATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: booking,
      changes: changes,
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }

  async produceBookingCancelled(bookingId, region, reason) {
    await this.produce('slotify-booking-events', bookingId, {
      eventType: 'BOOKING_CANCELLED',
      entityType: 'BOOKING',
      entityId: bookingId,
      region: region,
      timestamp: new Date().toISOString(),
      data: { reason: reason },
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }

  async produceBookingCompleted(bookingId, region) {
    await this.produce('slotify-booking-events', bookingId, {
      eventType: 'BOOKING_COMPLETED',
      entityType: 'BOOKING',
      entityId: bookingId,
      region: region,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'api',
        version: '1.0'
      }
    });
  }
}

// Payment Event Producer
class PaymentEventProducer extends EventProducer {
  constructor(config) {
    super({ ...config, clientId: 'payment-producer' });
  }

  async producePaymentInitiated(payment, region) {
    await this.produce('slotify-payment-events', payment.id, {
      eventType: 'PAYMENT_INITIATED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: payment,
      metadata: {
        source: 'payment-service',
        version: '1.0'
      }
    });
  }

  async producePaymentCompleted(payment, region) {
    await this.produce('slotify-payment-events', payment.id, {
      eventType: 'PAYMENT_COMPLETED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: payment,
      metadata: {
        source: 'payment-service',
        version: '1.0'
      }
    });
  }

  async producePaymentFailed(payment, region, error) {
    await this.produce('slotify-payment-events', payment.id, {
      eventType: 'PAYMENT_FAILED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      region: region,
      timestamp: new Date().toISOString(),
      data: payment,
      error: error,
      metadata: {
        source: 'payment-service',
        version: '1.0'
      }
    });
  }
}

// Generic Event Producer for Cross-Region Sync
class CrossRegionEventProducer extends EventProducer {
  constructor(config) {
    super({ ...config, clientId: 'cross-region-producer' });
  }

  async produceCrossRegionSync(sourceRegion, targetRegion, entityType, entityId, operation, data) {
    await this.produce('slotify-events', `${sourceRegion}-${entityType}-${entityId}`, {
      eventType: 'CROSS_REGION_SYNC',
      entityType: entityType,
      entityId: entityId,
      sourceRegion: sourceRegion,
      targetRegion: targetRegion,
      operation: operation,
      timestamp: new Date().toISOString(),
      data: data,
      correlationId: uuidv4(),
      metadata: {
        source: 'sync-service',
        version: '1.0'
      }
    });
  }

  async produceConsistencyCheck(region, entityType, entityId, status, details) {
    await this.produce('slotify-events', `${region}-${entityType}-${entityId}`, {
      eventType: 'CONSISTENCY_CHECK',
      entityType: entityType,
      entityId: entityId,
      region: region,
      status: status,
      timestamp: new Date().toISOString(),
      details: details,
      metadata: {
        source: 'consistency-service',
        version: '1.0'
      }
    });
  }
}

// Export producers
module.exports = {
  EventProducer,
  ParkingLotEventProducer,
  ParkingSlotEventProducer,
  BookingEventProducer,
  PaymentEventProducer,
  CrossRegionEventProducer
};
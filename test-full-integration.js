const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4000';

console.log('🧪 FULL INTEGRATION TEST: Owner → Customer Real-Time Sync\n');

// Customer connection
const customerWs = new WebSocket(WS_URL);
let ownerWs = null;
let testPassed = false;

// Customer events
customerWs.on('open', () => {
  console.log('👤 Customer: Connected to WebSocket');
  
  // Subscribe to all parking lots
  customerWs.send(JSON.stringify({
    type: 'SUBSCRIBE',
    role: 'CUSTOMER'
  }));
});

customerWs.on('message', (data) => {
  const message = JSON.parse(data);
  
  if (message.type === 'SUBSCRIBED') {
    console.log('👤 Customer: Subscribed to all parking lots');
    
    // Now connect as owner and make a change
    setTimeout(() => {
      connectOwnerAndUpdate();
    }, 1000);
  }
  
  if (message.type === 'SLOT_UPDATE') {
    console.log('\n✅ REAL-TIME SYNC SUCCESSFUL!');
    console.log(`👤 Customer received update:`);
    console.log(`   Lot: ${message.lotSlug}`);
    console.log(`   Slot: ${message.slotNumber}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Source: ${message.source}`);
    console.log(`   Time: ${message.timestamp}`);
    
    testPassed = true;
    
    // Cleanup
    setTimeout(() => {
      customerWs.close();
      if (ownerWs) ownerWs.close();
      
      console.log('\n🎉 TEST RESULT: PASSED');
      console.log('✅ Owner changes instantly reflect in Customer portal');
      console.log('✅ WebSocket real-time synchronization working perfectly');
      process.exit(0);
    }, 2000);
  }
});

customerWs.on('error', (err) => {
  console.error('👤 Customer error:', err.message);
});

// Owner connection function
function connectOwnerAndUpdate() {
  ownerWs = new WebSocket(WS_URL);
  
  ownerWs.on('open', () => {
    console.log('👨‍💼 Owner: Connected to WebSocket');
    
    // Simulate slot status change
    setTimeout(() => {
      const update = {
        lotSlug: 'T_NAGAR',
        slotNumber: 5,
        status: 'RESERVED',
        source: 'OWNER',
        confidence: 100
      };
      
      ownerWs.send(JSON.stringify(update));
      console.log(`👨‍💼 Owner: Changed Slot ${update.slotNumber} to ${update.status} in ${update.lotSlug}`);
    }, 500);
  });
  
  ownerWs.on('error', (err) => {
    console.error('👨‍💼 Owner error:', err.message);
  });
}

// Timeout safeguard
setTimeout(() => {
  if (!testPassed) {
    console.log('\n❌ TEST RESULT: FAILED');
    console.log('Customer did not receive real-time update within timeout');
    customerWs.close();
    if (ownerWs) ownerWs.close();
    process.exit(1);
  }
}, 15000);

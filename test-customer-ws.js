const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4000';

console.log('🔌 Testing Customer WebSocket Connection...\n');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Subscribe as customer (global subscription)
  const subscribeMsg = {
    type: 'SUBSCRIBE',
    role: 'CUSTOMER'
  };
  
  ws.send(JSON.stringify(subscribeMsg));
  console.log('📤 Sent subscription request:', subscribeMsg);
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('📥 Received:', message);
  
  if (message.type === 'SUBSCRIBED') {
    console.log('✅ Subscription confirmed:', message.message);
  }
  
  if (message.type === 'SLOT_UPDATE') {
    console.log('🔄 Real-time slot update received!');
    console.log(`   Lot: ${message.lotSlug}`);
    console.log(`   Slot: ${message.slotNumber}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Source: ${message.source}`);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
});

// Keep connection alive for 10 seconds
setTimeout(() => {
  console.log('\n⏱️ Test complete, closing connection...');
  ws.close();
  process.exit(0);
}, 10000);

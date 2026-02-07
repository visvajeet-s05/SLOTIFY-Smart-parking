const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4000';

console.log('🎮 Simulating Owner Slot Update...\n');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ Connected as Owner');
  
  // Simulate owner updating a slot
  const updateMsg = {
    lotSlug: 'CHENNAI_CENTRAL',
    slotNumber: 1,
    status: 'OCCUPIED',
    source: 'OWNER',
    confidence: 100
  };
  
  ws.send(JSON.stringify(updateMsg));
  console.log('📤 Sent slot update:', updateMsg);
  console.log('⏱️ Waiting for broadcast...\n');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('📥 Received:', message);
  
  if (message.type === 'SLOT_UPDATE') {
    console.log('✅ Real-time update broadcast confirmed!');
    console.log(`   Lot: ${message.lotSlug}`);
    console.log(`   Slot: ${message.slotNumber}`);
    console.log(`   New Status: ${message.status}`);
    console.log(`   Source: ${message.source}`);
    console.log(`   Timestamp: ${message.timestamp}`);
  }
});

ws.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
});

setTimeout(() => {
  console.log('\n✅ Test complete!');
  ws.close();
  process.exit(0);
}, 5000);

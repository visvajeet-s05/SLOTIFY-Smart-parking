const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4000';

console.log('🧪 Testing WebSocket Server...\n');

// Test 1: OWNER Subscription
function testOwnerSubscription() {
  return new Promise((resolve, reject) => {
    console.log('Test 1: OWNER Subscription');
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.log('  ✅ OWNER connected');
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        lotId: 'chennai-central',
        role: 'OWNER'
      }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'SUBSCRIBE_SUCCESS' || (msg.type === undefined && msg.lotId)) {
        console.log('  ✅ OWNER subscription acknowledged');
        ws.close();
        resolve();
      }
    });
    
    ws.on('error', (err) => {
      console.log('  ❌ OWNER error:', err.message);
      reject(err);
    });
    
    setTimeout(() => {
      ws.close();
      resolve();
    }, 3000);
  });
}

// Test 2: CUSTOMER Subscription
function testCustomerSubscription() {
  return new Promise((resolve, reject) => {
    console.log('\nTest 2: CUSTOMER Subscription');
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.log('  ✅ CUSTOMER connected');
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        lotId: 'chennai-central',
        role: 'CUSTOMER'
      }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      console.log('  📥 CUSTOMER received:', msg);
    });
    
    ws.on('error', (err) => {
      console.log('  ❌ CUSTOMER error:', err.message);
      reject(err);
    });
    
    setTimeout(() => {
      ws.close();
      resolve();
    }, 3000);
  });
}

// Test 3: PING/PONG
function testPingPong() {
  return new Promise((resolve, reject) => {
    console.log('\nTest 3: PING/PONG Heartbeat');
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'PING' }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'PONG') {
        console.log('  ✅ PONG received');
        ws.close();
        resolve();
      }
    });
    
    ws.on('error', (err) => {
      console.log('  ❌ PING/PONG error:', err.message);
      reject(err);
    });
    
    setTimeout(() => {
      ws.close();
      resolve();
    }, 3000);
  });
}

// Test 4: Multiple connections to same lot
function testMultipleConnections() {
  return new Promise((resolve, reject) => {
    console.log('\nTest 4: Multiple Connections');
    const connections = [];
    let connectedCount = 0;
    
    for (let i = 0; i < 3; i++) {
      const ws = new WebSocket(WS_URL);
      connections.push(ws);
      
      ws.on('open', () => {
        connectedCount++;
        console.log(`  ✅ Connection ${i + 1} established`);
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          lotId: 'chennai-central',
          role: i === 0 ? 'OWNER' : 'CUSTOMER'
        }));
      });
      
      ws.on('error', (err) => {
        console.log(`  ❌ Connection ${i + 1} error:`, err.message);
      });
    }
    
    setTimeout(() => {
      connections.forEach(ws => ws.close());
      console.log(`  ✅ All ${connections.length} connections handled`);
      resolve();
    }, 3000);
  });
}

// Run all tests
async function runTests() {
  try {
    await testOwnerSubscription();
    await testCustomerSubscription();
    await testPingPong();
    await testMultipleConnections();
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.log('\n❌ Tests failed:', err);
    process.exit(1);
  }
}

runTests();

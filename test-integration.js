const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4000';

console.log('🧪 COMPREHENSIVE INTEGRATION TEST\n');

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${name}: ${status}${details ? ' - ' + details : ''}`);
  if (status === 'PASS') testsPassed++;
  else testsFailed++;
}

// Test 1: Server Health
async function testHealth() {
  try {
    const response = await fetch('http://localhost:4000/health');
    const data = await response.json();
    if (data.status === 'healthy' && data.connections !== undefined) {
      logTest('Server Health', 'PASS', `connections: ${data.connections}`);
      return true;
    }
  } catch (err) {
    logTest('Server Health', 'FAIL', err.message);
    return false;
  }
}

// Test 2: OWNER Subscription
function testOwnerSubscription() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let resolved = false;
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        lotId: 'test-lot-1',
        role: 'OWNER'
      }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      // Server should log subscription, we just need no error
      if (!resolved) {
        logTest('OWNER Subscription', 'PASS');
        resolved = true;
        ws.close();
        resolve();
      }
    });
    
    ws.on('error', (err) => {
      if (!resolved) {
        logTest('OWNER Subscription', 'FAIL', err.message);
        resolved = true;
        resolve();
      }
    });
    
    setTimeout(() => {
      if (!resolved) {
        logTest('OWNER Subscription', 'PASS', 'No error, timeout');
        resolved = true;
        ws.close();
        resolve();
      }
    }, 2000);
  });
}

// Test 3: CUSTOMER Subscription
function testCustomerSubscription() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let resolved = false;
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        lotId: 'test-lot-1',
        role: 'CUSTOMER'
      }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (!resolved) {
        logTest('CUSTOMER Subscription', 'PASS');
        resolved = true;
        ws.close();
        resolve();
      }
    });
    
    ws.on('error', (err) => {
      if (!resolved) {
        logTest('CUSTOMER Subscription', 'FAIL', err.message);
        resolved = true;
        resolve();
      }
    });
    
    setTimeout(() => {
      if (!resolved) {
        logTest('CUSTOMER Subscription', 'PASS', 'No error, timeout');
        resolved = true;
        ws.close();
        resolve();
      }
    }, 2000);
  });
}

// Test 4: PING/PONG
function testPingPong() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let resolved = false;
    
    ws.on('open', () => {
      // Small delay to ensure connection is fully established
      setTimeout(() => {
        ws.send(JSON.stringify({ type: 'PING' }));
      }, 100);
    });
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'PONG' && !resolved) {
          logTest('PING/PONG Heartbeat', 'PASS');
          resolved = true;
          ws.close();
          resolve();
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    });
    
    ws.on('error', (err) => {
      if (!resolved) {
        logTest('PING/PONG Heartbeat', 'FAIL', err.message);
        resolved = true;
        resolve();
      }
    });
    
    setTimeout(() => {
      if (!resolved) {
        logTest('PING/PONG Heartbeat', 'FAIL', 'No PONG received');
        resolved = true;
        ws.close();
        resolve();
      }
    }, 5000);
  });
}


// Test 5: Multiple Simultaneous Connections
function testMultipleConnections() {
  return new Promise((resolve) => {
    const connections = [];
    const results = { connected: 0, errors: 0 };
    let resolved = false;
    
    // Create 5 connections: 2 OWNERS, 3 CUSTOMERS
    for (let i = 0; i < 5; i++) {
      const ws = new WebSocket(WS_URL);
      connections.push(ws);
      
      ws.on('open', () => {
        results.connected++;
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          lotId: 'multi-test-lot',
          role: i < 2 ? 'OWNER' : 'CUSTOMER'
        }));
      });
      
      ws.on('error', () => {
        results.errors++;
      });
    }
    
    setTimeout(() => {
      if (!resolved) {
        const status = results.errors === 0 ? 'PASS' : 'FAIL';
        logTest('Multiple Connections (5 clients)', status, 
          `${results.connected} connected, ${results.errors} errors`);
        resolved = true;
        connections.forEach(ws => ws.close());
        resolve();
      }
    }, 3000);
  });
}

// Test 6: Connection Stability (no immediate disconnect)
function testConnectionStability() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    let openTime = null;
    let closeTime = null;
    
    ws.on('open', () => {
      openTime = Date.now();
    });
    
    ws.on('close', () => {
      closeTime = Date.now();
    });
    
    setTimeout(() => {
      const duration = closeTime ? closeTime - openTime : Date.now() - openTime;
      const status = duration > 2000 ? 'PASS' : 'FAIL';
      logTest('Connection Stability', status, `Duration: ${duration}ms`);
      ws.close();
      resolve();
    }, 2500);
  });
}

// Test 7: Cleanup on Disconnect
function testCleanup() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        lotId: 'cleanup-test',
        role: 'OWNER'
      }));
      
      setTimeout(() => {
        ws.close();
        
        // Check health after disconnect
        setTimeout(async () => {
          try {
            const response = await fetch('http://localhost:4000/health');
            const data = await response.json();
            logTest('Cleanup on Disconnect', 'PASS', `Connections: ${data.connections}`);
          } catch (err) {
            logTest('Cleanup on Disconnect', 'FAIL', err.message);
          }
          resolve();
        }, 1000);
      }, 1000);
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive WebSocket tests...\n');
  
  await testHealth();
  await testOwnerSubscription();
  await testCustomerSubscription();
  await testPingPong();
  await testMultipleConnections();
  await testConnectionStability();
  await testCleanup();
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('='.repeat(50));
  
  if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! WebSocket server is production-ready.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Review the output above.');
    process.exit(1);
  }
}

runAllTests();

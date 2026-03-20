
const http = require('http');

const data = JSON.stringify({
  lotId: "CHENNAI_CENTRAL",
  edgeNodeId: "edge-chennai-central-01",
  edgeToken: "token-chennai-central-secret",
  slots: []
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/edge/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  },
  timeout: 15000
};

console.log('🔔 Testing /api/edge/update heartbeat...');
console.log('Payload:', JSON.parse(data));

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`\n📡 Status: ${res.statusCode}`);
    try {
      console.log('📄 Response:', JSON.parse(body));
    } catch {
      console.log('📄 Raw Response:', body.substring(0, 500));
    }
    if (res.statusCode === 200) {
      console.log('\n✅ Heartbeat SUCCESS! Edge Node should show ONLINE on dashboard.');
    } else {
      console.log('\n❌ Heartbeat FAILED!');
    }
  });
});

req.on('timeout', () => {
  console.error('❌ Request timed out (15s)');
  req.destroy();
});

req.on('error', (e) => {
  console.error(`❌ Connection Error: ${e.message}`);
  console.error('Make sure Next.js is running on port 3000 (npm run dev)');
});

req.write(data);
req.end();

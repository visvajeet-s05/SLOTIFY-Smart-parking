
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
    console.log('✅ Connected to WebSocket server');
    ws.send(JSON.stringify({ type: 'PING' }));
});

ws.on('message', (data) => {
    console.log('📨 Received:', data.toString());
    ws.close();
});

ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err);
});

ws.on('close', () => {
    console.log('🔌 Connection closed');
});

setTimeout(() => {
    if (ws.readyState !== WebSocket.CLOSED) {
        console.error('❌ Connection timed out');
        ws.terminate();
    }
}, 5000);

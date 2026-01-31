const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io('http://localhost:3000', {
  path: '/api/socket'
});

console.log('Connecting to WebSocket server...');

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Test parking update event
  setTimeout(() => {
    console.log('🔄 Sending parking update...');
    socket.emit('parking:update', {
      parkingId: '1',
      availableSlots: 35,
      lat: 13.0827,
      lng: 80.2707
    });
  }, 2000);
  
  // Another test update
  setTimeout(() => {
    console.log('🔄 Sending another parking update...');
    socket.emit('parking:update', {
      parkingId: '2',
      availableSlots: 5,
      lat: 11.0168,
      lng: 76.9558
    });
  }, 4000);
});

socket.on('parking:update', (data) => {
  console.log('📡 Received parking update:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('error', (error) => {
  console.error('🚫 WebSocket error:', error);
});
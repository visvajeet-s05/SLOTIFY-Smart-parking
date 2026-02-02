const io = require('socket.io-client');

console.log('Testing Socket.IO connection...');

// Connect to the Socket.IO server
const socket = io('http://localhost:3001', {
  path: '/api/socket',
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Socket.IO connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test emitting a message
  socket.emit('test-message', { message: 'Hello from test script' });
  
  // Listen for parking updates
  socket.on('parking:update', (data) => {
    console.log('📡 Received parking update:', data);
  });
  
  // Disconnect after 5 seconds
  setTimeout(() => {
    console.log('Disconnecting...');
    socket.disconnect();
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket.IO connection failed:', error);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket.IO disconnected');
});

// Handle any errors
socket.on('error', (error) => {
  console.error('❌ Socket.IO error:', error);
});
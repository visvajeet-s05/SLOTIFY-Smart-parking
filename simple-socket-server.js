const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send test data every 3 seconds
  const interval = setInterval(() => {
    const testData = {
      parkingId: Math.floor(Math.random() * 12) + 1,
      availableSlots: Math.floor(Math.random() * 100),
      lat: 13.0827,
      lng: 80.2707
    };
    
    console.log('Sending test data:', testData);
    io.emit('parking:update', testData);
  }, 3000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
  console.log('Test data will be sent every 3 seconds');
});
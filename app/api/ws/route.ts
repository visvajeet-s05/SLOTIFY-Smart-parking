import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { socket, response } = await (request as any).socket;
  
  console.log('Client connected');
  
  socket.on('message', (data: any) => {
    console.log('Received message:', data.toString());
    // Echo the message back
    socket.send(`Echo: ${data.toString()}`);
  });
  
  socket.on('close', () => {
    console.log('Client disconnected');
  });
  
  // Send test data every 5 seconds
  const interval = setInterval(() => {
    const testData = JSON.stringify({
      type: 'parking:update',
      parkingId: Math.floor(Math.random() * 12) + 1,
      availableSlots: Math.floor(Math.random() * 100),
      lat: 13.0827,
      lng: 80.2707
    });
    socket.send(testData);
  }, 5000);
  
  socket.on('close', () => {
    clearInterval(interval);
  });
  
  return response;
}
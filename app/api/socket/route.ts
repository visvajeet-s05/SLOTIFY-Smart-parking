import { NextRequest } from 'next/server';
import { initSocket } from '@/lib/socket';

let io: any = null;

export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  if (request.headers.get('upgrade') === 'websocket') {
    const { socket, response } = await (request as any).socket;

    if (!io) {
      io = initSocket(socket);
      
      io.on('connection', (socket: any) => {
        console.log('Client connected:', socket.id);
        
        // Send test data every 5 seconds
        const interval = setInterval(() => {
          const testData = {
            parkingId: Math.floor(Math.random() * 12) + 1,
            availableSlots: Math.floor(Math.random() * 100),
            lat: 13.0827,
            lng: 80.2707
          };
          socket.emit('parking:update', testData);
        }, 5000);
        
        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
          clearInterval(interval);
        });
      });
    }

    return response;
  } else {
    // For non-WebSocket requests, return a simple response
    return new Response('WebSocket server is running', { status: 200 });
  }
}

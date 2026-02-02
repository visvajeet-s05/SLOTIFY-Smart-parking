import { NextRequest, NextResponse } from 'next/server';
import { Server } from 'socket.io';

// Global variable to store the Socket.IO server instance
declare global {
  var io: Server | undefined;
}

export async function GET(request: NextRequest) {
  // Check if Socket.IO server is already initialized
  if (!global.io) {
    console.error('Socket.IO server not initialized. Please ensure it is initialized in the main server.');
    return new NextResponse('WebSocket server not initialized', { status: 503 });
  }

  // Return a simple message indicating the WebSocket endpoint is available
  return new NextResponse('WebSocket endpoint ready. Connect using ws://localhost:3000/api/ws', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// Export the WebSocket handler for proper initialization
export const config = {
  api: {
    bodyParser: false,
  },
};
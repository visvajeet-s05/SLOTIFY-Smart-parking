import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Proxy to the Python OpenCV service
    const response = await fetch('http://localhost:5000/preview', {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Camera service unavailable' }, { status: 503 });
    }

    // Return the MJPEG stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error proxying camera preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

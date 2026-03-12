import { NextResponse } from 'next/server'

export async function GET() {
  console.log("🔍 Healthcheck hit at:", new Date().toISOString());
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'smart-parking-frontend'
  })
}

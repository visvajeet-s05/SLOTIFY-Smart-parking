import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("🔍 Healthcheck hit at:", new Date().toISOString());

  try {
    // STEP 7: Add DB Health Monitoring
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'healthy',
      db: 'connected',
      timestamp: new Date().toISOString(),
      service: 'smart-parking-frontend'
    });
  } catch (error: any) {
    console.error("❌ Database health check failed:", error);
    return NextResponse.json({
      status: 'unhealthy',
      db: 'disconnected',
      error: error?.message || 'Database connection lost',
      timestamp: new Date().toISOString(),
      service: 'smart-parking-frontend'
    }, { status: 503 });
  }
}

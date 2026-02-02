import { NextResponse } from "next/server"

export function middleware(request: Request) {
  // Add your middleware logic here
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
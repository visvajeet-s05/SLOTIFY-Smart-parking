import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "super-secret-jwt-key-change-in-production-123456789" })

  const pathname = req.nextUrl.pathname

  // If accessing dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // If not authenticated, redirect to home
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    const userRole = token.role as string

    // If accessing base /dashboard, redirect to role-specific dashboard
    if (pathname === '/dashboard') {
      const roleRedirects = {
        ADMIN: "/dashboard/admin",
        OWNER: "/dashboard/owner",
        CUSTOMER: "/dashboard",
        STAFF: "/dashboard/staff",
        GATE_OPERATOR: "/dashboard",
        SUPERVISOR: "/dashboard",
        MANAGER: "/dashboard"
      }
      const redirectUrl = roleRedirects[userRole as keyof typeof roleRedirects] || '/dashboard'
      // Only redirect if the redirect URL is different from current path
      if (redirectUrl !== '/dashboard') {
        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }
    }

    // Check if user is accessing their correct role-specific route
    const allowedRoutes = {
      ADMIN: ['/dashboard/admin'],
      OWNER: ['/dashboard/owner'],
      CUSTOMER: ['/dashboard'],
      STAFF: ['/dashboard/staff', '/dashboard'],
      GATE_OPERATOR: ['/dashboard'],
      SUPERVISOR: ['/dashboard'],
      MANAGER: ['/dashboard']
    }

    const userAllowedRoutes = allowedRoutes[userRole as keyof typeof allowedRoutes] || ['/dashboard']

    // If user is trying to access a route they're not allowed to, redirect to their correct route
    if (!userAllowedRoutes.some(route => pathname.startsWith(route))) {
      const correctRoute = userAllowedRoutes[0]
      return NextResponse.redirect(new URL(correctRoute, req.url))
    }

    // OWNER-specific access control: Ensure owner can only access their assigned parking lot
    if (userRole === "OWNER") {
      // Owner to Parking Lot mapping - 1 owner → 1 parking lot only
      const OWNER_PARKING_MAPPING: Record<string, string> = {
        "owner@gmail.com": "CHENNAI_CENTRAL",
        "owner1@gmail.com": "ANNA_NAGAR",
        "owner2@gmail.com": "T_NAGAR",
        "owner3@gmail.com": "VELACHERY",
        "owner4@gmail.com": "OMR",
        "owner5@gmail.com": "ADYAR",
        "owner6@gmail.com": "GUINDY",
        "owner7@gmail.com": "PORUR"
      }

      const ownerEmail = token.email as string
      const allowedLotId = OWNER_PARKING_MAPPING[ownerEmail]

      if (allowedLotId) {
        // Check if accessing a specific parking lot route
        const parkingLotMatch = pathname.match(/^\/dashboard\/owner\/parking-lots\/([^\/]+)/)
        if (parkingLotMatch) {
          const requestedLotId = parkingLotMatch[1]
          if (requestedLotId !== allowedLotId) {
            // Redirect to owner's correct parking lot
            return NextResponse.redirect(new URL(`/dashboard/owner/parking-lots/${allowedLotId}/slots`, req.url))
          }
        }
      }
    }
  }

  // Allow access to the route
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

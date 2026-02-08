import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { OWNER_PARKING_MAPPING } from "./lib/owner-mapping"

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

    // ✅ ENHANCED SECURITY: Check if user is trying to access another role's specific prefix
    const isAccessingAdmin = pathname.startsWith('/dashboard/admin')
    const isAccessingOwner = pathname.startsWith('/dashboard/owner')
    const isAccessingStaff = pathname.startsWith('/dashboard/staff')

    let isForbidden = false
    if (isAccessingAdmin && userRole !== 'ADMIN') isForbidden = true
    if (isAccessingOwner && userRole !== 'OWNER') isForbidden = true
    if (isAccessingStaff && userRole !== 'STAFF') isForbidden = true

    // If user is trying to access a route they're not allowed to, redirect to their correct route
    if (isForbidden || !userAllowedRoutes.some(route => pathname.startsWith(route))) {
      const correctRoute = userAllowedRoutes[0] || '/dashboard'
      return NextResponse.redirect(new URL(correctRoute, req.url))
    }

    // OWNER-specific access control: Ensure owner can only access their assigned parking lot
    if (userRole === "OWNER") {
      let allowedLotId = token.parkingLotId as string | undefined

      // Fallback to static mapping if not in token (e.g. old session)
      if (!allowedLotId) {
        const ownerEmail = (token.email as string).toLowerCase()
        allowedLotId = OWNER_PARKING_MAPPING[ownerEmail]
      }


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

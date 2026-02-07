import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"

interface NextRequestWithAuth extends NextRequest {
  nextAuth?: {
    token?: {
      role?: string
    }
  }
}

const roleRoutes = {
  ADMIN: "/dashboard/admin",
  OWNER: "/dashboard/owner",
  CUSTOMER: "/dashboard",
  STAFF: "/dashboard/staff",
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    if (!req.nextAuth?.token) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}

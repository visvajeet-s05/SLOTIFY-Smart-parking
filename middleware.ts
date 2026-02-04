import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const roleRoutes = {
  ADMIN: "/dashboard/admin",
  OWNER: "/dashboard/owner",
  CUSTOMER: "/dashboard",
  STAFF: "/dashboard/staff",
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname

  if (!token && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token) {
    const allowedBase = roleRoutes[token.role as keyof typeof roleRoutes]
    if (!path.startsWith(allowedBase)) {
      return NextResponse.redirect(new URL(allowedBase, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

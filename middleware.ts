import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const path = req.nextUrl.pathname

  // Not logged in → allow public pages
  if (!token) return NextResponse.next()

  // ADMIN
  if (token.role === "ADMIN" && !path.startsWith("/dashboard/admin")) {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url))
  }

  // OWNER
  if (token.role === "OWNER" && !path.startsWith("/dashboard/owner")) {
    return NextResponse.redirect(new URL("/dashboard/owner", req.url))
  }

  // CUSTOMER
  if (token.role === "CUSTOMER" && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/",
  ],
}

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Clear the session cookie
  const response = NextResponse.json({ message: "Logged out successfully" })
  response.cookies.set("next-auth.session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  })

  return response
}
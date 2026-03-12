import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password" }, { status: 400 })
  }

  try {
    // 1. Find and validate token
    const resetToken = await prisma.passwordresettoken.findUnique({
      where: { token }
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    })

    // 4. Delete the token so it can't be reused
    await prisma.passwordresettoken.delete({
      where: { token: token }
    })

    return NextResponse.json({ ok: true, message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
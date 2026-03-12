import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  const { email } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ ok: true }) // no email leak

  const token = randomBytes(32).toString("hex")

  // Create password reset token in database
  await prisma.passwordresettoken.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
    },
  })

  // In a real app, use NEXT_PUBLIC_BASE_URL or similar from env
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  // 👉 In production, send this via email. For now, we log it.
  console.log("------------------------------------------")
  console.log("📧 PASSWORD RESET REQUEST")
  console.log("Email:", email)
  console.log("Reset Link:", resetUrl)
  console.log("------------------------------------------")

  return NextResponse.json({ ok: true, message: "If an account exists with that email, a reset link has been sent." })
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  const { email } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ ok: true }) // no email leak

  const token = randomBytes(32).toString("hex")

  // TODO: Add passwordResetToken to Prisma schema to enable this
  // await prisma.passwordResetToken.create({
  //   data: {
  //     email,
  //     token,
  //     expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
  //   },
  // })

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  // 👉 send email (nodemailer / resend)
  console.log("RESET LINK:", resetUrl)

  return NextResponse.json({ ok: true })
}
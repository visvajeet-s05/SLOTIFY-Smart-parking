import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  // 👉 SEND EMAIL
  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (error) {
    console.error("Failed to send email through provider:", error);
  }

  return NextResponse.json({ ok: true, message: "If an account exists with that email, a reset link has been sent." })
}

/**
 * ROBUST EMAIL HELPER
 * Integrated with Resend for production.
 */
async function sendPasswordResetEmail(email: string, url: string) {
  if (resend) {
    try {
      await resend.emails.send({
        from: "Smart Parking <onboarding@resend.dev>",
        to: email,
        subject: "Reset Your Password - Smart Parking",
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your Smart Parking account.</p>
          <p>Click the link below to set a new password. This link expires in 30 minutes.</p>
          <a href="${url}" style="display:inline-block;background:#8b5cf6;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
          <br/><br/>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
      console.log("✅ [RESEND] Reset email sent to:", email);
    } catch (err) {
      console.error("❌ [RESEND] Error:", err);
      throw err;
    }
  } else {
    // Development Fallback
    console.log("------------------------------------------")
    console.log("📧 [DEV MODE] Sending reset link to:", email)
    console.log("URL:", url)
    console.log("------------------------------------------")
  }
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()
  return NextResponse.json({ error: "Password reset not fully implemented yet." }, { status: 501 })
}
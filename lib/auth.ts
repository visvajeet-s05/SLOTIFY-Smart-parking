import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { ownerprofile: true }
        })

        if (!user) {
          console.log("❌ User not found:", credentials.email)
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          console.log("❌ Invalid password for:", credentials.email)
          return null
        }

        let ownerStatus = null
        if (user.role === "OWNER") {
          ownerStatus = user.ownerprofile?.status || null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          ownerStatus,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ownerprofile: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

export async function getUserFromSession() {
  return await getCurrentUser()
}

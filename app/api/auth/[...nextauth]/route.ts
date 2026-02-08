import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Define types for session and token augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      parkingLotId?: string
    } & DefaultSession["user"]
  }
  interface User {
    id: string
    role: string
    parkingLotId?: string
    sessionMaxAge?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    parkingLotId?: string
    redirectUrl?: string
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          console.log("🔴 AUTHORIZE CALLED")

          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing credentials")
            return null
          }

          const email = credentials.email
          const password = credentials.password

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              ownerprofile: {
                select: {
                  parkinglot: {
                    select: {
                      id: true
                    },
                    take: 1
                  }
                }
              }
            }
          })

          if (!user) {
            console.log("❌ User not found in DB")
            return null
          }

          console.log("🔴 USER FOUND:", user.email, "ROLE:", user.role)

          const isValidPassword = await bcrypt.compare(password, user.password)
          if (!isValidPassword) {
            console.log("❌ Password mismatch")
            return null
          }

          const parkingLotId = user.ownerprofile?.parkinglot[0]?.id

          console.log("✅ AUTH SUCCESS - RETURNING USER", parkingLotId ? `with Lot: ${parkingLotId}` : "")

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            parkingLotId: parkingLotId
          }

        } catch (error) {
          console.error("🔴 AUTH ERROR:", error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // default 1 day
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.parkingLotId = user.parkingLotId

        // Set redirect URL based on role
        const roleRedirects: Record<string, string> = {
          CUSTOMER: '/dashboard',
          OWNER: '/dashboard/owner',
          ADMIN: '/dashboard/admin',
          STAFF: '/dashboard',
          GATE_OPERATOR: '/dashboard',
          SUPERVISOR: '/dashboard',
          MANAGER: '/dashboard'
        }
        token.redirectUrl = roleRedirects[user.role] || '/dashboard'

        // Set session max age if remember-me was requested
        if (user.sessionMaxAge) {
          token.exp = Math.floor(Date.now() / 1000) + user.sessionMaxAge
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.parkingLotId = token.parkingLotId
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "super-secret-jwt-key-change-in-production-123456789",
})

export { handler as GET, handler as POST }

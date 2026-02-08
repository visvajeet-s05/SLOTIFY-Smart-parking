import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { Role } from "@/lib/auth/roles"

let prisma: PrismaClient

try {
  prisma = new PrismaClient()
  console.log("🔴 Prisma client initialized")
} catch (error) {
  console.error("🔴 Prisma client initialization error:", error)
  prisma = new PrismaClient() // fallback
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

          console.log("🔴 EMAIL:", email)

          // Ensure prisma client is connected
          if (!prisma) {
            console.log("❌ Prisma client not initialized")
            return null
          }

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

          // Return user object in NextAuth expected format
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
        token.parkingLotId = (user as any).parkingLotId
        // Set redirect URL based on role
        const roleRedirects = {
          CUSTOMER: '/dashboard',
          OWNER: '/dashboard/owner',
          ADMIN: '/dashboard/admin',
          STAFF: '/dashboard',
          GATE_OPERATOR: '/dashboard',
          SUPERVISOR: '/dashboard',
          MANAGER: '/dashboard'
        }
        token.redirectUrl = roleRedirects[user.role as keyof typeof roleRedirects] || '/dashboard'
        // Set session max age if remember-me was requested
        if ('sessionMaxAge' in user && user.sessionMaxAge) {
          token.exp = Math.floor(Date.now() / 1000) + (user.sessionMaxAge as number)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.parkingLotId = token.parkingLotId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // After successful login, redirect to /dashboard
      // The middleware will handle role-based redirection from there
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

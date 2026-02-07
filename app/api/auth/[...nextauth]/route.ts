import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { Role } from "@/lib/auth/roles"

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        // Check if remember-me was requested
        const rememberMe = credentials.rememberMe === 'true'
        
        return {
          id: user.id,
          email: user.email,
          role: user.role as Role,
          name: user.name,
          sessionMaxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days if remember-me
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
      }
      return session
    },
  },


  secret: "super-secret-jwt-key-change-in-production-123456789",
})

export { handler as GET, handler as POST }

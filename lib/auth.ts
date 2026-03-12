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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            ownerprofile: {
              include: {
                parkinglot: true
              }
            }
          }
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
        let parkingLotId = null
        if (user.role === "OWNER") {
          ownerStatus = user.ownerprofile?.status || null
          // Get the first parking lot ID if exists
          if (user.ownerprofile?.parkinglot && user.ownerprofile.parkinglot.length > 0) {
            parkingLotId = user.ownerprofile.parkinglot[0].id
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ownerStatus,
          parkingLotId,
        } as any

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
        token.name = user.name
        token.role = user.role
        // @ts-ignore - attributes added in authorize return
        token.parkingLotId = user.parkingLotId
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.parkingLotId = token.parkingLotId as string | undefined
      }
      return session
    }

  },
  pages: {
    signIn: "/"
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownerprofile: {
        include: {
          parkinglot: true
        }
      }
    }
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

export async function getUserFromSession() {
  return await getCurrentUser()
}

export async function auth() {
  return await getServerSession(authOptions)
}

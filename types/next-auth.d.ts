import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      ownerStatus?: string
      stripeCustomerId?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: string
    stripeCustomerId?: string | null
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    name?: string
    ownerStatus?: string
    stripeCustomerId?: string | null
  }
}

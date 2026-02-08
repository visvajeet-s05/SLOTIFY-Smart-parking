import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      ownerStatus?: string
      parkingLotId?: string | null
    }

  }

  interface User {
    id: string
    email: string
    name?: string
    role: string
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    name?: string
    ownerStatus?: string
    parkingLotId?: string | null
  }
}

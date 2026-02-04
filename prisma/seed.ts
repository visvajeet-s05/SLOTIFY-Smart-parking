import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()

  const hash = (p: string) => bcrypt.hashSync(p, 10)

  await prisma.user.create({
    data: { 
      id: crypto.randomUUID(),
      name: "Admin",
      email: "admin@slotify.com", 
      password: hash("admin@slotify"), 
      role: "ADMIN",
      updatedAt: new Date(),
    },
  })
}

main().finally(() => prisma.$disconnect())

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()

  const hash = (p: string) => bcrypt.hashSync(p, 10)

  await prisma.user.create({
    data: { 
      email: "admin@slotify.com", 
      password: hash("admin@slotify"), 
      role: "ADMIN" 
    },
  })
}

main().finally(() => prisma.$disconnect())
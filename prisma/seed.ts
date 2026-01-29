import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()

  const hash = (p: string) => bcrypt.hashSync(p, 10)

  await prisma.user.create({
    data: { email: "admin@gmail.com", password: hash("admin@123"), role: "ADMIN", name: "Admin" },
  })
  await prisma.user.create({
    data: { email: "owner@gmail.com", password: hash("owner@123"), role: "OWNER", name: "Owner" },
  })
  await prisma.user.create({
    data: { email: "owner1@gmail.com", password: hash("owner1@123"), role: "OWNER", name: "Owner1" },
  })
  await prisma.user.create({
    data: { email: "owner2@gmail.com", password: hash("owner2@123"), role: "OWNER", name: "Owner2" },
  })
  await prisma.user.create({
    data: { email: "visvajeet@gmail.com", password: hash("visvajeet@123"), role: "CUSTOMER", name: "Visvajeet" },
  })
}

main().finally(() => prisma.$disconnect())

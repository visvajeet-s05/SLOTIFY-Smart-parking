import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const ownerPassword = await bcrypt.hash("owner@123", 10)
  const customerPassword = await bcrypt.hash("visvajeet", 10)

  await prisma.user.upsert({
    where: { email: "owner@gmail.com" },
    update: {},
    create: {
      name: "Test Owner",
      email: "owner@gmail.com",
      password: ownerPassword,
      role: "OWNER",
    } as any,
  })

  await prisma.user.upsert({
    where: { email: "owner1@gmail.com" },
    update: {},
    create: {
      name: "Test Owner 1",
      email: "owner1@gmail.com",
      password: ownerPassword,
      role: "OWNER",
    } as any,
  })

  await prisma.user.upsert({
    where: { email: "owner2@gmail.com" },
    update: {},
    create: {
      email: "owner2@gmail.com",
      password: ownerPassword,
      role: "OWNER",
      name: "Test Owner 2",
    } as any,
  })

  await prisma.user.upsert({
    where: { email: "visvajeet@gmail.com" },
    update: {},
    create: {
      name: "Visvajeet",
      email: "visvajeet@gmail.com",
      password: customerPassword,
      role: "CUSTOMER",
    } as any,
  })

  console.log("✅ Users seeded correctly")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

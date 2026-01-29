const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const passwordHash = async (password) => await bcrypt.hash(password, 10)

  const owners = [
    {
      id: "owner-1",
      email: "owner@gmail.com",
      password: await passwordHash("owner@123"),
      role: "OWNER",
      name: "Test Owner",
    },
    {
      id: "owner-2",
      email: "owner1@gmail.com",
      password: await passwordHash("owner1@123"),
      role: "OWNER",
      name: "Test Owner 1",
    },
    {
      id: "owner-3",
      email: "owner2@gmail.com",
      password: await passwordHash("owner2@123"),
      role: "OWNER",
      name: "Test Owner 2",
    },
  ]

  const customers = [
    {
      id: "customer-1",
      email: "visvajeet@gmail.com",
      password: await passwordHash("visvajeet"),
      role: "CUSTOMER",
      name: "Visvajeet Customer",
    },
  ]

  for (const owner of owners) {
    await prisma.user.upsert({
      where: { email: owner.email },
      update: {},
      create: owner,
    })
  }

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: { password: customer.password },
      create: customer,
    })
  }

  console.log("✅ Owners seeded successfully")
  console.log("✅ Customer seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

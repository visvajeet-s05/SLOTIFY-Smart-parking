const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const passwordHash = async (password) => await bcrypt.hash(password, 10)

  const admins = [
    {
      id: "admin-1",
      email: "admin@slotify.com",
      password: await passwordHash("admin@slotify"),
      role: "ADMIN",
    },
  ]

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: admin,
    })
  }

  console.log("✅ Admin user seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
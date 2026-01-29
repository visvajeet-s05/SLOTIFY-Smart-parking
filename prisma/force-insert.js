const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function run() {
  console.log("DB:", process.env.DATABASE_URL)

  const hashed = await bcrypt.hash("admin@123", 10)

  const user = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashed,
      role: "ADMIN",
    },
  })

  console.log("INSERTED USER:", user)
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

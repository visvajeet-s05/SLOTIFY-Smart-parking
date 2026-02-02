const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetUser() {
  try {
    await prisma.user.deleteMany({
      where: { email: "owner@gmail.com" },
    });
    const hashedPassword = await bcrypt.hash("owner@123", 10);
    await prisma.user.create({
      data: {
        email: "owner@gmail.com",
        password: hashedPassword,
        role: "OWNER",
      },
    });
    console.log('User reset for owner@gmail.com');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUser();

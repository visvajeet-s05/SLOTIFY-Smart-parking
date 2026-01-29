const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const hashedPassword = await bcrypt.hash("owner@123", 10);
    await prisma.user.update({
      where: { email: "owner@gmail.com" },
      data: { password: hashedPassword },
    });
    console.log('Password updated for owner@gmail.com');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();

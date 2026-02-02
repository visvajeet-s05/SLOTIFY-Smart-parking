const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestUsers() {
  try {
    console.log('Setting up test users...');

    // Test users to create
    const testUsers = [
      {
        name: 'Visvajeet',
        email: 'visvajeet@gmail.com',
        password: 'visvajeet@123',
        role: 'CUSTOMER'
      },
      {
        name: 'Manish',
        email: 'manish@gmail.com',
        password: 'manish@123',
        role: 'CUSTOMER'
      },
      {
        name: 'Chennai Central Parking',
        email: 'owner@gmail.com',
        password: 'owner@123',
        role: 'OWNER'
      },
      {
        name: 'Anna Nagar Tower Parking',
        email: 'owner1@gmail.com',
        password: 'owner1@123',
        role: 'OWNER'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`User ${userData.name} already exists, updating...`);
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            name: userData.name,
            role: userData.role
          }
        });
      } else {
        console.log(`Creating user ${userData.name}...`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        await prisma.user.create({
          data: {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            updatedAt: new Date()
          }
        });
      }
    }

    console.log('✅ Test users setup completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin Users:');
    console.log('  - Visvajeet: visvajeet@gmail.com / visvajeet@123 → /dashboard');
    console.log('  - Manish: manish@gmail.com / manish@123 → /dashboard');
    console.log('\nOwner Users:');
    console.log('  - Chennai Central Parking: owner@gmail.com / owner@123 → /dashboard/owner');
    console.log('  - Anna Nagar Tower Parking: owner1@gmail.com / owner1@123 → /dashboard/owner');

  } catch (error) {
    console.error('❌ Error setting up test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUsers();
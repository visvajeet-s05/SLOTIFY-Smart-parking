const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testOwnerRegistration() {
  console.log('🧪 Testing Owner Registration API...\n');

  try {
    // Test data
    const testData = {
      name: 'Test Owner',
      email: 'test-owner-reg@example.com',
      password: 'password123'
    };

    console.log('1. Testing registration API...');

    // Make API call
    const response = await fetch('http://localhost:3000/api/owner/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Registration API response:', result);

    // Verify user was created
    console.log('\n2. Verifying user creation...');
    const createdUser = await prisma.user.findUnique({
      where: { email: testData.email },
      include: { ownerProfile: true }
    });

    if (!createdUser) {
      throw new Error('User was not created');
    }

    console.log('✅ User created:', {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role
    });

    // Verify password is hashed
    const passwordMatch = await bcrypt.compare(testData.password, createdUser.password);
    if (!passwordMatch) {
      throw new Error('Password was not hashed correctly');
    }
    console.log('✅ Password is properly hashed');

    // Verify OwnerProfile was created
    if (!createdUser.ownerProfile) {
      throw new Error('OwnerProfile was not created');
    }

    console.log('✅ OwnerProfile created:', {
      id: createdUser.ownerProfile.id,
      userId: createdUser.ownerProfile.userId,
      status: createdUser.ownerProfile.status
    });

    // Verify status is OWNER_ONBOARDING
    if (createdUser.ownerProfile.status !== 'OWNER_ONBOARDING') {
      throw new Error(`OwnerProfile status is ${createdUser.ownerProfile.status}, expected OWNER_ONBOARDING`);
    }
    console.log('✅ OwnerProfile status is correct: OWNER_ONBOARDING');

    console.log('\n🎉 Owner registration test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: 'test-owner-reg@example.com' }
    });
    await prisma.$disconnect();
  }
}

testOwnerRegistration();

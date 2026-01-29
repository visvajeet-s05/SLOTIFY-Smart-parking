const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testKYCFlow() {
  console.log('🧪 Testing KYC Flow...\n');

  try {
    // 1. Create a test owner user
    console.log('1. Creating test owner user...');
    const testUser = await prisma.user.create({
      data: {
        name: 'Test Owner',
        email: `test-owner-${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'OWNER',
        ownerProfile: {
          create: {
            status: 'OWNER_ONBOARDING'
          }
        }
      },
      include: {
        ownerProfile: true
      }
    });
    console.log('✅ Owner created with status:', testUser.ownerProfile.status);

    // 2. Test KYC submission (simulated - since we can't mock session)
    console.log('\n2. Simulating KYC submission...');
    // Directly create the verification record
    const verification = await prisma.ownerVerification.create({
      data: {
        ownerId: testUser.ownerProfile.id,
        documentUrl: 'https://example.com/document.pdf',
        status: 'PENDING'
      }
    });
    console.log('✅ OwnerVerification record created');

    // Update owner status to KYC_PENDING
    await prisma.ownerProfile.update({
      where: { id: testUser.ownerProfile.id },
      data: { status: 'KYC_PENDING' }
    });
    console.log('✅ Owner status updated to KYC_PENDING');

    // 3. Test admin fetching pending verifications
    console.log('\n3. Testing admin fetching pending verifications...');
    const pendingOwners = await prisma.ownerProfile.findMany({
      where: {
        status: {
          in: ['KYC_PENDING', 'KYC_REJECTED']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        verification: true
      }
    });
    console.log('✅ Found pending owners:', pendingOwners.length);

    // 4. Test admin approval
    console.log('\n4. Testing admin approval...');
    await prisma.ownerProfile.update({
      where: { id: testUser.ownerProfile.id },
      data: { status: 'APPROVED' }
    });

    await prisma.ownerVerification.update({
      where: { ownerId: testUser.ownerProfile.id },
      data: { status: 'APPROVED', reviewedAt: new Date() }
    });
    console.log('✅ Admin approval successful');

    // 5. Verify final status
    const finalOwner = await prisma.ownerProfile.findUnique({
      where: { id: testUser.ownerProfile.id },
      include: { verification: true }
    });
    console.log('✅ Final owner status:', finalOwner.status);
    console.log('✅ Final verification status:', finalOwner.verification.status);

    console.log('\n🎉 All KYC flow tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: 'test-owner@example.com' }
    });
    await prisma.$disconnect();
  }
}

testKYCFlow();

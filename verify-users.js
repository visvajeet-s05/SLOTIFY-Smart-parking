const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Password hints for verification
const passwordHints = {
  'admin@slotify.com': 'admin@slotify',
  'owner@gmail.com': 'owner@123',
  'owner1@gmail.com': 'owner1@123',
  'owner2@gmail.com': 'owner2@123',
  'owner3@gmail.com': 'owner3@123',
  'owner4@gmail.com': 'owner4@123',
  'owner5@gmail.com': 'owner5@123',
  'owner6@gmail.com': 'owner6@123',
  'owner7@gmail.com': 'owner7@123',
  'visvajeet@gmail.com': 'visvajeet@123',

  'manish@gmail.com': 'manish@123'
};

async function verifyUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' }
      ]
    });

    console.log('\n✅ USERS VERIFICATION COMPLETE!\n');
    console.log('Total users found:', users.length);
    console.log('\n📋 User Credentials List:');
    console.log('=====================================');
    
    users.forEach(user => {
      const passwordHint = passwordHints[user.email] || 'Unknown';
      console.log(`\n👤 ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${passwordHint}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    });

    // Summary by role
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const ownerCount = users.filter(u => u.role === 'OWNER').length;
    const customerCount = users.filter(u => u.role === 'CUSTOMER').length;

    console.log('\n\n📊 Summary by Role:');
    console.log('=====================================');
    console.log(`👑 Admin: ${adminCount}`);
    console.log(`🏢 Owners: ${ownerCount}`);
    console.log(`🚗 Customers: ${customerCount}`);
    console.log(`📈 Total: ${users.length}`);

    console.log('\n\n🔑 Quick Login Reference:');
    console.log('=====================================');
    console.log('ADMIN:');
    console.log('  admin@slotify.com / admin@slotify');
    console.log('\nOWNERS (8 parking lots):');
    console.log('  owner@gmail.com / owner@123 → Chennai Central');
    console.log('  owner1@gmail.com / owner1@123 → Anna Nagar');
    console.log('  owner2@gmail.com / owner2@123 → T Nagar');
    console.log('  owner3@gmail.com / owner3@123 → Velachery');
    console.log('  owner4@gmail.com / owner4@123 → OMR Tech Park');
    console.log('  owner5@gmail.com / owner5@123 → Adyar Beachside');
    console.log('  owner6@gmail.com / owner6@123 → Guindy Industrial');
    console.log('  owner7@gmail.com / owner7@123 → Porur Residential');
    console.log('\nCUSTOMERS:');
    console.log('  visvajeet@gmail.com / visvajeet@123');
    console.log('  manish@gmail.com / manish@123');

    if (users.length === 11) {
      console.log('\n✅ All 11 users verified successfully!');
    } else {
      console.log(`\n⚠️ Expected 11 users, found ${users.length}`);
    }


  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUsers();

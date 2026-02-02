const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUserComplete(userId) {
  try {
    console.log(`Starting deletion for user: ${userId}`);
    
    // Delete related records in the correct order to avoid foreign key constraints
    
    // 1. Delete vehicles (references user)
    console.log('Deleting vehicles...');
    await prisma.vehicle.deleteMany({
      where: { userId }
    });
    
    // 2. Delete owner profiles (references user)
    console.log('Deleting owner profiles...');
    await prisma.ownerprofile.deleteMany({
      where: { userId }
    });
    
    // 3. Delete subscriptions (references user)
    console.log('Deleting subscriptions...');
    await prisma.subscription.deleteMany({
      where: { userId }
    });
    
    // 4. Delete bookings (references user as customer and owner)
    console.log('Deleting bookings...');
    await prisma.booking.deleteMany({
      where: {
        OR: [
          { customerId: userId },
          { ownerId: userId }
        ]
      }
    });
    
    // 5. Delete parking lots (references user as owner)
    console.log('Deleting parking lots...');
    await prisma.parkinglot.deleteMany({
      where: { ownerId: userId }
    });
    
    // 6. Delete price audits (references user)
    console.log('Deleting price audits...');
    await prisma.priceaudit.deleteMany({
      where: { triggeredBy: userId }
    });
    
    // 7. Delete blockchain payments (references user)
    console.log('Deleting blockchain payments...');
    await prisma.blockchainpayment.deleteMany({
      where: {
        OR: [
          { payer: userId },
          { owner: userId }
        ]
      }
    });
    
    // 8. Finally delete the user
    console.log('Deleting user...');
    const result = await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log(`Successfully deleted user: ${result.email}`);
    return true;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return false;
  }
}

async function deleteSpecificUsers() {
  try {
    // First, let's find the actual user IDs for the email addresses
    const jane = await prisma.user.findUnique({
      where: { email: 'jane@customer.com' }
    });
    
    const john = await prisma.user.findUnique({
      where: { email: 'john@owner.com' }
    });
    
    console.log('Users to delete:', {
      jane: jane ? jane.id : 'Not found',
      john: john ? john.id : 'Not found'
    });
    
    if (jane) {
      await deleteUserComplete(jane.id);
    }
    
    if (john) {
      await deleteUserComplete(john.id);
    }
    
    console.log('Deletion process completed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSpecificUsers();
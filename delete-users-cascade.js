const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUsersCascade() {
  try {
    // First get user IDs
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['jane@customer.com', 'john@owner.com']
        }
      },
      select: { id: true }
    });
    
    const userIds = users.map(u => u.id);
    
    console.log('Found users to delete:', userIds);
    
    // Delete related records
    if (prisma.subscription) {
      await prisma.subscription.deleteMany({
        where: {
          userId: {
            in: userIds
          }
        }
      });
      console.log('Deleted subscriptions');
    }
    
    if (prisma.vehicle) {
      await prisma.vehicle.deleteMany({
        where: {
          userId: {
            in: userIds
          }
        }
      });
      console.log('Deleted vehicles');
    }
    
    if (prisma.ownerProfile) {
      await prisma.ownerProfile.deleteMany({
        where: {
          userId: {
            in: userIds
          }
        }
      });
      console.log('Deleted owner profiles');
    }
    
    // Then delete users
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });
    
    console.log(`Deleted ${result.count} users`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsersCascade();
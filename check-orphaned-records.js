const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrphanedRecords() {
  try {
    // Check for any remaining records that might reference the deleted users
    const customerVehicles = await prisma.vehicle.count({
      where: { userId: 'customer-001' }
    });
    
    const ownerVehicles = await prisma.vehicle.count({
      where: { userId: 'owner-001' }
    });
    
    const customerBookings = await prisma.booking.count({
      where: { customerId: 'customer-001' }
    });
    
    const ownerBookings = await prisma.booking.count({
      where: { ownerId: 'owner-001' }
    });
    
    const ownerLots = await prisma.parkinglot.count({
      where: { ownerId: 'owner-001' }
    });
    
    console.log('Orphaned records check:');
    console.log('Customer vehicles remaining:', customerVehicles);
    console.log('Owner vehicles remaining:', ownerVehicles);
    console.log('Customer bookings remaining:', customerBookings);
    console.log('Owner bookings remaining:', ownerBookings);
    console.log('Owner parking lots remaining:', ownerLots);
    
  } finally {
    await prisma.$disconnect();
  }
}

checkOrphanedRecords();
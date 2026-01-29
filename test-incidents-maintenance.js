const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIncidentsAndMaintenance() {
  console.log('🧪 Testing Incidents and Maintenance Database Models...\n');

  let testUser;
  let testParkingLot;

  try {
    // Create test user
    console.log('1. Creating test user...');
    testUser = await prisma.user.create({
      data: {
        name: 'Test Owner for Incidents',
        email: 'test-incidents@example.com',
        password: 'hashedpassword',
        role: 'OWNER'
      }
    });
    console.log('✅ Test user created:', testUser.id);

    // Create test owner profile
    console.log('\n2. Creating test owner profile...');
    const testOwnerProfile = await prisma.ownerProfile.create({
      data: {
        businessName: 'Test Business',
        phone: '1234567890',
        user: {
          connect: { id: testUser.id }
        }
      }
    });
    console.log('✅ Test owner profile created:', testOwnerProfile.id);

    // Create test parking lot
    console.log('\n3. Creating test parking lot...');
    testParkingLot = await prisma.parkingLot.create({
      data: {
        ownerId: testOwnerProfile.id,
        name: 'Test Parking Lot',
        address: '123 Test St',
        lat: 40.7128,
        lng: -74.0060
      }
    });
    console.log('✅ Test parking lot created:', testParkingLot.id);

    // Test Incident creation
    console.log('\n3. Testing Incident creation...');
    const testIncident = await prisma.incident.create({
      data: {
        ownerId: testUser.id,
        parkingLotId: testParkingLot.id,
        title: 'Test Incident',
        description: 'This is a test incident',
        severity: 'HIGH'
      }
    });
    console.log('✅ Incident created:', testIncident.id);

    // Test Incident fetching
    console.log('\n4. Testing Incident fetching...');
    const incidents = await prisma.incident.findMany({
      where: { ownerId: testUser.id }
    });
    console.log('✅ Incidents fetched:', incidents.length, 'incidents');

    // Test Maintenance creation
    console.log('\n5. Testing Maintenance creation...');
    const testMaintenance = await prisma.maintenance.create({
      data: {
        ownerId: testUser.id,
        parkingLotId: testParkingLot.id,
        title: 'Test Maintenance',
        startDate: new Date('2024-01-01T10:00:00Z'),
        endDate: new Date('2024-01-01T12:00:00Z')
      }
    });
    console.log('✅ Maintenance created:', testMaintenance.id);

    // Test Maintenance fetching
    console.log('\n6. Testing Maintenance fetching...');
    const maintenances = await prisma.maintenance.findMany({
      where: { ownerId: testUser.id }
    });
    console.log('✅ Maintenances fetched:', maintenances.length, 'maintenances');

    // Test relations
    console.log('\n7. Testing relations...');
    const userWithIncidents = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { ownerIncidents: true, ownerMaintenance: true }
    });
    console.log('✅ User incidents:', userWithIncidents.ownerIncidents.length);
    console.log('✅ User maintenances:', userWithIncidents.ownerMaintenance.length);

    const parkingLotWithIncidents = await prisma.parkingLot.findUnique({
      where: { id: testParkingLot.id },
      include: { incidents: true, maintenance: true }
    });
    console.log('✅ Parking lot incidents:', parkingLotWithIncidents.incidents.length);
    console.log('✅ Parking lot maintenances:', parkingLotWithIncidents.maintenance.length);

    console.log('\n🎉 All database model tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Cleanup
    console.log('\n8. Cleaning up test data...');
    if (testParkingLot) {
      await prisma.parkingLot.delete({ where: { id: testParkingLot.id } }).catch(() => {});
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
    console.log('✅ Cleanup completed');
  }
}

testIncidentsAndMaintenance();

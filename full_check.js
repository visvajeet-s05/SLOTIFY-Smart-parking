
const fetch = require('node-fetch');

async function check() {
  const BASE = 'http://localhost:3000';
  
  console.log('--- Checking /api/parking ---');
  const res1 = await fetch(`${BASE}/api/parking`);
  const data1 = await res1.json();
  console.log('Success:', data1.success);
  console.log('Count:', data1.count);
  if (data1.parkingAreas) {
    data1.parkingAreas.forEach(a => {
        console.log(`- ${a.id}: ${a.availableSlots}/${a.totalSlots} slots, Status: ${a.status}, EdgeNode: ${a.edgeNodeId}`);
    });
  }

  console.log('\n--- Checking /api/parking/VELACHERY/slots ---');
  const res2 = await fetch(`${BASE}/api/parking/VELACHERY/slots`);
  const data2 = await res2.json();
  console.log('Slot Count:', data2.slots ? data2.slots.length : 0);
  console.log('Lot Name:', data2.lot ? data2.lot.name : 'N/A');
}

check().catch(console.error);


const fs = require('fs');
const raw = fs.readFileSync('final_check.json', 'utf8');
// Strip BOM if present
const data = JSON.parse(raw.replace(/^\uFEFF/, ''));
console.log('Count:', data.count);
data.parkingAreas.forEach(p => {
    console.log(`- ${p.id}: ${p.availableSlots}/${p.totalSlots} slots (${p.status})`);
});

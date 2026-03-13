
const fs = require('fs');
const content = fs.readFileSync('railway-seed.sql', 'utf8');
const lotMatches = content.match(/INSERT IGNORE INTO `parkinglot`/gi);
const slotMatches = content.match(/INSERT IGNORE INTO `Slot`/gi);
console.log('Parking Lot Inserts:', lotMatches ? lotMatches.length : 0);
console.log('Slot Inserts:', slotMatches ? slotMatches.length : 0);

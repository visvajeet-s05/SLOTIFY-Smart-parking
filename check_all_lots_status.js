
const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  const lots = await p.parkinglot.findMany({
    select: { id: true, edgeNodeId: true, lastHeartbeat: true }
  });
  const now = new Date();
  console.log('\n=== ALL PARKING LOTS - ONLINE STATUS ===\n');
  lots.forEach(l => {
    const diff = l.lastHeartbeat ? (now - new Date(l.lastHeartbeat)) / 1000 : null;
    const online = diff !== null && diff < 300;
    const icon = online ? '🟢' : '🔴';
    console.log(`${icon} ${l.id}`);
    console.log(`   Node: ${l.edgeNodeId || 'NO NODE CONFIGURED'}`);
    console.log(`   Status: ${online ? 'ONLINE ✅' : 'OFFLINE ❌'}`);
    console.log(`   Last HB: ${diff !== null ? diff.toFixed(0) + 's ago' : 'NEVER'}`);
    console.log('');
  });
  await p.$disconnect();
}

main().catch(e => { console.error(e); p.$disconnect(); });

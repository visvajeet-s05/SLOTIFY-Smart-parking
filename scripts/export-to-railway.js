/**
 * ============================================================
 * SMART PARKING — Local MySQL → Railway MySQL Data Exporter
 * ============================================================
 * Run this script ONCE after setting up Railway MySQL to export
 * all your existing local data to the cloud database.
 *
 * Usage:
 *   node scripts/export-to-railway.js
 *
 * This generates: railway-seed.sql
 * Then run that SQL file in your Railway MySQL shell.
 * ============================================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Tables to export (in dependency order — no FK violations)
const TABLES = [
  'user',
  'ownerprofile',
  'parkingsetupprogress',
  'ownerverification',
  'ownerstaff',
  'parkinglot',
  'parkingslot',
  'Camera',
  'Slot',
  'SlotStatusLog',
  'pricingrule',
  'priceaudit',
  'booking',
  'payment',
  'refund',
  'review',
  'vehicle',
  'Fastag',
  'subscription',
  'maintenanceschedule',
  'ownerincident',
  'ownerinvoice',
  'ownermaintenance',
  'ownersettlement',
  'ownersupportticket',
  'parkingincident',
  'demandprediction',
  'event',
  'exchangerate',
];

async function exportDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  // Parse the connection string
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    console.error('❌ Could not parse DATABASE_URL:', dbUrl);
    process.exit(1);
  }
  const [, user, password, host, port, database] = match;

  console.log(`🔌 Connecting to local MySQL: ${host}:${port}/${database}`);
  const conn = await mysql.createConnection({ host, port: parseInt(port), user, password, database });

  const outputPath = path.join(__dirname, '..', 'railway-seed.sql');
  const lines = [];

  lines.push('-- ============================================================');
  lines.push('-- Smart Parking — Railway Seed Data');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- ============================================================');
  lines.push('');
  lines.push('SET FOREIGN_KEY_CHECKS = 0;');
  lines.push('');

  let totalRows = 0;

  for (const table of TABLES) {
    try {
      const [rows] = await conn.execute(`SELECT * FROM \`${table}\``);
      if (!Array.isArray(rows) || rows.length === 0) {
        console.log(`  ⬜ ${table}: empty — skipped`);
        continue;
      }

      lines.push(`-- ── ${table} (${rows.length} rows) ──`);
      for (const row of rows) {
        const cols = Object.keys(row).map(c => `\`${c}\``).join(', ');
        const vals = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          if (typeof v === 'number') return v;
          if (typeof v === 'boolean') return v ? 1 : 0;
          return `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
        }).join(', ');
        lines.push(`INSERT IGNORE INTO \`${table}\` (${cols}) VALUES (${vals});`);
      }
      lines.push('');
      totalRows += rows.length;
      console.log(`  ✅ ${table}: ${rows.length} rows`);
    } catch (err) {
      console.log(`  ⚠️  ${table}: ${err.message} (skipped)`);
    }
  }

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');
  lines.push('');
  lines.push(`-- Total: ${totalRows} rows exported`);

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  await conn.end();

  console.log('');
  console.log(`✅ Export complete! ${totalRows} rows → railway-seed.sql`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Open Railway dashboard → MySQL plugin → Query tab');
  console.log('   2. Paste the contents of railway-seed.sql and run it');
  console.log('   OR use Railway CLI:');
  console.log('      railway run mysql < railway-seed.sql');
}

exportDatabase().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});

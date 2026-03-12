const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
    console.log('🚀 Starting Railway Production Seeding...');

    const config = {
        host: 'shuttle.proxy.rlwy.net',
        user: 'root',
        password: 'RforpYfVwhuZqHwfgMsYSQODwhKpdlKW',
        port: 52646,
        database: 'railway',
        multipleStatements: true
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log('📂 Reading railway-seed.sql...');
        const seedPath = path.join(__dirname, '..', 'railway-seed.sql');
        let seedSql = fs.readFileSync(seedPath, 'utf8');
        
        // Strip BOM and null characters
        seedSql = seedSql.replace(/^\uFEFF/, '').replace(/\0/g, '');
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        
        console.log('🛰️ Executing data insertion on Railway (this may take a minute)...');
        await connection.query(seedSql);
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('🏆 SEEDING COMPLETED PERFECTLY! Your database is now ready.');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await connection.end();
    }
}

seed();

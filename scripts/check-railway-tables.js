const mysql = require('mysql2/promise');

async function checkTables() {
    const config = {
        host: 'shuttle.proxy.rlwy.net',
        user: 'root',
        password: 'RforpYfVwhuZqHwfgMsYSQODwhKpdlKW',
        port: 52646,
        database: 'railway'
    };

    const connection = await mysql.createConnection(config);
    try {
        const [rows] = await connection.query('SHOW TABLES;');
        console.log('--- Tables Found ---');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });
        console.log('-------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkTables();

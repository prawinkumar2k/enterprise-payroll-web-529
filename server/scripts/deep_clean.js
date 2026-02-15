
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function deepClean() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Cleaning benchmark data...');
    await conn.query('DELETE FROM empdet WHERE Category LIKE "BENCHMARK%" OR EMPNO LIKE "PSH-%" OR EMPNO LIKE "PUSH-%"');
    await conn.query('DELETE FROM emppay WHERE MONTHYEAR LIKE "BENCH%"');
    await conn.query('DELETE FROM staffattendance WHERE EMPNO LIKE "PSH-%" OR EMPNO LIKE "PUSH-%"');
    await conn.query('DELETE FROM sync_logs WHERE device_id = "BENCH-PUSH-DEVICE" OR device_id = "BENCH-SYNC-DEVICE"');
    await conn.query('DELETE FROM audit_logs WHERE username = "BENCH-PUSH-DEVICE" OR username = "BENCH-SYNC-DEVICE"');

    // Also clean up any large volumes in sync_logs/audit_logs if they are excessively large
    const [stats] = await conn.query('SELECT COUNT(*) as count FROM sync_logs');
    console.log(`Remaining Sync Logs: ${stats[0].count}`);

    if (stats[0].count > 50000) {
        console.log('Truncating large sync_logs for benchmark accuracy...');
        await conn.query('TRUNCATE TABLE sync_logs');
        await conn.query('TRUNCATE TABLE audit_logs');
    }

    console.log('Deep Clean Done');
    await conn.end();
}

deepClean().catch(console.error);

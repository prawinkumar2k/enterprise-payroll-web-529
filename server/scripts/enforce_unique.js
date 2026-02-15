
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function enforceUniqueness() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const targetTables = ['empdet', 'emppay', 'staffattendance'];

    for (const table of targetTables) {
        console.log(`Cleaning and indexing ${table}...`);
        // Remove duplicates if any (keep the one with highest ID)
        await conn.query(`
            DELETE t1 FROM \`${table}\` t1
            INNER JOIN \`${table}\` t2 
            WHERE t1.id < t2.id AND t1.uuid = t2.uuid
        `);

        try {
            await conn.query(`ALTER TABLE \`${table}\` ADD UNIQUE INDEX idx_unique_uuid (uuid)`);
            console.log(`✓ Unique index added to ${table}`);
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log(`✓ Unique index already exists for ${table}`);
            } else {
                console.error(`✗ Failed for ${table}: ${e.message}`);
            }
        }
    }

    await conn.end();
}

enforceUniqueness().catch(console.error);

import pool from './db.js';
import fs from 'fs';

async function checkDb() {
    try {
        const [rows] = await pool.query('SELECT * FROM emppay WHERE MONTHYEAR = "02-2026" LIMIT 5');
        fs.writeFileSync('db-dump-02-2026.json', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
checkDb();

import pool from '../db.js';

async function check() {
    try {
        const [rows] = await pool.query("DESCRIBE empdet");
        console.log("Columns:", rows.map(r => r.Field).join(', '));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();

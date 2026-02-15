import pool from './db.js';

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE app_settings');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();

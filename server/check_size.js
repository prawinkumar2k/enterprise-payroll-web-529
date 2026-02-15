import pool from './db.js';

async function checkSize() {
    try {
        const [rows] = await pool.query('SELECT setting_key, LENGTH(setting_value) as size FROM app_settings');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSize();

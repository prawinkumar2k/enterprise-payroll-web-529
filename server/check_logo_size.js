import pool from './db.js';

async function checkSize() {
    try {
        const [rows] = await pool.query('SELECT setting_key, LENGTH(setting_value) as size FROM app_settings WHERE setting_key = "org_logo_url"');
        console.log("LOGO SIZE IN DB:", rows[0] ? rows[0].size : "NOT FOUND");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSize();

import pool from './db.js';

async function migrate() {
    try {
        await pool.query('ALTER TABLE app_settings MODIFY setting_value LONGTEXT');
        console.log("Table altered successfully to LONGTEXT");

        // Ensure org_logo_url key is present if not already
        const [rows] = await pool.query('SELECT * FROM app_settings WHERE setting_key = "org_logo_url"');
        if (rows.length === 0) {
            await pool.query('INSERT INTO app_settings (setting_key, setting_value) VALUES ("org_logo_url", "")');
            console.log("org_logo_url key initialized");
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

migrate();

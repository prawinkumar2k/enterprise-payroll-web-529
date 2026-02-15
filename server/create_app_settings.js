import pool from './db.js';

async function createAppSettingsTable() {
    console.log("Creating app_settings table...");

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS app_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT,
                category VARCHAR(50) DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("app_settings table created successfully.");
    } catch (error) {
        console.error("Error creating app_settings table:", error);
    } finally {
        process.exit();
    }
}

createAppSettingsTable();
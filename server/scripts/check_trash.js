import pool from '../db.js';

async function check() {
    try {
        const [rows] = await pool.query("DESCRIBE emptrash");
        console.log("Trash Table Exists. Columns:", rows.length);
        process.exit(0);
    } catch (e) {
        console.error("Trash table error:", e.message);
        // Create it if missing
        try {
            console.log("Creating emptrash...");
            await pool.query("CREATE TABLE IF NOT EXISTS emptrash LIKE empdet");
            console.log("Trash table created.");
        } catch (e2) {
            console.error("Failed to create trash table:", e2.message);
        }
        process.exit(0);
    }
}

check();

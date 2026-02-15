import pool from './db.js';

async function setup() {
    try {
        console.log("Setting up organization_settings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS organization_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address_line1 TEXT,
                address_line2 TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                phone VARCHAR(50),
                email VARCHAR(100),
                website VARCHAR(255),
                tagline TEXT,
                logo_url TEXT,
                sig_1_label VARCHAR(100) DEFAULT 'Prepared By',
                sig_2_label VARCHAR(100) DEFAULT 'Checked By',
                sig_3_label VARCHAR(100) DEFAULT 'Verified By',
                sig_4_label VARCHAR(100) DEFAULT 'Principal/Authorised Signatory',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert default record if empty
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM organization_settings");
        if (rows[0].count === 0) {
            await pool.query(`
                INSERT INTO organization_settings (name, address_line1, city, pincode)
                VALUES ('CAUVERY COLLEGE FOR WOMEN (AUTONOMOUS)', 'Annamalai Nagar', 'Tiruchirappalli', '620018')
            `);
            console.log("Default record inserted.");
        }

        console.log("Setup successful!");
        process.exit(0);
    } catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
}

setup();

import pool from './db.js';

async function migrate() {
    try {
        console.log("Creating unified app_settings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS app_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                category VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Seed initial settings
        const defaultSettings = [
            // 1. Organization
            ['org_name', 'CAUVERY COLLEGE FOR WOMEN (AUTONOMOUS)', 'organization'],
            ['org_address', 'Annamalai Nagar, Tiruchirappalli - 620018', 'organization'],
            ['org_tagline', 'Accredited with "A++" Grade by NAAC', 'organization'],
            ['org_logo_url', 'https://cauverycollege.ac.in/images/logo.png', 'organization'],
            ['org_phone', '0431-2730620', 'organization'],
            ['org_email', 'cauverycollege_try@rediffmail.com', 'organization'],

            // 2. Report Titles
            ['title_pay_bill', 'PAY BILL DETAIL REPORT', 'reports'],
            ['title_bank_statement', 'BANK STATEMENT ADVICE', 'reports'],
            ['title_abstract_1', 'STATUTORY ABSTRACT (PF/ESI/ESI)', 'reports'],
            ['title_abstract_2', 'PAYMENT DISTRIBUTION ABSTRACT', 'reports'],
            ['title_pay_certificate', 'EMPLOYEE PAY CERTIFICATE', 'reports'],
            ['title_staff_report', 'STAFF MASTER REGISTER', 'reports'],

            // 3. Feature Toggles
            ['enable_pay_bill', 'true', 'features'],
            ['enable_bank_statement', 'true', 'features'],
            ['enable_abstract_1', 'true', 'features'],
            ['enable_abstract_2', 'true', 'features'],
            ['enable_pay_certificate', 'true', 'features'],
            ['enable_staff_report', 'true', 'features'],

            // 4. Print & Style
            ['print_font_family', 'Times New Roman', 'print'],
            ['print_font_size', '10pt', 'print'],
            ['print_table_font_size', '9pt', 'print'],
            ['print_show_page_number', 'true', 'print'],
            ['print_show_timestamp', 'true', 'print'],

            // 5. Signature Labels
            ['sig_1_label', 'Prepared By', 'signatures'],
            ['sig_2_label', 'Checked By', 'signatures'],
            ['sig_3_label', 'Verified By', 'signatures'],
            ['sig_4_label', 'Principal/Authorised Signatory', 'signatures'],

            // 6. Calculation Settings
            ['calc_epf_percent', '12', 'calculation'],
            ['calc_esi_percent', '0.75', 'calculation']
        ];

        for (const [key, val, cat] of defaultSettings) {
            await pool.query(
                'INSERT INTO app_settings (setting_key, setting_value, category) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE category = ?',
                [key, val, cat, cat]
            );
        }

        console.log("Global Settings Table Initialized successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();

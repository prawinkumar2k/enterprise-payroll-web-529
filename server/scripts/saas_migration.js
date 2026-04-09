import db from '../db.js';

async function columnExists(table, column) {
    const [rows] = await db.query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [table, column]
    );
    return rows.length > 0;
}

async function tableExists(table) {
    const [rows] = await db.query(
        'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [table]
    );
    return rows.length > 0;
}

async function migrate() {
    console.log('--- Enhanced SaaS Migration: Column Checking ---');

    // 1. Companies table
    console.log('Partitioning "companies" table...');
    if (await tableExists('companies')) {
        if (!(await columnExists('companies', 'status'))) {
            await db.query(`ALTER TABLE companies ADD COLUMN status ENUM('active', 'suspended', 'expired') DEFAULT 'active'`);
        }
        if (!(await columnExists('companies', 'plan_details'))) {
            await db.query(`ALTER TABLE companies ADD COLUMN plan_details JSON NULL`);
        }
        if (!(await columnExists('companies', 'expiry_date'))) {
            await db.query(`ALTER TABLE companies ADD COLUMN expiry_date DATE NULL`);
        }
        if (!(await columnExists('companies', 'license_key'))) {
            await db.query(`ALTER TABLE companies ADD COLUMN license_key VARCHAR(255) NULL`);
        }
        if (!(await columnExists('companies', 'plan_id'))) {
            await db.query(`ALTER TABLE companies ADD COLUMN plan_id INT DEFAULT 1`);
        }
        if (!(await columnExists('companies', 'company_code'))) {
            await db.query(`ALTER TABLE companies ADD COLUMN company_code VARCHAR(20) UNIQUE`);
        }
    } else {
        await db.query(`
            CREATE TABLE companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_code VARCHAR(20) NOT NULL UNIQUE,
                company_name VARCHAR(100) NOT NULL,
                status ENUM('active', 'suspended', 'expired') DEFAULT 'active',
                plan_id INT DEFAULT 1,
                expiry_date DATE,
                license_key VARCHAR(255),
                plan_details JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    // 2. Add partitioning company_id to other tables
    const tablesToPartition = [
        'userdetails', 'empdet', 'emppay', 'payroll_reversals', 'login_attempts',
        'userlogs', 'refresh_tokens', 'app_settings', 'income_entries', 
        'expense_entries', 'staffattendance', 'attendance_front', 
        'Exam_Mark', 'acadamic_calander'
    ];

    for (const table of tablesToPartition) {
        if (await tableExists(table)) {
            if (!(await columnExists(table, 'company_id'))) {
                console.log(`Adding company_id to ${table}...`);
                await db.query(`ALTER TABLE \`${table}\` ADD COLUMN company_id INT DEFAULT 1`);
                await db.query(`ALTER TABLE \`${table}\` ADD INDEX idx_company_id (company_id)`);
            }
        }
    }

    // 3. Plans table
    console.log('Partitioning "plans" table...');
    if (await tableExists('plans')) {
        if (!(await columnExists('plans', 'duration_months'))) {
            await db.query(`ALTER TABLE plans ADD COLUMN duration_months INT DEFAULT 12`);
        }
        if (!(await columnExists('plans', 'max_users'))) {
            await db.query(`ALTER TABLE plans ADD COLUMN max_users INT DEFAULT 10`);
        }
        if (!(await columnExists('plans', 'max_records'))) {
            await db.query(`ALTER TABLE plans ADD COLUMN max_records INT DEFAULT 1000`);
        }
    } else {
        await db.query(`
            CREATE TABLE plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plan_name VARCHAR(50) NOT NULL UNIQUE,
                duration_months INT DEFAULT 12,
                max_users INT DEFAULT 10,
                max_records INT DEFAULT 1000,
                features JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    // 4. Default Plan
    await db.query(`
        INSERT IGNORE INTO plans (plan_name, duration_months, max_users, max_records)
        VALUES ('Standard', 12, 50, 5000)
    `);

    // 5. Super Admin
    if (!(await tableExists('super_admins'))) {
        await db.query(`
            CREATE TABLE super_admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    console.log('✅ SaaS Migration Complete');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});

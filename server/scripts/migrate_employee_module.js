import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const createTablesSql = `
CREATE TABLE IF NOT EXISTS employee_attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    company_id INT NOT NULL,
    punch_in_time DATETIME NOT NULL,
    punch_out_time DATETIME,
    in_selfie_url TEXT,
    out_selfie_url TEXT,
    in_lat DECIMAL(10, 8),
    in_lng DECIMAL(11, 8),
    out_lat DECIMAL(10, 8),
    out_lng DECIMAL(11, 8),
    is_remote BOOLEAN DEFAULT FALSE,
    status ENUM('PRESENT', 'HALF_DAY', 'ABSENT', 'ON_LEAVE', 'PENDING') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT NOT NULL,
    employee_id INT NOT NULL,
    company_id INT NOT NULL,
    description TEXT,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    company_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    selfie_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    company_id INT NOT NULL,
    permission_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    from_time TIME NOT NULL,
    to_time TIME NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    selfie_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mirror the master auth table for JOINs in tenant context
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    emp_no VARCHAR(50) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        const [companies] = await pool.query('SELECT id, company_code FROM billing_db.companies WHERE company_code IS NOT NULL');
        
        for (const co of companies) {
            const dbName = `payroll_${co.company_code.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
            console.log(`[Migration] Processing ${dbName}...`);
            const conn = await pool.getConnection();
            await conn.query(`USE ${dbName}`);
            
            // 1. Core Table Schema
            const statements = createTablesSql.split(';').filter(s => s.trim());
            for (const stmt of statements) {
                try { await conn.query(stmt); } catch (e) {
                    if (!e.message.includes('Duplicate')) console.warn('[Migration Warning]', e.message);
                }
            }

            // 2. Add Payroll Columns (Manual check to avoid SQL syntax errors on older versions)
            const addCols = [
                'ALTER TABLE emppay ADD COLUMN lop_days DECIMAL(5,1) DEFAULT 0',
                'ALTER TABLE emppay ADD COLUMN lop_deduction DECIMAL(10,2) DEFAULT 0'
            ];
            for (const colStmt of addCols) {
                try {
                    await conn.query(colStmt);
                    console.log(`[Migration] Column added: ${colStmt.split(' ')[4]}`);
                } catch (e) {
                    if (!e.message.includes('Duplicate column')) {
                        console.warn('[Migration Info] Column skip:', e.message);
                    }
                }
            }

            // 3. Sync employees from billing_db to tenant DB
            console.log(`[Sync] Refreshing local 'employees' mirror for ${dbName}...`);
            const [masterEmps] = await pool.query('SELECT * FROM billing_db.employees WHERE company_id = ?', [co.id]);
            
            await conn.query('DELETE FROM employees'); // Clear current mirror
            if (masterEmps.length > 0) {
                const fields = ['id', 'company_id', 'name', 'username', 'password', 'role', 'emp_no', 'is_active'];
                const values = masterEmps.map(e => fields.map(f => e[f]));
                await conn.query(
                    `INSERT INTO employees (${fields.join(',')}) VALUES ?`,
                    [values]
                );
            }
            
            conn.release();
            console.log(`[OK] ${dbName} migration complete.`);
        }
        
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await pool.end();
    }
}

migrate();

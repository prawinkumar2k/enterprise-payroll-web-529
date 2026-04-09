import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function seedData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Prawin@2k4',
        database: process.env.DB_NAME || 'payroll_system',
        multipleStatements: true
    });

    try {
        console.log('🌱 Starting Enterprise Demo Seeding...');

        // 1. Create Sample Employees
        console.log('   - Creating Employees...');
        const employees = [
            ['EMP001', 'John Doe', 'Software Engineer', 'IT', 'Active', 50000],
            ['EMP002', 'Jane Smith', 'HR Manager', 'HR', 'Active', 65000],
            ['EMP003', 'Mike Brown', 'Junior Dev', 'IT', 'Active', 35000],
            ['EMP004', 'Sarah Wilson', 'Accountant', 'Finance', 'Active', 55000],
            ['EMP005', 'Kevin Lee', 'Intern', 'IT', 'Active', 15000]
        ];

        for (const [empno, name, design, cat, status, pay] of employees) {
            await connection.query(`
                INSERT INTO empdet (uuid, EMPNO, SNAME, DESIGNATION, Category, CheckStatus, PAY, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE SNAME = VALUES(SNAME), PAY = VALUES(PAY)
            `, [uuidv4(), empno, name, design, cat, status, pay]);
        }

        // 2. Create Attendance for March 2026
        console.log('   - Creating Attendance (March 2026)...');
        // Only insert columns that exist in the single-tenant schema (from SingleTenantSchema.sql)
        for (let day = 1; day <= 28; day++) { // Seed most of the month
            const date = `2026-03-${day.toString().padStart(2, '0')}`;
            for (const [empno] of employees) {
                const status = Math.random() > 0.05 ? 'Present' : 'Absent';
                await connection.query(`
                    INSERT INTO staffattendance (uuid, ADATE, EMPNO, AttType, \`Leave\`, LOP)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE AttType = VALUES(AttType)
                `, [uuidv4(), date, empno, status, status === 'Present' ? 0.0 : 1.0, status === 'Absent' ? 1.0 : 0.0]);
            }
        }

        // 3. Create Sample Payroll for March 2026
        console.log('   - Generating Sample Payroll (March 2026)...');
        for (const [empno, name, design, cat, status, pay] of employees) {
            const basic = parseFloat(pay);
            const da = basic * 0.46; // 46% DA
            const hra = basic * 0.27; // 27% HRA (HATA)
            const gross = basic + da + hra;
            const epf = basic * 0.12; // 12% PF
            const pt = 200;
            const deductions = epf + pt;
            const net = gross - deductions;
            
            await connection.query(`
                INSERT INTO emppay (
                    uuid, MONTHYEAR, EMPNO, SNAME, Designation, DGroup, 
                    PAY, DA, HATA, GROSSPAY, EPF, PT, TOTDED, NETSAL, created_at
                )
                VALUES (?, '03-2026', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE GROSSPAY = VALUES(GROSSPAY), NETSAL = VALUES(NETSAL)
            `, [uuidv4(), empno, name, design, cat, basic, da, hra, gross, epf, pt, deductions, net]);
        }

        console.log('✅ Demo Seed Successful.');

    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await connection.end();
    }
}
seedData();

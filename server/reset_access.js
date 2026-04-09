import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function resetAccess() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Prawin@2k4',
        database: process.env.DB_NAME || 'payroll_system'
    });

    try {
        const hashedPassword = await bcrypt.hash('password@123', 10);
        
        console.log('Resetting Admin credentials...');
        await connection.query(`
            INSERT INTO users (uuid, UserID, Password, UserName, role)
            VALUES (?, 'admin', ?, 'Administrator', 'admin')
            ON DUPLICATE KEY UPDATE Password = ?, role = 'admin'
        `, [uuidv4(), hashedPassword, hashedPassword]);

        console.log('Creating Super Admin credentials...');
        await connection.query(`
            INSERT INTO users (uuid, UserID, Password, UserName, role)
            VALUES (?, 'superadmin', ?, 'Super Administrator', 'super_admin')
            ON DUPLICATE KEY UPDATE Password = ?, role = 'super_admin'
        `, [uuidv4(), hashedPassword, hashedPassword]);

        console.log('Creating Employee credentials...');
        await connection.query(`
            INSERT INTO users (uuid, UserID, Password, UserName, role)
            VALUES (?, 'emp001', ?, 'Demo Employee', 'employee')
            ON DUPLICATE KEY UPDATE Password = ?, role = 'employee'
        `, [uuidv4(), hashedPassword, hashedPassword]);

        console.log('✅ Access Reset Complete.');
        console.log('ADMIN: admin / password@123');
        console.log('SUPERADMIN: superadmin / password@123');
        console.log('STAFF: emp001 / password@123');
        
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await connection.end();
    }
}
resetAccess();

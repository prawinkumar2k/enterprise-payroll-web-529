import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Prawin@2k4',
        database: process.env.DB_NAME || 'payroll_system'
    });

    try {
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log('User count in payroll_system.users:', rows[0].count);
        
        if (rows[0].count > 0) {
            const [users] = await connection.query('SELECT id, UserID, role FROM users');
            console.log(users);
        } else {
            console.log('No users found. Should we seed?');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}
checkUsers();

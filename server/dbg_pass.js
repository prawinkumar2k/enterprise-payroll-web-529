import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function getAdminPassword() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Prawin@2k4',
        database: process.env.DB_NAME || 'payroll_system'
    });

    try {
        const [rows] = await connection.query('SELECT UserID, Password, role FROM users WHERE UserID = ?', ['admin']);
        console.log('Admin Info:', rows[0]);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}
getAdminPassword();

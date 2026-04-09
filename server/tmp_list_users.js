import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function listUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payroll_system'
    });

    try {
        console.log('Listing users for payroll_system:');
        const [rows] = await connection.query('SELECT UserID, role FROM users LIMIT 20');
        console.table(rows);
    } catch (err) {
        console.error('Error fetching users:', err.message);
    } finally {
        await connection.end();
    }
}

listUsers();

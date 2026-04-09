import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Hp/Documents/enterprise-payroll-web-529/server/.env' });

async function getColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Prawin@2k4',
        database: process.env.DB_NAME || 'payroll_system'
    });

    try {
        const [rows] = await connection.query('DESC staffattendance');
        console.table(rows);
        
        const [rows2] = await connection.query('DESC att_monthly_summary');
        console.table(rows2);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}
getColumns();

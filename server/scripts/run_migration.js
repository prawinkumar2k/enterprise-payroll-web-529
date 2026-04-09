import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Prawin@2k4',
    });

    console.log('Creating database payroll_system...');
    await connection.query('CREATE DATABASE IF NOT EXISTS payroll_system');
    await connection.query('USE payroll_system');

    const schemaPath = path.join(process.cwd(), 'server', 'database', 'singleTenantSchema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual queries (basic version)
    const queries = schema.split(';').map(q => q.trim()).filter(q => q.length > 0);

    for (const q of queries) {
        try {
            await connection.query(q);
        } catch (err) {
            console.error('Error executing query:', q.substring(0, 50), '...', err.message);
        }
    }

    console.log('Database migration complete.');
    await connection.end();
}

migrate();

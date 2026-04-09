import db from '../db.js';
import bcrypt from 'bcryptjs';

async function seed() {
    const username = 'superadmin';
    const password = 'Password@123';
    
    console.log(`Checking super_admins for user: ${username}...`);
    const [rows] = await db.query('SELECT id FROM super_admins WHERE username = ?', [username]);
    
    if (rows.length === 0) {
        console.log('Creating default Super Admin...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO super_admins (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, 'admin@enterprise-payroll.com']
        );
        console.log('✅ Super Admin created.');
        console.log('Username: superadmin');
        console.log('Password: Password@123');
    } else {
        console.log('ℹ️ Super Admin already exists.');
    }
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});

import pool from './db.js';

async function testAttendance() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM staffattendance WHERE DATE(ADATE) = "2026-02-10"');
        console.log('Attendance count for 2026-02-10:', rows[0].count);

        const [emps] = await pool.query('SELECT COUNT(*) as count FROM empdet WHERE CheckStatus IN ("Active", "True") OR CheckStatus IS NULL');
        console.log('Active employees:', emps[0].count);

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

testAttendance();
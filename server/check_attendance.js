import pool from './db.js';

async function checkAttendance() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM staffattendance');
        console.log('Attendance records:', rows[0].count);

        const [emps] = await pool.query('SELECT COUNT(*) as count FROM empdet WHERE CheckStatus IN ("Active", "True") OR CheckStatus IS NULL');
        console.log('Active employees:', emps[0].count);

        // Check recent attendance
        const [recent] = await pool.query('SELECT ADATE, COUNT(*) as count FROM staffattendance GROUP BY ADATE ORDER BY ADATE DESC LIMIT 5');
        console.log('Recent attendance dates:', recent);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkAttendance();
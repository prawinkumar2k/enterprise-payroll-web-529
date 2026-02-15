import pool from './db.js';

async function checkSalary() {
    try {
        const [rows] = await pool.query('SELECT EMPNO, SNAME, LeaveDays, WorkingDays, NoofDays FROM emppay WHERE MONTHYEAR = "SEP 2026" LIMIT 5');
        console.log('Sample salary records:', rows);

        // Check if there was attendance data for Sep 2026
        const [att] = await pool.query('SELECT COUNT(*) as count FROM staffattendance WHERE ADATE LIKE "2026-09-%"');
        console.log('Sep 2026 attendance records:', att[0].count);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSalary();
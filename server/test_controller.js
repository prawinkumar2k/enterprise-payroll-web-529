import pool from './db.js';

async function testController() {
    try {
        const [attendanceRows] = await pool.query('SELECT EMPNO, AttType, Remark, Sessions, LOP, Leave FROM staffattendance WHERE DATE(ADATE) = "2026-02-10"');
        console.log('Attendance rows:', attendanceRows.length);

        const [employees] = await pool.query('SELECT EMPNO, SNAME, Designation, Category FROM empdet WHERE (CheckStatus = "Active" OR CheckStatus = "True" OR CheckStatus IS NULL)');
        console.log('Employee rows:', employees.length);
        console.log('First employee:', employees[0]);

        // Test the merge logic
        const attendanceMap = new Map();
        attendanceRows.forEach(row => {
            attendanceMap.set(row.EMPNO, row);
        });

        const data = employees.slice(0, 3).map(emp => {
            const att = attendanceMap.get(emp.EMPNO);
            return {
                EMPNO: emp.EMPNO,
                SNAME: emp.SNAME,
                Designation: emp.Designation,
                Category: emp.Category,
                Status: att ? att.AttType : '',
                Remark: att ? att.Remark : '',
                Sessions: att ? att.Sessions : 'Full',
                LOP: att ? att.LOP : '0.0',
                Leave: att ? att.Leave : '0.0'
            };
        });

        console.log('Merged data sample:', data);

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

testController();
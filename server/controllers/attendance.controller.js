import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';
import metricsService from '../services/metrics.service.js';

export const getDailyAttendance = async (req, res) => {
    const { date, category } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
    }

    try {
        // 1. Fetch Existing Attendance for the Date
        const [attendanceRows] = await dbManager.query(
            'SELECT EMPNO, AttType, Remark, Sessions, LOP, `Leave` FROM staffattendance WHERE DATE(ADATE) = ?',
            [date]
        );

        // 2. Fetch Active Employees
        let empQuery = `
            SELECT EMPNO, SNAME, Designation, Category 
            FROM empdet 
            WHERE (CheckStatus = 'Active' OR CheckStatus = 'True' OR CheckStatus IS NULL)
        `;
        let empParams = [];

        if (category && category !== 'ALL') {
            empQuery += ' AND Category LIKE ?';
            empParams.push(`%${category}%`);
        }

        const [employees] = await dbManager.query(empQuery, empParams);

        // 3. Merge Data
        const attendanceMap = new Map();
        if (attendanceRows && attendanceRows.length > 0) {
            attendanceRows.forEach(row => {
                attendanceMap.set(row.EMPNO, row);
            });
        }

        const data = employees.map(emp => {
            const att = attendanceMap.get(emp.EMPNO);
            return {
                EMPNO: emp.EMPNO,
                SNAME: emp.SNAME,
                Designation: emp.Designation,
                Category: emp.Category,
                Status: att ? att.AttType : '', // Default empty if not marked
                Remark: att ? att.Remark : '',
                Sessions: att ? att.Sessions : 'Full',
                LOP: att ? att.LOP : '0.0',
                Leave: att ? att.Leave : '0.0'
            };
        });

        res.json({ success: true, data });

    } catch (error) {
        console.error('Get Daily Attendance Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching attendance' });
    }
};

export const markDailyAttendance = async (req, res) => {
    const { date, records } = req.body;
    const user = req.user;

    if (!date || !records || !Array.isArray(records)) {
        return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    const connection = await dbManager.getConnection();


    try {
        await connection.beginTransaction();

        // 1. Check if Payroll is Locked for this Month (Optional - Implementation later)
        // const [lockCheck] = await connection.query('SELECT * FROM payroll_locks WHERE month_year = ?', [formatMonthYear(date)]);
        // if (lockCheck.length > 0) throw new Error("Payroll already finalized for this month.");

        // 2. Upsert Records
        for (const record of records) {
            const { EMPNO, Status, Remark, SNAME, Designation } = record;

            // Calculate Leave/LOP logic based on Status
            // (Assuming Status is one of: Present, Absent, CL, ML, OD, LOP, WO, H)
            let leaveCount = (Status !== 'Present' && Status !== 'WO' && Status !== 'H') ? 1.0 : 0.0;
            let lopCount = (Status === 'LOP' || Status === 'Absent') ? 1.0 : 0.0;

            // Delete existing record for this employee on this date to replace it
            await connection.query(
                'DELETE FROM staffattendance WHERE EMPNO = ? AND DATE(ADATE) = ?',
                [EMPNO, date]
            );

            if (Status) { // Only insert if a status is provided
                const uuid = randomUUID();
                await connection.query(
                    `INSERT INTO staffattendance 
                    (uuid, ADATE, EMPNO, SNAME, DESIGNATION, Category, AttType, \`Leave\`, Sessions, Remark, LOP, CREATED_BY, is_synced, device_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'SERVER_01')`,
                    [uuid, date, EMPNO, SNAME, Designation, record.Category || '', Status, leaveCount, 'Full', Remark || '', lopCount, user.username]
                );
            }
        }

        await connection.commit();

        // 3. Audit Logging
        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'UPDATE_ATTENDANCE',
            module: 'ATTENDANCE',
            description: `Updated attendance for ${date} (${records.length} records)`,
            newValue: { date, count: records.length },
            ip: req.socket.remoteAddress
        });

        res.json({ success: true, message: 'Attendance updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error saving attendance' });
    } finally {
        connection.release();
    }
};

export const getMonthlyAttendance = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

        // 1. Fetch All Active Employees and join with their monthly summary
        const query = `
            SELECT 
                e.EMPNO,
                e.SNAME,
                COUNT(CASE WHEN a.AttType IN ('Present', 'OD', 'H') THEN 1 END) as PresentDays,
                COUNT(CASE WHEN a.AttType = 'Absent' THEN 1 END) as AbsentDays,
                COUNT(CASE WHEN a.AttType = 'LOP' THEN 1 END) as LOPDays,
                COUNT(CASE WHEN a.AttType IN ('CL', 'ML', 'PL') THEN 1 END) as LeaveDays,
                COUNT(CASE WHEN a.AttType = 'WO' THEN 1 END) as WeekOffs,
                COUNT(CASE WHEN a.AttType = 'OD' THEN 1 END) as ODDays,
                COUNT(CASE WHEN a.AttType = 'H' THEN 1 END) as HalfDays
            FROM empdet e
            LEFT JOIN staffattendance a ON e.EMPNO = a.EMPNO 
                AND a.ADATE BETWEEN ? AND ?
            WHERE e.CheckStatus IN ('Active', 'True') OR e.CheckStatus IS NULL
            GROUP BY e.EMPNO, e.SNAME
        `;

        const [rows] = await dbManager.query(query, [startDate, endDate]);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Monthly Attendance Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching monthly summary' });
    }
};

export const getAttendanceReports = async (req, res) => {
    const { type, month, year, empno } = req.query;

    if (!type || !month || !year) {
        return res.status(400).json({ success: false, message: 'Type, month, and year are required' });
    }

    try {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        let query = '';
        let params = [];

        switch (type) {
            case 'daily-register':
                query = `
                    SELECT
                        a.ADATE,
                        a.EMPNO,
                        a.SNAME,
                        a.DESIGNATION,
                        a.Category,
                        a.AttType as Status,
                        a.Remark
                    FROM staffattendance a
                    WHERE a.ADATE BETWEEN ? AND ?
                    ORDER BY a.ADATE, a.EMPNO
                `;
                params = [startDate, endDate];
                break;

            case 'monthly-summary':
                query = `
                    SELECT
                        e.EMPNO,
                        e.SNAME,
                        e.DESIGNATION,
                        e.Category,
                        COUNT(CASE WHEN a.AttType IN ('Present', 'OD', 'H') THEN 1 END) as PresentDays,
                        COUNT(CASE WHEN a.AttType = 'Absent' THEN 1 END) as AbsentDays,
                        COUNT(CASE WHEN a.AttType = 'LOP' THEN 1 END) as LOPDays,
                        COUNT(CASE WHEN a.AttType IN ('CL', 'ML', 'PL') THEN 1 END) as LeaveDays,
                        COUNT(CASE WHEN a.AttType = 'WO' THEN 1 END) as WeekOffs,
                        COUNT(CASE WHEN a.AttType = 'OD' THEN 1 END) as ODDays,
                        COUNT(CASE WHEN a.AttType = 'H' THEN 1 END) as HalfDays
                    FROM empdet e
                    LEFT JOIN staffattendance a ON e.EMPNO = a.EMPNO
                        AND a.ADATE BETWEEN ? AND ?
                    WHERE e.CheckStatus IN ('Active', 'True') OR e.CheckStatus IS NULL
                    GROUP BY e.EMPNO, e.SNAME, e.DESIGNATION, e.Category
                    ORDER BY e.EMPNO
                `;
                params = [startDate, endDate];
                break;

            case 'employee-card':
                if (!empno) {
                    return res.status(400).json({ success: false, message: 'Employee number required for employee card' });
                }
                query = `
                    SELECT
                        a.ADATE,
                        a.AttType as Status,
                        a.Remark
                    FROM staffattendance a
                    WHERE a.EMPNO = ? AND a.ADATE BETWEEN ? AND ?
                    ORDER BY a.ADATE
                `;
                params = [empno, startDate, endDate];
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid report type' });
        }

        const [rows] = await dbManager.query(query, params);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Attendance Reports Error:', error);
        res.status(500).json({ success: false, message: 'Server error generating report' });
    }
};

/**
 * Import Attendance from Excel
 * Expects: { records: [{ date, empno, status, remark }] }
 */
export const importAttendance = async (req, res) => {
    const { records } = req.body;
    const user = req.user;

    if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'No records provided' });
    }

    const connection = await dbManager.getConnection();

    try {
        await connection.beginTransaction();

        let imported = 0;
        const errors = [];

        for (const record of records) {
            const { date, empno, status, remark } = record;

            // Validate required fields
            if (!date || !empno || !status) {
                errors.push(`Skipped record: Missing required fields (date: ${date}, empno: ${empno}, status: ${status})`);
                continue;
            }

            // Fetch employee details
            const [empRows] = await connection.query(
                'SELECT SNAME, DESIGNATION, Category FROM empdet WHERE EMPNO = ?',
                [empno]
            );

            if (empRows.length === 0) {
                errors.push(`Employee ${empno} not found`);
                continue;
            }

            const emp = empRows[0];

            // Calculate Leave/LOP
            let leaveCount = (status !== 'Present' && status !== 'WO' && status !== 'H') ? 1.0 : 0.0;
            let lopCount = (status === 'LOP' || status === 'Absent') ? 1.0 : 0.0;

            // Delete existing record
            await connection.query(
                'DELETE FROM staffattendance WHERE EMPNO = ? AND DATE(ADATE) = ?',
                [empno, date]
            );

            // Insert new record
            const uuid = randomUUID();
            await connection.query(
                `INSERT INTO staffattendance 
                (uuid, ADATE, EMPNO, SNAME, DESIGNATION, Category, AttType, \`Leave\`, Sessions, Remark, LOP, CREATED_BY, is_synced, device_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'SERVER_01')`,
                [uuid, date, empno, emp.SNAME, emp.DESIGNATION, emp.Category, status, leaveCount, 'Full', remark || '', lopCount, user.username]
            );

            imported++;
        }

        await connection.commit();

        // Audit Logging
        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'IMPORT_ATTENDANCE',
            module: 'ATTENDANCE',
            description: `Imported ${imported} attendance records from Excel`,
            newValue: { count: imported },
            ip: req.socket.remoteAddress
        });

        // Beta Usage Tracking
        metricsService.recordUsage('attendance_imports');

        res.json({
            success: true,
            message: `Successfully imported ${imported} records`,
            imported,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        await connection.rollback();
        console.error('Import Attendance Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error importing attendance' });
    } finally {
        connection.release();
    }
};

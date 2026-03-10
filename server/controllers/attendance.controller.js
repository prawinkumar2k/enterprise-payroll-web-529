import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';
import metricsService from '../services/metrics.service.js';
import cache from '../services/cache.service.js';
import summaryService from '../services/summary.service.js';

export const getDailyAttendance = async (req, res) => {
    const { date, category } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
    }

    try {
        // Fix: Use range instead of DATE() wrapper — allows index on ADATE to be used
        const dateStart = `${date} 00:00:00`;
        const dateEnd = `${date} 23:59:59`;

        // Run both queries in parallel
        const [[attendanceRows], [employees]] = await Promise.all([
            dbManager.query(
                'SELECT EMPNO, AttType, Remark, Sessions, LOP, `Leave` FROM staffattendance WHERE ADATE BETWEEN ? AND ?',
                [dateStart, dateEnd]
            ),
            dbManager.query(
                category && category !== 'ALL'
                    ? `SELECT EMPNO, SNAME, Designation, Category FROM empdet WHERE (CheckStatus = 'Active' OR CheckStatus = 'True' OR CheckStatus IS NULL) AND Category LIKE ?`
                    : `SELECT EMPNO, SNAME, Designation, Category FROM empdet WHERE (CheckStatus = 'Active' OR CheckStatus = 'True' OR CheckStatus IS NULL)`,
                category && category !== 'ALL' ? [`%${category}%`] : []
            )
        ]);

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
        console.error('Get Daily Attendance Error:', error.message);
        res.json({ success: true, data: [], message: 'Could not load attendance' });
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

        // ── BULK DELETE then BULK INSERT (was: N deletions + N insertions in a loop) ──────
        // Step 1: Delete all existing attendance for this date in ONE query
        const dateStart = `${date} 00:00:00`;
        const dateEnd = `${date} 23:59:59`;
        await connection.query(
            'DELETE FROM staffattendance WHERE ADATE BETWEEN ? AND ?',
            [dateStart, dateEnd]
        );

        // Step 2: Build one bulk INSERT for all records with a status
        const activeRecords = records.filter(r => r.Status);
        if (activeRecords.length > 0) {
            const now = new Date().toISOString();
            const values = activeRecords.map(record => {
                const { EMPNO, Status, Remark, SNAME, Designation } = record;
                const leaveCount = (Status !== 'Present' && Status !== 'WO' && Status !== 'H') ? 1.0 : 0.0;
                const lopCount = (Status === 'LOP' || Status === 'Absent') ? 1.0 : 0.0;
                const uuid = randomUUID();
                return [uuid, date, EMPNO, SNAME || '', Designation || '', record.Category || '',
                    Status, leaveCount, 'Full', Remark || '', lopCount,
                    user.username, 0, 'SERVER_01', now, now];
            });

            const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const flat = values.flat();

            await connection.query(
                `INSERT INTO staffattendance 
                 (uuid, ADATE, EMPNO, SNAME, DESIGNATION, Category, AttType, \`Leave\`, Sessions, Remark, LOP, CREATED_BY, is_synced, device_id, created_at, updated_at) 
                 VALUES ${placeholders}`,
                flat
            );
        }

        await connection.commit();

        // ── Invalidate cache + rebuild summary in background (non-blocking) ──
        const dateObj = new Date(date);
        const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        cache.invalidate(`dashboard:`);
        cache.invalidate(`summary:${monthStr}`);
        cache.invalidate(`report:monthly-summary:${monthStr}`);
        // Async rebuild — don't await, don't block response
        summaryService.rebuildMonth(monthStr).catch(() => { });

        // Audit log (non-fatal)
        try {
            await logAudit({
                userId: user.username,
                username: user.name || user.username,
                actionType: 'UPDATE_ATTENDANCE',
                module: 'ATTENDANCE',
                description: `Bulk updated attendance for ${date} (${records.length} records, ${activeRecords.length} active)`,
                newValue: { date, count: records.length },
                ip: req.socket?.remoteAddress
            });
        } catch { }

        res.json({ success: true, message: `Attendance saved — ${activeRecords.length} records updated` });

    } catch (error) {
        try { await connection.rollback(); } catch { }
        console.error('[Attendance] Mark error:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Error saving attendance' });
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
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        // ── Fast path: summary table (pre-aggregated, sub-10ms) ───────────────
        const rows = await summaryService.getSummary(monthStr);

        // Map summary table columns to the shape the frontend expects
        const data = rows.map(r => ({
            EMPNO: r.empno,
            SNAME: r.empname,
            DESIGNATION: r.designation,
            Category: r.category,
            PresentDays: r.present_days || 0,
            AbsentDays: r.absent_days || 0,
            LOPDays: r.lop_days || 0,
            LeaveDays: r.leave_days || 0,
            WeekOffs: r.weekoff_days || 0,
            ODDays: r.od_days || 0,
            HalfDays: r.half_days || 0,
        }));

        res.json({ success: true, data });

    } catch (error) {
        console.error('Monthly Attendance Error:', error.message);
        res.json({ success: true, data: [], message: 'Could not load monthly summary' });
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

            case 'monthly-summary': {
                // ── Fast path: hit pre-aggregated summary table ───────────────────
                const monthStr = `${year}-${String(month).padStart(2, '0')}`;
                const cacheKey = `report:monthly-summary:${monthStr}`;
                const cached = cache.get(cacheKey);
                if (cached) {
                    res.set('X-Cache', 'HIT');
                    return res.json({ success: true, data: cached });
                }

                const summaryRows = await summaryService.getSummary(monthStr);
                const data = summaryRows.map(r => ({
                    EMPNO: r.empno,
                    SNAME: r.empname,
                    DESIGNATION: r.designation,
                    Category: r.category,
                    PresentDays: r.present_days || 0,
                    AbsentDays: r.absent_days || 0,
                    LOPDays: r.lop_days || 0,
                    LeaveDays: r.leave_days || 0,
                    WeekOffs: r.weekoff_days || 0,
                    ODDays: r.od_days || 0,
                    HalfDays: r.half_days || 0,
                }));
                cache.set(cacheKey, data, cache.TTL.REPORTS);
                res.set('X-Cache', 'MISS');
                return res.json({ success: true, data });
            }

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
        console.error('Attendance Reports Error:', error.message);
        res.json({ success: true, data: [], message: 'Could not generate report' });
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

        // ── Invalidate cache + rebuild summaries for all affected months ──────
        const affectedMonths = [...new Set(
            records.map(r => {
                const d = new Date(r.date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }).filter(Boolean)
        )];
        affectedMonths.forEach(monthStr => {
            cache.invalidate(`summary:${monthStr}`);
            cache.invalidate(`report:monthly-summary:${monthStr}`);
            summaryService.rebuildMonth(monthStr).catch(() => { });
        });
        cache.invalidate('dashboard:');

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
        try { await connection.rollback(); } catch { }
        console.error('Import Attendance Error:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Error importing attendance' });
    } finally {
        connection.release();
    }
};

// ── ESS: My Attendance Summary ──
export const myAttendanceSummary = async (req, res) => {
    try {
        const empno = req.user.username;
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Get pre-aggregated summary for this employee
        const summary = await summaryService.getEmployeeSummary(monthStr, empno);

        if (!summary) {
            return res.json({ success: true, data: { lopDays: 0, presentPerc: 1.0 } });
        }

        const totalDays = (summary.present_days || 0) + (summary.absent_days || 0) + (summary.lop_days || 0) + (summary.weekoff_days || 0);
        const presentPerc = totalDays > 0 ? ((summary.present_days || 0) + (summary.weekoff_days || 0)) / totalDays : 1.0;

        res.json({
            success: true,
            data: {
                lopDays: summary.lop_days || 0,
                presentPerc: presentPerc
            }
        });
    } catch (error) {
        console.error('[Attendance] My Summary Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


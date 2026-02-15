import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';
import metricsService from '../services/metrics.service.js';
import licenseService from '../services/license.service.js';

/**
 * Salary Controller
 * Handels Salary Generation, View, Update, and Bonus
 */

// Helper to calculate totals
const calculateSalaryTotals = (row) => {
    const parse = (val) => parseFloat(val) || 0;

    const earnings = [
        'PAY', 'GradePay', 'PHD', 'MPHIL', 'HATA',
        'Allowance', 'DA', 'SPECIAL', 'INTERIM', 'Bonus'
    ];
    const deductions = [
        'EPF', 'ESI', 'ESIM', 'IT', 'PT', 'Advance', 'LIC', 'RECOVERY', 'OTHERS'
    ];

    const gross = earnings.reduce((sum, field) => sum + parse(row[field]), 0);
    const totDed = deductions.reduce((sum, field) => sum + parse(row[field]), 0);
    const net = gross - totDed;

    return {
        GROSSPAY: gross.toFixed(2),
        TOTDED: totDed.toFixed(2),
        NETSAL: net.toFixed(2)
    };
};

// 1. Generate Salary
export const generateSalary = async (req, res) => {
    const { monthYear } = req.body; // Expected format: "MM-YYYY" (e.g. "06-2024")
    const user = req.user;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    // --- COMMERCIAL COMPLIANCE CHECK ---
    const limits = await licenseService.getProductLimits();
    if (limits.isExpired) {
        return res.status(403).json({
            success: false,
            message: 'Your product trial has expired. Please activate your license to continue generating payroll.',
            isExpired: true
        });
    }

    const connection = await dbManager.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check if already generated (with row lock for safety)
        const [existing] = await connection.query(
            'SELECT id FROM emppay WHERE MONTHYEAR = ? LIMIT 1 FOR UPDATE',
            [monthYear]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Salary for ${monthYear} has already been generated.`
            });
        }

        // 2. Fetch all employees (Lock rows to prevent modification during calculation)
        const [employees] = await connection.query('SELECT * FROM empdet WHERE CheckStatus IN ("Active", "True") OR CheckStatus IS NULL FOR UPDATE');

        if (employees.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'No active employees found in system.' });
        }

        const dateParts = monthYear.split('-');
        const queryMonth = dateParts[0];
        const queryYear = dateParts[1];
        const monthNum = parseInt(queryMonth);
        const yearNum = parseInt(queryYear);
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        const datePrefix = `${queryYear}-${queryMonth}-%`;

        // Bulk Fetch Attendance counts for all employees
        const [attRows] = await connection.query(
            `SELECT EMPNO, COUNT(*) as leaves FROM staffattendance 
             WHERE ADATE LIKE ? AND (AttType = "Leave" OR LOP = "Yes" OR \`Leave\` > 0)
             GROUP BY EMPNO`,
            [datePrefix]
        );
        const leaveMap = new Map(attRows.map(r => [r.EMPNO, r.leaves]));

        const salaryRows = [];
        for (const emp of employees) {
            const leaveDays = leaveMap.get(emp.EMPNO) || 0;
            const workingDays = daysInMonth - leaveDays;

            const baseRow = {
                ...emp,
                MONTHYEAR: monthYear,
                NoofDays: daysInMonth.toString(),
                LeaveDays: leaveDays.toString(),
                WorkingDays: workingDays.toString(),
                Bonus: '0',
                ESIM: '0',
                IT: '0',
                PT: '0',
                Advance: '0',
                LIC: '0',
                RECOVERY: '0',
                OTHERS: '0',
                Remark: '',
                InterimPay: '0',
                DAper: '0'
            };

            const totals = calculateSalaryTotals(baseRow);
            salaryRows.push([
                randomUUID(), monthYear, emp.EMPNO, emp.SNAME, emp.DESIGNATION, emp.DGroup,
                baseRow.NoofDays, baseRow.LeaveDays, baseRow.WorkingDays,
                emp.PAY, emp.GradePay, emp.PHD, emp.MPHIL, emp.HATA, emp.Allowance, emp.DA, emp.SPECIAL, emp.INTERIM,
                totals.GROSSPAY, emp.EPF, emp.ESI, baseRow.ESIM, baseRow.IT, baseRow.PT, baseRow.Advance, baseRow.LIC, baseRow.RECOVERY, baseRow.OTHERS,
                totals.TOTDED, totals.NETSAL, emp.AccountNo, emp.BankName, emp.IFSCCode, emp.OtherAccNo,
                baseRow.Remark, baseRow.InterimPay, baseRow.DAper, emp.AbsGroup, baseRow.Bonus, 'SERVER_01', 0
            ]);
        }

        if (salaryRows.length > 0) {
            const fields = [
                'uuid', 'MONTHYEAR', 'EMPNO', 'SNAME', 'Designation', 'DGroup',
                'NoofDays', 'LeaveDays', 'WorkingDays',
                'PAY', 'GradePay', 'PHD', 'MPHIL', 'HATA', 'Allowance', 'DA', 'SPECIAL', 'INTERIM',
                'GROSSPAY', 'EPF', 'ESI', 'ESIM', 'IT', 'PT', 'Advance', 'LIC', 'RECOVERY', 'OTHERS',
                'TOTDED', 'NETSAL', 'AccountNo', 'BankName', 'IFSCCode', 'OtherAccNo',
                'Remark', 'InterimPay', 'DAper', 'AbsGroup', 'Bonus', 'device_id', 'is_synced'
            ];
            const placeholders = salaryRows.map(() => `(${fields.map(() => '?').join(',')})`).join(',');
            const sql = `INSERT INTO emppay (${fields.map(f => `\`${f}\``).join(',')}) VALUES ${placeholders}`;
            await connection.query(sql, salaryRows.flat());
        }

        await connection.commit();

        // 3. Audit Logging
        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'GENERATE_SALARY',
            module: 'PAYROLL',
            description: `Generated salary for ${monthYear} for ${employees.length} employees`,
            newValue: { monthYear, count: employees.length },
            ip: req.socket.remoteAddress,
            connection: connection
        });

        // 5. Beta Usage Tracking
        metricsService.recordUsage('payroll_generations');

        res.status(201).json({ success: true, message: `Salary generated for ${employees.length} employees.` });

    } catch (error) {
        await connection.rollback();
        console.error('Salary Generation Error:', error);
        res.status(500).json({ success: false, message: 'Server error during generation' });
    } finally {
        connection.release();
    }
};

// 2. View Salary
export const getSalary = async (req, res) => {
    const { monthYear } = req.query;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const [rows] = await dbManager.query(
            'SELECT * FROM emppay WHERE MONTHYEAR = ? AND deleted_at IS NULL ORDER BY id ASC',
            [monthYear]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('View Salary Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching salary' });
    }
};

// 3. Update Salary Row
export const updateSalaryRow = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    const connection = await dbManager.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch existing row (Lock for update)
        const [existing] = await connection.query('SELECT * FROM emppay WHERE id = ? FOR UPDATE', [id]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Salary record not found' });
        }

        const oldRow = { ...existing[0] };
        const currentRow = { ...oldRow, ...updateData };

        // Constraints
        currentRow.EMPNO = oldRow.EMPNO;
        currentRow.MONTHYEAR = oldRow.MONTHYEAR;

        // Recalculate totals
        const totals = calculateSalaryTotals(currentRow);
        currentRow.GROSSPAY = totals.GROSSPAY;
        currentRow.TOTDED = totals.TOTDED;
        currentRow.NETSAL = totals.NETSAL;
        currentRow.updated_at = new Date();
        currentRow.is_synced = 0; // Mark as dirty for sync

        // Update DB
        const fields = [
            'SNAME', 'Designation', 'DGroup', 'NoofDays', 'LeaveDays', 'WorkingDays',
            'PAY', 'GradePay', 'PHD', 'MPHIL', 'HATA', 'Allowance', 'DA', 'SPECIAL', 'INTERIM',
            'GROSSPAY', 'EPF', 'ESI', 'ESIM', 'IT', 'PT', 'Advance', 'LIC', 'RECOVERY', 'OTHERS',
            'TOTDED', 'NETSAL', 'AccountNo', 'BankName', 'IFSCCode', 'OtherAccNo',
            'Remark', 'InterimPay', 'DAper', 'AbsGroup', 'Bonus', 'is_synced', 'updated_at'
        ];

        const values = fields.map(f => currentRow[f]);
        const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');

        await connection.query(
            `UPDATE emppay SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        await connection.commit();

        // 2. Audit Logging
        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'UPDATE_SALARY',
            module: 'PAYROLL',
            description: `Updated salary record for ${currentRow.EMPNO} (${currentRow.MONTHYEAR})`,
            oldValue: oldRow,
            newValue: currentRow,
            ip: req.socket.remoteAddress
        });

        res.json({ success: true, message: 'Salary updated successfully', data: currentRow });

    } catch (error) {
        await connection.rollback();
        console.error('Update Salary Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating record' });
    } finally {
        connection.release();
    }
};

// 4. Apply Bonus
export const applyBonus = async (req, res) => {
    const { monthYear, bonusAmount } = req.body;
    const user = req.user;

    if (!monthYear || bonusAmount === undefined) {
        return res.status(400).json({ success: false, message: 'Month-Year and Bonus Amount required' });
    }

    const connection = await dbManager.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT * FROM emppay WHERE MONTHYEAR = ? FOR UPDATE',
            [monthYear]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'No salary records found for this month. Generate salary first.' });
        }

        for (const row of rows) {
            const updatedRow = { ...row, Bonus: bonusAmount.toString() };
            const totals = calculateSalaryTotals(updatedRow);

            await connection.query(
                'UPDATE emppay SET Bonus = ?, GROSSPAY = ?, NETSAL = ?, is_synced = 0 WHERE id = ?',
                [updatedRow.Bonus, totals.GROSSPAY, totals.NETSAL, row.id]
            );
        }

        await connection.commit();

        // Audit Logging
        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'APPLY_BONUS',
            module: 'PAYROLL',
            description: `Applied bonus of ${bonusAmount} to all employees for ${monthYear}`,
            newValue: { monthYear, bonusAmount },
            ip: req.socket.remoteAddress
        });

        res.json({ success: true, message: `Bonus applied successfully to ${rows.length} records.` });

    } catch (error) {
        await connection.rollback();
        console.error('Apply Bonus Error:', error);
        res.status(500).json({ success: false, message: 'Server error applying bonus' });
    } finally {
        connection.release();
    }
};
// 5. Reverse Salary (Safety Feature)
export const reverseSalary = async (req, res) => {
    const { monthYear, reason } = req.body;
    const user = req.user;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month-Year required for reversal' });
    }

    if (user.role !== 'admin' && user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Only administrators can reverse payroll.' });
    }

    const connection = await dbManager.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get stats before deletion
        const [stats] = await connection.query(
            'SELECT COUNT(*) as count, SUM(CAST(NETSAL AS DECIMAL(15,2))) as total FROM emppay WHERE MONTHYEAR = ? AND deleted_at IS NULL',
            [monthYear]
        );

        if (!stats || stats.count === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: `No active payroll records found for ${monthYear}` });
        }

        // 2. Perform Soft Delete (or Hard Delete based on policy - here we soft delete )
        await connection.query(
            'UPDATE emppay SET deleted_at = CURRENT_TIMESTAMP, is_synced = 0 WHERE MONTHYEAR = ? AND deleted_at IS NULL',
            [monthYear]
        );

        // 3. Log into Reversal Table
        await connection.query(
            'INSERT INTO payroll_reversals (month_year, reversed_by, reason, record_count, total_amount) VALUES (?, ?, ?, ?, ?)',
            [monthYear, user.username, reason || 'No reason provided', stats.count, stats.total || 0]
        );

        await connection.commit();

        // 4. Audit Logging
        await logAudit({
            userId: user.username,
            username: user.name || user.username,
            actionType: 'REVERSE_SALARY',
            module: 'PAYROLL',
            description: `Reversed salary for ${monthYear} (${stats.count} records, ${stats.total || 0} total)`,
            newValue: { monthYear, reason },
            ip: req.socket.remoteAddress
        });

        // 4. Beta Usage Tracking
        metricsService.recordUsage('reversals');

        res.json({
            success: true,
            message: `Successfully reversed ${stats.count} records for ${monthYear}.`
        });

    } catch (error) {
        await connection.rollback();
        console.error('Reverse Salary Error:', error);
        res.status(500).json({ success: false, message: 'Server error during reversal' });
    } finally {
        connection.release();
    }
};

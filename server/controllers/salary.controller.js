import pool from '../db.js';
import { logAction } from '../middleware/log.middleware.js';

/**
 * Salary Controller
 * Handles Salary Generation, View, Update, and Bonus
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

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if already generated
        const [existing] = await connection.query(
            'SELECT id FROM emppay WHERE MONTHYEAR = ? LIMIT 1',
            [monthYear]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Salary for ${monthYear} has already been generated.`
            });
        }

        // Fetch all employees
        const [employees] = await connection.query('SELECT * FROM empdet');

        if (employees.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'No employees found in system.' });
        }

        const dateParts = monthYear.split('-');
        const queryMonth = dateParts[0];
        const queryYear = dateParts[1];
        const monthNum = parseInt(queryMonth);
        const yearNum = parseInt(queryYear);
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

        for (const emp of employees) {
            // Count LOP/Leave from staffattendance
            // Format for ADATE search: 'YYYY-MM-%'
            const datePrefix = `${queryYear}-${queryMonth}-%`;
            const [attRows] = await connection.query(
                'SELECT COUNT(*) as leaves FROM staffattendance WHERE EMPNO = ? AND ADATE LIKE ? AND (AttType = "Leave" OR LOP = "Yes" OR `Leave` > 0)',
                [emp.EMPNO, datePrefix]
            );

            const leaveDays = attRows[0].leaves || 0;
            const workingDays = daysInMonth - leaveDays;

            // Initial calculation
            const baseRow = {
                ...emp,
                MONTHYEAR: monthYear,
                NoofDays: daysInMonth.toString(),
                LeaveDays: leaveDays.toString(),
                WorkingDays: workingDays.toString(),
                Bonus: '0',
                ESIM: '0', // Default ESIM if not in empdet
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

            await connection.query(
                `INSERT INTO emppay (
                    MONTHYEAR, EMPNO, SNAME, Designation, DGroup,
                    NoofDays, LeaveDays, WorkingDays,
                    PAY, GradePay, PHD, MPHIL, HATA, Allowance, DA, SPECIAL, INTERIM,
                    GROSSPAY, EPF, ESI, ESIM, IT, PT, Advance, LIC, RECOVERY, OTHERS,
                    TOTDED, NETSAL, AccountNo, BankName, IFSCCode, OtherAccNo,
                    Remark, InterimPay, DAper, AbsGroup, Bonus
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    monthYear, emp.EMPNO, emp.SNAME, emp.DESIGNATION, emp.DGroup,
                    baseRow.NoofDays, baseRow.LeaveDays, baseRow.WorkingDays,
                    emp.PAY, emp.GradePay, emp.PHD, emp.MPHIL, emp.HATA, emp.Allowance, emp.DA, emp.SPECIAL, emp.INTERIM,
                    totals.GROSSPAY, emp.EPF, emp.ESI, baseRow.ESIM, baseRow.IT, baseRow.PT, baseRow.Advance, baseRow.LIC, baseRow.RECOVERY, baseRow.OTHERS,
                    totals.TOTDED, totals.NETSAL, emp.AccountNo, emp.BankName, emp.IFSCCode, emp.OtherAccNo,
                    baseRow.Remark, baseRow.InterimPay, baseRow.DAper, emp.AbsGroup, baseRow.Bonus
                ]
            );
        }

        await connection.commit();

        // Log success
        await logAction({
            userId: user.username,
            username: user.name || user.username,
            role: user.role,
            module: 'SALARY',
            actionType: 'GENERATE',
            description: `Generated salary for ${monthYear} for ${employees.length} employees`,
            ip: req.socket.remoteAddress
        });

        res.json({ success: true, message: `Salary generated successfully for ${monthYear}` });

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
    const user = req.user;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM emppay WHERE MONTHYEAR = ? ORDER BY id ASC',
            [monthYear]
        );

        // Log view action
        await logAction({
            userId: user.username,
            username: user.name || user.username,
            role: user.role,
            module: 'SALARY',
            actionType: 'VIEW',
            description: `Viewed salary list for ${monthYear}`,
            ip: req.socket.remoteAddress
        });

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

    try {
        // Fetch existing row
        const [existing] = await pool.query('SELECT * FROM emppay WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Salary record not found' });
        }

        const currentRow = { ...existing[0], ...updateData };

        // Ensure EMPNO and MONTHYEAR aren't changed via body (as per requirements)
        currentRow.EMPNO = existing[0].EMPNO;
        currentRow.MONTHYEAR = existing[0].MONTHYEAR;

        // Recalculate totals
        const totals = calculateSalaryTotals(currentRow);
        currentRow.GROSSPAY = totals.GROSSPAY;
        currentRow.TOTDED = totals.TOTDED;
        currentRow.NETSAL = totals.NETSAL;

        // Update DB
        const fields = [
            'SNAME', 'Designation', 'DGroup', 'NoofDays', 'LeaveDays', 'WorkingDays',
            'PAY', 'GradePay', 'PHD', 'MPHIL', 'HATA', 'Allowance', 'DA', 'SPECIAL', 'INTERIM',
            'GROSSPAY', 'EPF', 'ESI', 'ESIM', 'IT', 'PT', 'Advance', 'LIC', 'RECOVERY', 'OTHERS',
            'TOTDED', 'NETSAL', 'AccountNo', 'BankName', 'IFSCCode', 'OtherAccNo',
            'Remark', 'InterimPay', 'DAper', 'AbsGroup', 'Bonus'
        ];

        const values = fields.map(f => currentRow[f]);
        const setClause = fields.map(f => `${f} = ?`).join(', ');

        await pool.query(
            `UPDATE emppay SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        // Log action
        await logAction({
            userId: user.username,
            username: user.name || user.username,
            role: user.role,
            module: 'SALARY',
            actionType: 'UPDATE',
            description: `Updated salary record for ${currentRow.EMPNO} (${currentRow.MONTHYEAR})`,
            ip: req.socket.remoteAddress
        });

        res.json({ success: true, message: 'Salary updated successfully', data: currentRow });

    } catch (error) {
        console.error('Update Salary Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating record' });
    }
};

// 4. Apply Bonus
export const applyBonus = async (req, res) => {
    const { monthYear, bonusAmount } = req.body;
    const user = req.user;

    if (!monthYear || bonusAmount === undefined) {
        return res.status(400).json({ success: false, message: 'Month-Year and Bonus Amount required' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT * FROM emppay WHERE MONTHYEAR = ?',
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
                'UPDATE emppay SET Bonus = ?, GROSSPAY = ?, NETSAL = ? WHERE id = ?',
                [updatedRow.Bonus, totals.GROSSPAY, totals.NETSAL, row.id]
            );
        }

        await connection.commit();

        // Log action
        await logAction({
            userId: user.username,
            username: user.name || user.username,
            role: user.role,
            module: 'SALARY',
            actionType: 'BONUS',
            description: `Applied bonus of ${bonusAmount} to all employees for ${monthYear}`,
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

import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';
import metricsService from '../services/metrics.service.js';
import licenseService from '../services/license.service.js';
import jobQueue from '../services/jobQueue.service.js';
import cache from '../services/cache.service.js';
import taxEngine from '../services/taxEngine.service.js';

// State for PT — reads from env, defaults to Tamil Nadu
const PT_STATE = process.env.PT_STATE || 'TN';

// Register payroll generation as a background job handler
jobQueue.registerHandler('GENERATE_PAYROLL', _generateSalaryJob);

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

/**
 * Background job handler for payroll generation.
 * Runs asynchronously after enqueue — never blocks the HTTP response.
 */
async function _generateSalaryJob({ monthYear, user }, updateProgress) {
    const connection = await dbManager.getConnection();
    try {
        await connection.beginTransaction();
        updateProgress(5, 'Checking existing records...');

        const [existing] = await connection.query(
            'SELECT id FROM emppay WHERE MONTHYEAR = ? LIMIT 1',
            [monthYear]
        );
        if (existing.length > 0) throw new Error(`Salary for ${monthYear} has already been generated.`);

        updateProgress(15, 'Loading active employees and settings...');
        const [settingsRows] = await connection.query('SELECT setting_key, setting_value FROM app_settings WHERE setting_key = "da_percent"');
        const globalDaPercent = settingsRows.length > 0 ? parseFloat(settingsRows[0].setting_value) : null;

        const [employees] = await connection.query(`
            SELECT EMPNO, SNAME, DESIGNATION, DGroup, AbsGroup,
                   PAY, GradePay, PHD, MPHIL, HATA, Allowance, DA, SPECIAL, INTERIM,
                   EPF, ESI, AccountNo, BankName, IFSCCode, OtherAccNo
            FROM empdet
            WHERE CheckStatus IN ('Active', 'True') OR CheckStatus IS NULL
        `);
        if (employees.length === 0) throw new Error('No active employees found.');

        updateProgress(30, `Processing ${employees.length} employees (DA: ${globalDaPercent !== null ? globalDaPercent + '%' : 'Master Value'})...`);
        const dateParts = monthYear.split('-');
        const queryMonth = dateParts[0];
        const queryYear = dateParts[1];
        const monthNum = parseInt(queryMonth);
        const yearNum = parseInt(queryYear);
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        const m2 = queryMonth.padStart(2, '0');
        const startDate = `${queryYear}-${m2}-01`;
        const endDate = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];

        // Determine financial year month number (April = 1, March = 12)
        const fyMonthNumber = monthNum >= 4 ? monthNum - 3 : monthNum + 9;

        // Get LOP days per employee from attendance
        const [attRows] = await connection.query(
            `SELECT EMPNO,
                    COUNT(CASE WHEN AttType = 'LOP' OR LOP > 0 THEN 1 END) as lop_days,
                    COUNT(CASE WHEN AttType IN ('CL','ML','PL','SL','Leave') OR \`Leave\` > 0 THEN 1 END) as leave_days
             FROM staffattendance
             WHERE ADATE BETWEEN ? AND ?
             GROUP BY EMPNO`,
            [startDate, endDate]
        );
        const attendanceMap = new Map(attRows.map(r => [r.EMPNO, r]));

        // Get YTD salary data for IT projection (current FY)
        const fyStart = monthNum >= 4 ? `${yearNum}-04-01` : `${yearNum - 1}-04-01`;
        const fyStartMonthYear = monthNum >= 4
            ? `04-${yearNum}` : `04-${yearNum - 1}`;
        const [ytdRows] = await connection.query(
            `SELECT EMPNO,
                    SUM(CAST(GROSSPAY AS DECIMAL(15,2))) as ytd_gross,
                    SUM(CAST(IT AS DECIMAL(15,2))) as ytd_it
             FROM emppay
             WHERE created_at >= ? AND deleted_at IS NULL
             GROUP BY EMPNO`,
            [fyStart]
        );
        const ytdMap = new Map(ytdRows.map(r => [r.EMPNO, r]));

        updateProgress(50, 'Calculating salary components with LOP & Tax...');
        const salaryRows = [];
        for (const emp of employees) {
            const att = attendanceMap.get(emp.EMPNO) || { lop_days: 0, leave_days: 0 };
            const lopDays = parseFloat(att.lop_days) || 0;
            const leaveDays = (parseFloat(att.lop_days) || 0) + (parseFloat(att.leave_days) || 0);
            const workingDays = Math.max(0, daysInMonth - leaveDays);

            // ── LOP Pro-ration: scale each earnings component by workingDays/daysInMonth ──
            const lopFactor = daysInMonth > 0 ? workingDays / daysInMonth : 1;
            const parse = (v) => parseFloat(v) || 0;

            // ── DA Calculation: Global Setting OR Employee Master ──
            let baseDA = parse(emp.DA);
            if (globalDaPercent !== null) {
                // Formula: (Basic + GradePay) * DA%
                baseDA = (parse(emp.PAY) + parse(emp.GradePay)) * (globalDaPercent / 100);
            }

            const proratedPAY = +(parse(emp.PAY) * lopFactor).toFixed(2);
            const proratedGradePay = +(parse(emp.GradePay) * lopFactor).toFixed(2);
            const proratedHATA = +(parse(emp.HATA) * lopFactor).toFixed(2);
            const proratedAllowance = +(parse(emp.Allowance) * lopFactor).toFixed(2);
            const proratedDA = +(baseDA * lopFactor).toFixed(2);
            const proratedSPECIAL = +(parse(emp.SPECIAL) * lopFactor).toFixed(2);
            const proratedINTERIM = +(parse(emp.INTERIM) * lopFactor).toFixed(2);
            // PHD/MPHIL are qualifications — typically not pro-rated
            const proratedPHD = parse(emp.PHD);
            const proratedMPHIL = parse(emp.MPHIL);

            // LOP deduction amount for reporting
            const lopDeduction = +((parse(emp.PAY) + parse(emp.GradePay) +
                parse(emp.HATA) + parse(emp.Allowance) + baseDA +
                parse(emp.SPECIAL) + parse(emp.INTERIM)
            ) * (1 - lopFactor)).toFixed(2);

            const baseRow = {
                EMPNO: emp.EMPNO, MONTHYEAR: monthYear,
                PAY: proratedPAY, GradePay: proratedGradePay,
                PHD: proratedPHD, MPHIL: proratedMPHIL,
                HATA: proratedHATA, Allowance: proratedAllowance,
                DA: proratedDA, SPECIAL: proratedSPECIAL, INTERIM: proratedINTERIM,
                EPF: parse(emp.EPF), ESI: parse(emp.ESI),
                NoofDays: daysInMonth, LeaveDays: leaveDays, WorkingDays: workingDays,
                Bonus: '0', ESIM: '0', Advance: '0', LIC: '0', RECOVERY: '0', OTHERS: '0',
                Remark: '', InterimPay: '0', DAper: globalDaPercent?.toString() || '0'
            };

            const totals = calculateSalaryTotals(baseRow);
            const grossMonthly = parseFloat(totals.GROSSPAY);

            // ── Professional Tax ──
            const pt = taxEngine.calculatePT(grossMonthly, PT_STATE, monthNum);

            // ── Income Tax (New Regime) ──
            const ytd = ytdMap.get(emp.EMPNO) || { ytd_gross: 0, ytd_it: 0 };
            const { monthlyIT } = taxEngine.calculateIT({
                monthlyGross: grossMonthly,
                monthNumber: fyMonthNumber,
                ytdTaxPaid: parseFloat(ytd.ytd_it) || 0,
                ytdGross: parseFloat(ytd.ytd_gross) || 0,
            });

            // Recalculate totals with actual PT and IT
            const finalRow = { ...baseRow, PT: pt.toString(), IT: monthlyIT.toString() };
            const finalTotals = calculateSalaryTotals(finalRow);

            salaryRows.push([
                randomUUID(), monthYear, emp.EMPNO, emp.SNAME, emp.DESIGNATION, emp.DGroup,
                daysInMonth, leaveDays, workingDays,
                proratedPAY, proratedGradePay, proratedPHD, proratedMPHIL,
                proratedHATA, proratedAllowance, proratedDA, proratedSPECIAL, proratedINTERIM,
                finalTotals.GROSSPAY, emp.EPF, emp.ESI,
                '0',              // ESIM
                monthlyIT,        // IT — New Regime
                pt,               // PT — State slab
                '0', '0', '0', '0',  // Advance, LIC, RECOVERY, OTHERS
                finalTotals.TOTDED, finalTotals.NETSAL,
                emp.AccountNo, emp.BankName, emp.IFSCCode, emp.OtherAccNo,
                '', '0', '0', emp.AbsGroup, '0',  // Remark, InterimPay, DAper, AbsGroup, Bonus
                lopDays, lopDeduction,             // LOP tracking
                'SERVER_01', 0                     // device_id, is_synced
            ]);
        }

        updateProgress(75, 'Saving payroll records...');
        if (salaryRows.length > 0) {
            const fields = [
                'uuid', 'MONTHYEAR', 'EMPNO', 'SNAME', 'Designation', 'DGroup',
                'NoofDays', 'LeaveDays', 'WorkingDays', 'PAY', 'GradePay', 'PHD',
                'MPHIL', 'HATA', 'Allowance', 'DA', 'SPECIAL', 'INTERIM', 'GROSSPAY',
                'EPF', 'ESI', 'ESIM', 'IT', 'PT', 'Advance', 'LIC', 'RECOVERY',
                'OTHERS', 'TOTDED', 'NETSAL', 'AccountNo', 'BankName', 'IFSCCode',
                'OtherAccNo', 'Remark', 'InterimPay', 'DAper', 'AbsGroup', 'Bonus',
                'lop_days', 'lop_deduction',
                'device_id', 'is_synced'
            ];
            // Chunked insert to avoid parameter limits (SQLite max: 32766)
            const CHUNK = 50;
            for (let i = 0; i < salaryRows.length; i += CHUNK) {
                const chunk = salaryRows.slice(i, i + CHUNK);
                const placeholders = chunk.map(() => `(${fields.map(() => '?').join(',')})`).join(',');
                await connection.query(
                    `INSERT INTO emppay (${fields.map(f => `\`${f}\``).join(',')}) VALUES ${placeholders}`,
                    chunk.flat()
                );
                updateProgress(75 + Math.floor((i / salaryRows.length) * 20), `Saved ${i + chunk.length}/${salaryRows.length}...`);
            }
        }

        await connection.commit();
        cache.invalidate('dashboard:');

        updateProgress(95, 'Writing audit log...');
        try {
            await logAudit({
                userId: user?.username || 'SYSTEM',
                username: user?.name || user?.username || 'SYSTEM',
                actionType: 'GENERATE_SALARY',
                module: 'PAYROLL',
                description: `Generated salary for ${monthYear} for ${employees.length} employees`,
                newValue: { monthYear, count: employees.length },
            });
        } catch { }

        metricsService.recordUsage('payroll_generations');
        return { count: employees.length, monthYear };

    } catch (err) {
        try { await connection.rollback(); } catch { }
        throw err;
    } finally {
        connection.release();
    }
}

// 1. Generate Salary (async — submits job, returns immediately)
export const generateSalary = async (req, res) => {
    const { monthYear } = req.body;
    const user = req.user;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    const limits = await licenseService.getProductLimits();
    if (limits.isExpired) {
        return res.status(403).json({
            success: false,
            message: 'Your product trial has expired. Please activate your license.',
            isExpired: true
        });
    }

    try {
        const jobId = jobQueue.enqueue('GENERATE_PAYROLL', { monthYear, user }, { userId: user?.username });
        // 202 Accepted — processing in background
        res.status(202).json({
            success: true,
            message: `Payroll generation started for ${monthYear}.`,
            jobId
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 2. View Salary — paginated with search, filter, sort
export const getSalary = async (req, res) => {
    const { monthYear, page = 1, limit = 100, search, dept, sortBy = 'EMPNO', order = 'ASC' } = req.query;

    if (!monthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    // Whitelist sortBy to prevent SQL injection
    const ALLOWED_SORT = new Set(['EMPNO', 'SNAME', 'GROSSPAY', 'NETSAL', 'Designation', 'DGroup']);
    const safeSort = ALLOWED_SORT.has(sortBy) ? sortBy : 'EMPNO';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    try {
        let baseWhere = 'WHERE MONTHYEAR = ? AND deleted_at IS NULL';
        const params = [monthYear];

        if (search) {
            baseWhere += ' AND (SNAME LIKE ? OR EMPNO LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (dept) {
            baseWhere += ' AND DGroup = ?';
            params.push(dept);
        }

        // Get total count
        const [countRows] = await dbManager.query(
            `SELECT COUNT(*) as total FROM emppay ${baseWhere}`, params
        );
        const total = countRows?.[0]?.total || 0;

        // Paginated data
        const [rows] = await dbManager.query(
            `SELECT * FROM emppay ${baseWhere} ORDER BY \`${safeSort}\` ${safeOrder} LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        res.json({
            success: true,
            data: rows,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            hasNext: offset + rows.length < total,
        });
    } catch (error) {
        console.error('[Salary] getSalary error:', error.message);
        res.json({ success: true, data: [], message: 'Could not load salary records' });
    }
};

// 2b. Export Salary to Excel
export const exportSalaryExcel = async (req, res) => {
    const { monthYear, dept } = req.query;
    if (!monthYear) return res.status(400).json({ success: false, message: 'monthYear required' });

    try {
        let sql = 'SELECT * FROM emppay WHERE MONTHYEAR = ? AND deleted_at IS NULL';
        const params = [monthYear];
        if (dept) { sql += ' AND DGroup = ?'; params.push(dept); }
        sql += ' ORDER BY EMPNO ASC';

        const [rows] = await dbManager.query(sql, params);

        // Lazy-load ExcelJS only when needed
        const ExcelJS = (await import('exceljs')).default;
        const wb = new ExcelJS.Workbook();
        wb.creator = 'Enterprise Payroll System';
        wb.created = new Date();

        const ws = wb.addWorksheet(`Salary ${monthYear}`);

        // Column definitions
        const cols = [
            { header: 'Emp No', key: 'EMPNO', width: 12 },
            { header: 'Name', key: 'SNAME', width: 26 },
            { header: 'Designation', key: 'Designation', width: 22 },
            { header: 'Group', key: 'DGroup', width: 14 },
            { header: 'Days', key: 'NoofDays', width: 8 },
            { header: 'LOP Days', key: 'lop_days', width: 10 },
            { header: 'Basic PAY', key: 'PAY', width: 14 },
            { header: 'Grade Pay', key: 'GradePay', width: 12 },
            { header: 'HATA', key: 'HATA', width: 10 },
            { header: 'Allowance', key: 'Allowance', width: 12 },
            { header: 'DA', key: 'DA', width: 10 },
            { header: 'Special', key: 'SPECIAL', width: 12 },
            { header: 'Bonus', key: 'Bonus', width: 10 },
            { header: 'GROSS PAY', key: 'GROSSPAY', width: 16 },
            { header: 'EPF', key: 'EPF', width: 10 },
            { header: 'ESI', key: 'ESI', width: 10 },
            { header: 'Income Tax', key: 'IT', width: 12 },
            { header: 'Prof Tax', key: 'PT', width: 10 },
            { header: 'LOP Ded', key: 'lop_deduction', width: 12 },
            { header: 'Recovery', key: 'RECOVERY', width: 12 },
            { header: 'Others', key: 'OTHERS', width: 10 },
            { header: 'TOTAL DED', key: 'TOTDED', width: 14 },
            { header: 'NET PAY', key: 'NETSAL', width: 16 },
            { header: 'Bank', key: 'BankName', width: 18 },
            { header: 'Account No', key: 'AccountNo', width: 20 },
            { header: 'IFSC', key: 'IFSCCode', width: 14 },
        ];
        ws.columns = cols;

        // Header row styling
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 22;

        // Number format for currency columns
        const currencyCols = new Set(['PAY', 'GradePay', 'HATA', 'Allowance', 'DA', 'SPECIAL', 'Bonus',
            'GROSSPAY', 'EPF', 'ESI', 'IT', 'PT', 'lop_deduction', 'RECOVERY', 'OTHERS', 'TOTDED', 'NETSAL']);

        // Data rows
        const numberCols = new Set(currencyCols);
        rows.forEach((row, i) => {
            const dataRow = ws.addRow(row);
            dataRow.height = 18;
            if (i % 2 === 0) {
                dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            }
            dataRow.eachCell((cell, colNum) => {
                const colKey = cols[colNum - 1]?.key;
                if (colKey && numberCols.has(colKey)) {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                }
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                };
            });
        });

        // Totals row
        if (rows.length > 0) {
            const totalsData = {};
            const numericKeys = ['PAY', 'GradePay', 'HATA', 'Allowance', 'DA', 'SPECIAL', 'Bonus',
                'GROSSPAY', 'EPF', 'ESI', 'IT', 'PT', 'lop_deduction', 'RECOVERY', 'OTHERS', 'TOTDED', 'NETSAL'];
            numericKeys.forEach(k => {
                totalsData[k] = rows.reduce((s, r) => s + (parseFloat(r[k]) || 0), 0);
            });
            totalsData.EMPNO = 'TOTAL';
            totalsData.SNAME = `${rows.length} Employees`;

            const totRow = ws.addRow(totalsData);
            totRow.font = { bold: true, size: 11 };
            totRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
            totRow.height = 20;
            totRow.eachCell((cell, colNum) => {
                const colKey = cols[colNum - 1]?.key;
                if (colKey && numberCols.has(colKey)) {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                }
            });
        }

        // Freeze top row
        ws.views = [{ state: 'frozen', ySplit: 1 }];

        const fileName = `Salary_${monthYear}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        await wb.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error('[Salary] exportExcel error:', err.message);
        res.status(500).json({ success: false, message: err.message });
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
        try { await connection.rollback(); } catch { }
        console.error('[Salary] updateSalaryRow error:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Error updating salary record' });
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
        cache.invalidate('dashboard:');

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
        try { await connection.rollback(); } catch { }
        console.error('[Salary] applyBonus error:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Error applying bonus' });
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
        cache.invalidate('dashboard:');

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
        try { await connection.rollback(); } catch { }
        console.error('[Salary] reverseSalary error:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Error during reversal' });
    } finally {
        connection.release();
    }
};

// ── Email Payslip Delivery ──
import emailService from '../services/email.service.js';

export const emailPayslip = async (req, res) => {
    const { id } = req.body; // emppay record id
    if (!id) return res.status(400).json({ success: false, message: 'Salary record ID required' });

    try {
        // 1. Get salary record
        const [payRows] = await dbManager.query('SELECT * FROM emppay WHERE id = ?', [id]);
        if (payRows.length === 0) return res.status(404).json({ success: false, message: 'Record not found' });
        const pay = payRows[0];

        // 2. Get email from empdet
        const [empRows] = await dbManager.query('SELECT EMAIL, Designation, DGroup FROM empdet WHERE EMPNO = ?', [pay.EMPNO]);
        const email = empRows?.[0]?.EMAIL;

        if (!email) {
            return res.status(400).json({ success: false, message: `Email address not found for ${pay.SNAME} in employee file.` });
        }

        // 3. Generate HTML template (simplified modern version)
        const fmt = (n) => parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #1e3a5f;">PAYSLIP - ${pay.MONTHYEAR}</h2>
                    <p style="margin: 2px 0;">Enterprise Payroll System</p>
                </div>
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td><strong>Employee:</strong> ${pay.SNAME} (${pay.EMPNO})</td>
                        <td align="right"><strong>Designation:</strong> ${pay.Designation}</td>
                    </tr>
                    <tr>
                        <td><strong>Working Days:</strong> ${pay.WorkingDays} / ${pay.NoofDays}</td>
                        <td align="right"><strong>Group:</strong> ${pay.DGroup}</td>
                    </tr>
                </table>
                <div style="display: flex; gap: 20px; overflow: hidden;">
                    <div style="width: 48%; float: left; border: 1px solid #eee;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #f8fafc;"><th align="left" style="padding: 8px;">EARNINGS</th><th align="right" style="padding: 8px;">AMOUNT</th></tr>
                            <tr><td style="padding: 6px 8px;">Basic PAY</td><td align="right" style="padding: 8px;">${fmt(pay.PAY)}</td></tr>
                            <tr><td style="padding: 6px 8px;">Grade Pay</td><td align="right" style="padding: 8px;">${fmt(pay.GradePay)}</td></tr>
                            <tr><td style="padding: 6px 8px;">DA</td><td align="right" style="padding: 8px;">${fmt(pay.DA)}</td></tr>
                            <tr><td style="padding: 6px 8px;">HATA</td><td align="right" style="padding: 8px;">${fmt(pay.HATA)}</td></tr>
                            <tr><td style="padding: 6px 8px;">Allowance</td><td align="right" style="padding: 8px;">${fmt(pay.Allowance)}</td></tr>
                            <tr><td style="padding: 6px 8px;">Special/Interim</td><td align="right" style="padding: 8px;">${fmt(parseFloat(pay.SPECIAL) + parseFloat(pay.INTERIM))}</td></tr>
                            <tr style="background: #f1f5f9; font-weight: bold;">
                                <td style="padding: 8px;">GROSS PAY</td>
                                <td align="right" style="padding: 8px;">${fmt(pay.GROSSPAY)}</td>
                            </tr>
                        </table>
                    </div>
                    <div style="width: 48%; float: right; border: 1px solid #eee;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #fcf8f8;"><th align="left" style="padding: 8px;">DEDUCTIONS</th><th align="right" style="padding: 8px;">AMOUNT</th></tr>
                            <tr><td style="padding: 6px 8px;">EPF</td><td align="right" style="padding: 8px;">${fmt(pay.EPF)}</td></tr>
                            <tr><td style="padding: 6px 8px;">ESI</td><td align="right" style="padding: 8px;">${fmt(pay.ESI)}</td></tr>
                            <tr><td style="padding: 6px 8px;">Income Tax</td><td align="right" style="padding: 8px;">${fmt(pay.IT)}</td></tr>
                            <tr><td style="padding: 6px 8px;">Prof. Tax</td><td align="right" style="padding: 8px;">${fmt(pay.PT)}</td></tr>
                            ${parseFloat(pay.RECOVERY) > 0 ? `<tr><td style="padding: 6px 8px;">Recovery</td><td align="right" style="padding: 8px;">${fmt(pay.RECOVERY)}</td></tr>` : ''}
                            ${parseFloat(pay.Advance) > 0 ? `<tr><td style="padding: 6px 8px;">Advance</td><td align="right" style="padding: 8px;">${fmt(pay.Advance)}</td></tr>` : ''}
                            <tr style="background: #fff1f2; font-weight: bold;">
                                <td style="padding: 8px;">TOTAL DED</td>
                                <td align="right" style="padding: 8px;">${fmt(pay.TOTDED)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div style="clear: both; background: #1e3a5f; color: white; padding: 15px; margin-top: 30px; text-align: center; border-radius: 8px;">
                    <span style="font-size: 14px;">NET TAKE HOME: </span>
                    <span style="font-size: 24px; font-weight: bold; margin-left: 10px;">₹${fmt(pay.NETSAL)}</span>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 30px; text-align: center;">
                    This is a computer generated payslip and does not require a signature.
                </p>
            </div>
        `;

        const result = await emailService.sendPayslip({
            email, empName: pay.SNAME, monthYear: pay.MONTHYEAR, payslipHtml: html
        });

        if (result.success) {
            res.json({ success: true, message: `Payslip emailed successfully to ${email}` });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email. Check SMTP settings.', error: result.error });
        }

    } catch (error) {
        console.error('[Salary] emailPayslip error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── ESS: My Salary History ──

export const mySalaryHistory = async (req, res) => {
    try {
        const empno = req.user.username;
        const [rows] = await dbManager.query(
            'SELECT MONTHYEAR, PAY, GradePay, DA, HATA, Allowance, SPECIAL, INTERIM, GROSSPAY, EPF, ESI, IT, PT, TOTDED, NETSAL, WorkingDays, NoofDays FROM emppay WHERE EMPNO = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 6',
            [empno]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



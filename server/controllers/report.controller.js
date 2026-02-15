import dbManager from '../database/dbManager.js';
import { logAction } from '../middleware/log.middleware.js';
import metricsService from '../services/metrics.service.js';
import licenseService from '../services/license.service.js';

/**
 * Report Controller
 * Handles Pay Bill Detail Report generation
 */

export const getPayBillDetail = async (req, res) => {
    const { monthYear: rawMonthYear, category, bonus } = req.query;
    const user = req.user;

    if (!rawMonthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    // --- COMMERCIAL LIMIT CHECK ---
    const limits = await licenseService.getProductLimits();
    if (limits.isExpired) {
        return res.status(403).json({
            success: false,
            message: 'Trial expired. Please activate your license to export reports.',
            isExpired: true
        });
    }

    try {
        // Robust MonthYear Converter
        // Supports: MM-YYYY (02-2026), MMM YYYY (FEB 2026), YYYY-MM (2026-02)
        const [m, y] = rawMonthYear.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mIdx = parseInt(m) - 1;
        const mmm = months[mIdx];

        const possibleFormats = [
            rawMonthYear,              // 02-2026
            `${mmm} ${y}`,             // FEB 2026
            `${mmm}-${y}`,             // FEB-2026
            `${y}-${m}`                // 2026-02
        ];

        let query = 'SELECT * FROM emppay WHERE MONTHYEAR IN (?)';
        let queryParams = [possibleFormats];

        // 1. DATA SELECTION (Bonus vs Salary)
        const isBonus = bonus === 'true';
        if (isBonus) {
            query += ' AND CAST(Bonus AS DECIMAL(10,2)) > 0';
        } else {
            query += ' AND CAST(NETSAL AS DECIMAL(10,2)) > 0';
        }

        // 2. CATEGORY FILTER (ALL logic)
        if (category && category !== 'ALL') {
            let groupVal = null;
            if (category === 'Cheque with PF') groupVal = 2;
            else if (category === 'Cheque without PF') groupVal = 3;
            else if (category === 'Cash Disburse' || category === 'Cash' || category === 'Cash without PF') groupVal = 4;

            if (groupVal) {
                query += ' AND (DGroup = ? OR AbsGroup LIKE ?)';
                queryParams.push(groupVal);
                queryParams.push(`${groupVal}%`);
            }
        }

        query += ' ORDER BY CAST(EMPNO AS UNSIGNED) ASC';

        const [rows] = await dbManager.query(query, queryParams);

        if (user) {
            await logAction({
                userId: user.username,
                username: user.name || user.username,
                role: user.role,
                module: 'REPORTS',
                actionType: 'VIEW',
                description: `Pay Bill Viewed for ${rawMonthYear} - Category: ${category || 'All'}`,
                ip: req.socket.remoteAddress
            });
        }

        // Beta Usage Tracking
        metricsService.recordUsage('report_exports');

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Report Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching pay bill' });
    }
};


export const logPrintAction = async (req, res) => {
    const { monthYear, category, mode } = req.body;
    const user = req.user;

    const reportType = mode === 'PAY_SLIP' ? 'Pay Slip' : 'Pay Bill';

    try {
        await logAction({
            userId: user.username,
            username: user.name || user.username,
            role: user.role,
            module: 'REPORTS',
            actionType: 'PRINT',
            description: `${reportType} Printed for ${monthYear} - Category: ${category || 'All'}`,
            ip: req.socket.remoteAddress
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

export const getPayBillAbstract = async (req, res) => {
    const { monthYear: rawMonthYear, category, bonus } = req.query;

    if (!rawMonthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const [m, y] = rawMonthYear.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(m) - 1];

        const possibleFormats = [rawMonthYear, `${mmm} ${y}`, `${mmm}-${y}`, `${y}-${m}`];

        let query = `
            SELECT 
                MAX(AbsGroup) as CategoryName,
                DGroup, 
                SUM(PAY) as PAY, 
                SUM(GradePay) as GradePay, 
                SUM(PHD) as PHD, 
                SUM(MPHIL) as MPHIL, 
                SUM(HATA) as HATA, 
                SUM(DA) as DA, 
                SUM(Special) as SPECIAL, 
                SUM(INTERIM) as INTERIM, 
                SUM(Bonus) as Bonus,
                SUM(GROSSPAY) as GROSSPAY, 
                SUM(ESI) as ESI, 
                SUM(ESIM) as ESIM, 
                SUM(EPF) as EPF, 
 
                SUM(IT) as IT, 
                SUM(PT) as PT, 
                SUM(LIC) as LIC,
                SUM(Advance) as Advance, 
                SUM(RECOVERY) as RECOVERY, 
                SUM(OTHERS) as OTHERS, 
                SUM(TOTDED) as TOTDED, 
                SUM(NETSAL) as NETSAL
            FROM emppay 
            WHERE MONTHYEAR IN (?)
        `;
        let queryParams = [possibleFormats];

        // 1. DATA SELECTION
        const isBonus = bonus === 'true';
        if (isBonus) {
            query += ' AND CAST(Bonus AS DECIMAL(10,2)) > 0';
        } else {
            query += ' AND CAST(NETSAL AS DECIMAL(10,2)) > 0';
        }

        // 2. CATEGORY FILTER
        if (category && category !== 'ALL') {
            let groupVal = null;
            if (category === 'Cheque with PF') groupVal = 2;
            else if (category === 'Cheque without PF') groupVal = 3;
            else if (category === 'Cash Disburse' || category === 'Cash' || category === 'Cash without PF') groupVal = 4;

            if (groupVal) {
                query += ' AND (DGroup = ? OR AbsGroup LIKE ?)';
                queryParams.push(groupVal);
                queryParams.push(`${groupVal}%`);
            }
        }

        query += ' GROUP BY DGroup, AbsGroup ORDER BY DGroup ASC';

        const [rows] = await dbManager.query(query, queryParams);
        // Beta Usage Tracking
        metricsService.recordUsage('report_exports');

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Abstract Report Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching pay bill abstract' });
    }
};

// Abstract 1 Report - Statutory Deductions Summary
export const getAbstract1 = async (req, res) => {
    const { monthYear: rawMonthYear, category, bonus } = req.query;

    if (!rawMonthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const [m, y] = rawMonthYear.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(m) - 1];

        const possibleFormats = [rawMonthYear, `${mmm} ${y}`, `${mmm}-${y}`, `${y}-${m}`];

        let query = `
            SELECT 
                MAX(AbsGroup) as Category,
                DGroup,
                SUM(GROSSPAY) as GrossPay,
                SUM(EPF) as EPF,
                SUM(ESI) as ESI,
                SUM(IT) as IT,
                SUM(PT) as PT,
                SUM(NETSAL) as NetPay
            FROM emppay 
            WHERE MONTHYEAR IN (?)
        `;
        let queryParams = [possibleFormats];

        // 1. DATA SELECTION (Bonus vs Salary)
        const isBonus = bonus === 'true';
        if (isBonus) {
            query += ' AND CAST(Bonus AS DECIMAL(10,2)) > 0';
        } else {
            query += ' AND CAST(NETSAL AS DECIMAL(10,2)) > 0';
        }

        // 2. CATEGORY FILTER
        if (category && category !== 'ALL') {
            let groupVal = null;
            if (category === 'Cheque with PF') groupVal = 2;
            else if (category === 'Cheque without PF') groupVal = 3;
            else if (category === 'Cash Disburse' || category === 'Cash' || category === 'Cash without PF') groupVal = 4;

            if (groupVal) {
                query += ' AND (DGroup = ? OR AbsGroup LIKE ?)';
                queryParams.push(groupVal);
                queryParams.push(`${groupVal}%`);
            }
        }

        query += ' GROUP BY DGroup, AbsGroup ORDER BY DGroup ASC';

        const [rows] = await dbManager.query(query, queryParams);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Abstract 1 Report Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching Abstract 1' });
    }
};

export const getBankStatement = async (req, res) => {
    const { monthYear: rawMonthYear, category, bonusMode } = req.query;
    const isBonus = bonusMode === 'true';

    if (!rawMonthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const [m, y] = rawMonthYear.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(m) - 1];

        const possibleFormats = [rawMonthYear, `${mmm} ${y}`, `${mmm}-${y}`, `${y}-${m}`];

        let query = `
            SELECT 
                EMPNO, SNAME, Designation, AccountNo, BankName, IFSCCode, NETSAL, Bonus
            FROM emppay 
            WHERE MONTHYEAR IN (?)
        `;
        let queryParams = [possibleFormats];

        // 1. DATA SELECTION
        if (isBonus) {
            query += ' AND CAST(Bonus AS DECIMAL(10,2)) > 0';
        } else {
            query += ' AND CAST(NETSAL AS DECIMAL(10,2)) > 0';
        }

        // 2. CATEGORY FILTER
        if (category && category !== 'ALL') {
            let groupVal = null;
            if (category === 'Cheque with PF') groupVal = 2;
            else if (category === 'Cheque without PF') groupVal = 3;
            else if (category === 'Cash Disburse' || category === 'Cash' || category === 'Cash without PF') groupVal = 4;

            if (groupVal) {
                query += ' AND (DGroup = ? OR AbsGroup LIKE ?)';
                queryParams.push(groupVal);
                queryParams.push(`${groupVal}%`);
            }
        }

        // 3. BANK STATEMENT STRICTNESS 
        if (category !== 'Cash Disburse' && category !== 'Cash' && category !== 'Cash without PF') {
            query += `
                AND AccountNo IS NOT NULL AND AccountNo != '' AND AccountNo != '-' 
                AND BankName IS NOT NULL AND BankName != '' AND BankName != '-' 
                AND IFSCCode IS NOT NULL AND IFSCCode != '' AND IFSCCode != '-' 
            `;
        }

        query += ' ORDER BY CAST(EMPNO AS UNSIGNED) ASC';

        const [rows] = await dbManager.query(query, queryParams);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Bank Statement Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching bank statement' });
    }
};

// 4. Abstract 2 Report
export const getAbstract2 = async (req, res) => {
    const { monthYear: rawMonthYear, category, bonus } = req.query;

    if (!rawMonthYear) {
        return res.status(400).json({ success: false, message: 'Month and Year required' });
    }

    try {
        const [m, y] = rawMonthYear.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(m) - 1];

        const possibleFormats = [rawMonthYear, `${mmm} ${y}`, `${mmm}-${y}`, `${y}-${m}`];

        let query = `
            SELECT 
                MAX(AbsGroup) as Category,
                MAX(AbsGroup) as CategoryName,
                SUM(GROSSPAY) as GROSS,
                SUM(Advance) as Advance,
                SUM(RECOVERY) as RECOVERY,
                SUM(NETSAL) as NET,
                SUM(CASE WHEN DGroup IN (2, 3) THEN NETSAL ELSE 0 END) as ByBank,
                SUM(CASE WHEN DGroup = 4 THEN NETSAL ELSE 0 END) as ByCash
            FROM emppay 
            WHERE MONTHYEAR IN (?)
        `;
        let queryParams = [possibleFormats];

        const isBonus = bonus === 'true';
        if (isBonus) {
            query += ' AND CAST(Bonus AS DECIMAL(10,2)) > 0';
        } else {
            query += ' AND CAST(NETSAL AS DECIMAL(10,2)) > 0';
        }

        // Optional: Filter by Category if user selects one
        if (category && category !== 'ALL') {
            let groupVal = null;
            if (category === 'Cheque with PF') groupVal = 2;
            else if (category === 'Cheque without PF') groupVal = 3;
            else if (category === 'Cash Disburse' || category === 'Cash' || category === 'Cash without PF') groupVal = 4;

            if (groupVal) {
                query += ' AND DGroup = ?';
                queryParams.push(groupVal);
            }
        }

        query += ' GROUP BY AbsGroup ORDER BY AbsGroup ASC';

        const [rows] = await dbManager.query(query, queryParams);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Abstract 2 Report Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching Abstract 2' });
    }
};

// 5. Pay Certificate Report (Individual)
export const getPayCertificate = async (req, res) => {
    const { monthYear: rawMonthYear, empNo } = req.query;

    if (!rawMonthYear || !empNo) {
        return res.status(400).json({ success: false, message: 'Month/Year and Employee Number required' });
    }

    try {
        const [m, y] = rawMonthYear.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(m) - 1];

        const possibleFormats = [rawMonthYear, `${mmm} ${y}`, `${mmm}-${y}`, `${y}-${m}`];

        const query = `
            SELECT * FROM emppay 
            WHERE EMPNO = ? AND MONTHYEAR IN (?)
            LIMIT 1
        `;

        const [rows] = await dbManager.query(query, [empNo, possibleFormats]);

        if (rows.length === 0) {
            return res.json({ success: true, data: null, message: "No record found for this employee in the selected month." });
        }

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error('Pay Certificate Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching Pay Certificate' });
    }
};

// Helper endpoint to search employees for the dropdown
export const searchEmployeesForReports = async (req, res) => {
    const { query } = req.query;
    try {
        let sql = 'SELECT EMPNO, MAX(SNAME) as SNAME, MAX(Designation) as Designation FROM emppay GROUP BY EMPNO ORDER BY SNAME LIMIT 50';
        let params = [];

        if (query) {
            sql = 'SELECT EMPNO, MAX(SNAME) as SNAME, MAX(Designation) as Designation FROM emppay WHERE SNAME LIKE ? OR EMPNO LIKE ? GROUP BY EMPNO ORDER BY SNAME LIMIT 50';
            params = [`%${query}%`, `%${query}%`];
        }

        const [rows] = await dbManager.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Employee Search Error:', error);
        res.status(500).json({ success: false, message: 'Server Error searching employees' });
    }
};

// 6. Staff Report (Master Data)
export const getStaffReport = async (req, res) => {
    const { category } = req.query;

    try {
        let query = `
            SELECT 
                SNAME,
                DESIGNATION,
                DOB,
                Category as CATEGORY,
                PANCARD,
                AccountNo,
                JDATE as DOJ,
                LDATE as DOL
            FROM empdet
        `;
        let queryParams = [];

        if (category && category !== 'ALL') {
            query += ' WHERE Category = ?';
            queryParams.push(category);
        }

        query += ' ORDER BY SNAME ASC';

        const [rows] = await dbManager.query(query, queryParams);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Staff Report Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching Staff Report' });
    }
};

export const getStaffMaster = async (req, res) => {
    const { category, status } = req.query;

    try {
        let query = `
            SELECT
                EMPNO,
                SNAME,
                DESIGNATION,
                DOB,
                Category as CATEGORY,
                PANCARD,
                AccountNo,
                JDATE as DOJ,
                LDATE as DOL,
                CheckStatus
            FROM empdet
        `;
        let queryParams = [];
        let conditions = [];

        if (category && category !== 'ALL') {
            conditions.push('Category = ?');
            queryParams.push(category);
        }

        if (status) {
            if (status === 'WORKING') {
                conditions.push("(CheckStatus IN ('Active', 'True') OR CheckStatus IS NULL)");
            } else if (status === 'INACTIVE') {
                conditions.push("CheckStatus NOT IN ('Active', 'True') AND CheckStatus IS NOT NULL");
            } else {
                conditions.push('CheckStatus = ?');
                queryParams.push(status);
            }
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY SNAME ASC';

        const [rows] = await dbManager.query(query, queryParams);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Staff Master Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching Staff Master' });
    }
};

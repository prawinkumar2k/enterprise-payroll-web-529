import dbManager from '../database/dbManager.js';

export const getDashboardStats = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    try {
        const monthYear = `${month}-${year}`; // 02-2026
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(month) - 1];
        const possibleFormats = [monthYear, `${mmm} ${year}`, `${mmm}-${year}`, `${year}-${month}`];

        // 1. Employee Stats
        const [empCount] = await dbManager.query("SELECT COUNT(*) as total FROM empdet WHERE CheckStatus IN ('Active', 'True') OR CheckStatus IS NULL");

        // 2. Payroll Stats (Calculated sums)
        const [payrollRows] = await dbManager.query(`
            SELECT 
                COUNT(*) as processedCount,
                SUM(CAST(NETSAL AS DECIMAL(10,2))) as totalNet,
                SUM(CAST(GROSSPAY AS DECIMAL(10,2))) as totalGross,
                SUM(CAST(EPF AS DECIMAL(10,2))) as totalEPF,
                SUM(CAST(ESI AS DECIMAL(10,2))) as totalESI,
                SUM(CAST(IT AS DECIMAL(10,2))) as totalIT,
                SUM(CAST(PT AS DECIMAL(10,2))) as totalPT,
                SUM(CAST(LIC AS DECIMAL(10,2))) as totalLIC,
                SUM(CASE WHEN DGroup IN (2, 3) THEN CAST(NETSAL AS DECIMAL(10,2)) ELSE 0 END) as bankAmount,
                SUM(CASE WHEN DGroup = 4 THEN CAST(NETSAL AS DECIMAL(10,2)) ELSE 0 END) as cashAmount
            FROM emppay 
            WHERE MONTHYEAR IN (?) AND CAST(NETSAL AS DECIMAL(10,2)) > 0
        `, [possibleFormats]);

        const stats = payrollRows[0] || {};

        // 3. Payment Mode Breakdown
        const [paymentModes] = await dbManager.query(`
            SELECT 
                CASE 
                    WHEN DGroup = 2 THEN 'Cheque with PF'
                    WHEN DGroup = 3 THEN 'Cheque without PF'
                    WHEN DGroup = 4 THEN 'Cash'
                    ELSE 'Other'
                END as mode,
                COUNT(*) as count,
                SUM(CAST(NETSAL AS DECIMAL(10,2))) as amount
            FROM emppay 
            WHERE MONTHYEAR IN (?) AND CAST(NETSAL AS DECIMAL(10,2)) > 0
            GROUP BY DGroup
        `, [possibleFormats]);

        // 4. Recent Activity
        const [recentActivity] = await dbManager.query(`
            SELECT ActionType, Module, Description, created_at as CreatedAt 
            FROM userlogs 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        // 5. Dynamic Alerts
        const alerts = [];
        // Check for missing bank details in emppay for the current month
        const [missingBank] = await dbManager.query(`
            SELECT COUNT(*) as count FROM emppay 
            WHERE MONTHYEAR IN (?) AND DGroup IN (2, 3) 
            AND (AccountNo IS NULL OR AccountNo = '' OR AccountNo = '-')
        `, [possibleFormats]);

        if (missingBank && missingBank.length > 0 && missingBank[0].count > 0) {
            alerts.push({
                type: 'warning',
                message: `${missingBank[0].count} employees missing bank details for bank transfer.`,
                module: 'PAYROLL'
            });
        }

        // Check if payroll generated for current month
        if (!stats.processedCount || stats.processedCount === 0) {
            alerts.push({
                type: 'error',
                message: `Payroll not yet generated for ${month}-${year}.`,
                module: 'SYSTEM'
            });
        }

        res.json({
            success: true,
            data: {
                kpis: {
                    totalEmployees: (empCount && empCount.length > 0) ? empCount[0].total : 0,
                    netPayroll: stats.totalNet || 0,
                    grossPayroll: stats.totalGross || 0,
                    bankTransfer: stats.bankAmount || 0,
                    cashPayment: stats.cashAmount || 0,
                    totalEPF: stats.totalEPF || 0,
                    totalESI: stats.totalESI || 0,
                    totalIT: stats.totalIT || 0,
                    totalPT: stats.totalPT || 0,
                    totalLIC: stats.totalLIC || 0,
                    processedCount: stats.processedCount || 0
                },
                paymentModes: paymentModes || [],
                recentActivity: recentActivity || [],
                alerts
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error loading dashboard' });
    }
};

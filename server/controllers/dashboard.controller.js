import dbManager from '../database/dbManager.js';
import cache from '../services/cache.service.js';

export const getDashboardStats = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    const cacheKey = `dashboard:stats:${month}-${year}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
    }

    try {
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(month) - 1];
        const possibleFormats = [`${month}-${year}`, `${mmm} ${year}`, `${mmm}-${year}`, `${year}-${month}`];

        const [
            [empCount],
            [payrollRows],
            [paymentModes],
            [recentActivity],
            [missingBank]
        ] = await Promise.all([
            dbManager.query("SELECT COUNT(*) as total FROM empdet WHERE CheckStatus IN ('Active', 'True') OR CheckStatus IS NULL"),
            dbManager.query(`
                SELECT
                    COUNT(*)    as processedCount,
                    SUM(NETSAL)   as totalNet,
                    SUM(GROSSPAY) as totalGross,
                    SUM(EPF)  as totalEPF,
                    SUM(ESI)  as totalESI,
                    SUM(IT)   as totalIT,
                    SUM(PT)   as totalPT,
                    SUM(LIC)  as totalLIC,
                    SUM(CASE WHEN DGroup IN ('2','3') THEN NETSAL ELSE 0 END) as bankAmount,
                    SUM(CASE WHEN DGroup = '4'        THEN NETSAL ELSE 0 END) as cashAmount
                FROM emppay
                WHERE MONTHYEAR IN (?) AND NETSAL > 0
            `, [possibleFormats]),
            dbManager.query(`
                SELECT
                    CASE WHEN DGroup = '2' THEN 'Cheque with PF'
                         WHEN DGroup = '3' THEN 'Cheque without PF'
                         WHEN DGroup = '4' THEN 'Cash'
                         ELSE 'Other' END as mode,
                    COUNT(*)    as count,
                    SUM(NETSAL) as amount
                FROM emppay
                WHERE MONTHYEAR IN (?) AND NETSAL > 0
                GROUP BY DGroup
            `, [possibleFormats]),
            dbManager.query(`SELECT action_type as ActionType, module as Module, description as Description, created_at as CreatedAt FROM audit_logs ORDER BY created_at DESC LIMIT 10`),
            dbManager.query(`SELECT COUNT(*) as count FROM emppay WHERE MONTHYEAR IN (?) AND DGroup IN ('2','3') AND (AccountNo IS NULL OR AccountNo = '' OR AccountNo = '-')`, [possibleFormats]),
        ]);

        const stats = payrollRows?.[0] || {};
        const alerts = [];
        if (missingBank?.[0]?.count > 0) alerts.push({ type: 'warning', message: `${missingBank[0].count} employees missing bank details.`, module: 'PAYROLL' });
        if (!stats.processedCount) alerts.push({ type: 'error', message: `Payroll not yet generated for ${month}-${year}.`, module: 'SYSTEM' });

        const response = {
            success: true,
            data: {
                kpis: {
                    totalEmployees: empCount?.[0]?.total || 0,
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
                paymentModes,
                recentActivity,
                alerts
            }
        };

        await cache.set(cacheKey, response, cache.TTL.DASHBOARD);
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAttendanceTrends = async (req, res) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        const [trendRows] = await dbManager.query(`
            SELECT 
                ADATE as date,
                SUM(CASE WHEN AttType = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN AttType = 'Absent' OR AttType = 'A' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN AttType = 'LOP' THEN 1 ELSE 0 END) as lop
            FROM staffattendance
            WHERE ADATE >= ?
            GROUP BY ADATE
            ORDER BY ADATE ASC
        `, [sevenDaysAgo]);
        res.json({ success: true, data: trendRows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

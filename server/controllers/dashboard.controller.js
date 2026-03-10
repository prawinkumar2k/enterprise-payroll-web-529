import dbManager from '../database/dbManager.js';
import cache from '../services/cache.service.js';

export const getDashboardStats = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    // ── Cache key: unique per month/year ─────────────────────────────────────
    const cacheKey = `dashboard:stats:${month}-${year}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
    }

    try {
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const mmm = months[parseInt(month) - 1];
        const monthYear = `${month}-${year}`;
        const possibleFormats = [monthYear, `${mmm} ${year}`, `${mmm}-${year}`, `${year}-${month}`];

        // ── Run all 5 queries IN PARALLEL ────────────────────────────────────
        const [
            [empCount],
            [payrollRows],
            [paymentModes],
            [recentActivity],
            [missingBank]
        ] = await Promise.all([

            // 1. Employee Count
            dbManager.query(
                "SELECT COUNT(*) as total FROM empdet WHERE CheckStatus IN ('Active', 'True') OR CheckStatus IS NULL"
            ),

            // 2. Payroll Aggregates
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

            // 3. Payment Mode Breakdown
            dbManager.query(`
                SELECT
                    CASE
                        WHEN DGroup = '2' THEN 'Cheque with PF'
                        WHEN DGroup = '3' THEN 'Cheque without PF'
                        WHEN DGroup = '4' THEN 'Cash'
                        ELSE 'Other'
                    END as mode,
                    COUNT(*)    as count,
                    SUM(NETSAL) as amount
                FROM emppay
                WHERE MONTHYEAR IN (?) AND NETSAL > 0
                GROUP BY DGroup
            `, [possibleFormats]),

            // 4. Recent Activity
            dbManager.query(`
                SELECT ActionType, Module, Description, created_at as CreatedAt
                FROM userlogs
                ORDER BY created_at DESC
                LIMIT 10
            `),

            // 5. Missing Bank Alert
            dbManager.query(`
                SELECT COUNT(*) as count FROM emppay
                WHERE MONTHYEAR IN (?)
                  AND DGroup IN ('2','3')
                  AND (AccountNo IS NULL OR AccountNo = '' OR AccountNo = '-')
            `, [possibleFormats]),
        ]);

        const stats = payrollRows?.[0] || {};
        const alerts = [];

        if (missingBank?.[0]?.count > 0) {
            alerts.push({
                type: 'warning',
                message: `${missingBank[0].count} employees missing bank details for bank transfer.`,
                module: 'PAYROLL'
            });
        }

        if (!stats.processedCount || stats.processedCount === 0) {
            alerts.push({
                type: 'error',
                message: `Payroll not yet generated for ${month}-${year}.`,
                module: 'SYSTEM'
            });
        }

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
                paymentModes: paymentModes || [],
                recentActivity: recentActivity || [],
                alerts
            }
        };

        // Cache for 1 minute — dashboard doesn't need real-time accuracy
        cache.set(cacheKey, response, cache.TTL.DASHBOARD);

        res.set('X-Cache', 'MISS');
        res.json(response);

    } catch (error) {
        console.error('[Dashboard] Stats error:', error.message);
        res.json({
            success: true,
            data: {
                kpis: {
                    totalEmployees: 0, netPayroll: 0, grossPayroll: 0,
                    bankTransfer: 0, cashPayment: 0, totalEPF: 0,
                    totalESI: 0, totalIT: 0, totalPT: 0, totalLIC: 0, processedCount: 0
                },
                paymentModes: [],
                recentActivity: [],
                alerts: [{ type: 'info', message: 'Database initializing. Data will appear shortly.', module: 'SYSTEM' }]
            }
        });
    }
};

/**
 * summary.service.js — Attendance Summary Table Manager
 *
 * Maintains `att_monthly_summary` — a pre-aggregated table that replaces
 * expensive COUNT(*) + GROUP BY queries on staffattendance for reports.
 *
 * Instead of scanning 5 lakh rows every time → hit a tiny summary table.
 *
 * USAGE:
 *   - Call rebuildMonth('2026-02') after bulk attendance saves
 *   - Dashboard/reports read from att_monthly_summary, not staffattendance
 *   - Schedule rebuildMonth for the current month nightly via job queue
 */

import dbManager from '../database/dbManager.js';
import cache from './cache.service.js';

/**
 * Create the summary table if it doesn't exist.
 * Safe to call on every startup.
 */
export async function ensureSummaryTable() {
    // MySQL-compatible CREATE TABLE
    const sql = `
        CREATE TABLE IF NOT EXISTS att_monthly_summary (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            empno         VARCHAR(50) NOT NULL,
            empname       VARCHAR(200),
            designation   VARCHAR(200),
            category      VARCHAR(100),
            summary_month VARCHAR(7) NOT NULL,
            total_days    INT DEFAULT 0,
            present_days  INT DEFAULT 0,
            absent_days   INT DEFAULT 0,
            lop_days      DECIMAL(5,1) DEFAULT 0,
            leave_days    INT DEFAULT 0,
            half_days     INT DEFAULT 0,
            weekoff_days  INT DEFAULT 0,
            od_days       INT DEFAULT 0,
            working_hrs   DECIMAL(8,2) DEFAULT 0,
            updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_emp_month (empno, summary_month)
        )
    `;
    try {
        await dbManager.execute(sql, []);
        console.log('[Summary] att_monthly_summary table ready.');
    } catch (err) {
        // Table already exists or minor error — non-fatal
        if (!err.message?.includes('already exists') && err.errno !== 1050) {
            console.warn('[Summary] Table init warning:', err.message);
        }
    }
}


/**
 * Rebuild the summary for a given month from raw attendance data.
 * @param {string} monthStr  'YYYY-MM' e.g. '2026-02'
 * @returns {object} { rebuilt: N, month: '2026-02' }
 */
export async function rebuildMonth(monthStr) {
    if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
        throw new Error(`Invalid month format: "${monthStr}". Expected YYYY-MM.`);
    }

    const [year, month] = monthStr.split('-');
    const startDate = `${year}-${month}-01`;
    // Last day of month: day 0 of next month
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    console.log(`[Summary] Rebuilding att_monthly_summary for ${monthStr}...`);

    // Aggregate from raw attendance — your actual column names
    const aggregateSQL = `
        SELECT
            e.EMPNO          AS empno,
            e.SNAME          AS empname,
            e.DESIGNATION    AS designation,
            e.Category       AS category,
            COUNT(CASE WHEN a.AttType IN ('Present', 'OD', 'H') THEN 1 END) AS present_days,
            COUNT(CASE WHEN a.AttType = 'Absent' THEN 1 END)                AS absent_days,
            COUNT(CASE WHEN a.AttType = 'LOP'    THEN 1 END)                AS lop_days,
            COUNT(CASE WHEN a.AttType IN ('CL','ML','PL','SL') THEN 1 END)  AS leave_days,
            COUNT(CASE WHEN a.AttType = 'H'      THEN 1 END)                AS half_days,
            COUNT(CASE WHEN a.AttType = 'WO'     THEN 1 END)                AS weekoff_days,
            COUNT(CASE WHEN a.AttType = 'OD'     THEN 1 END)                AS od_days,
            COUNT(a.EMPNO)                                                   AS total_days
        FROM empdet e
        LEFT JOIN staffattendance a
            ON e.EMPNO = a.EMPNO
            AND a.ADATE BETWEEN ? AND ?
        WHERE e.CheckStatus IN ('Active', 'True') OR e.CheckStatus IS NULL
        GROUP BY e.EMPNO, e.SNAME, e.DESIGNATION, e.Category
    `;

    const [rows] = await dbManager.query(aggregateSQL, [startDate, endDate]);

    if (!rows || rows.length === 0) {
        console.warn(`[Summary] No data found for ${monthStr}. Skipping rebuild.`);
        return { rebuilt: 0, month: monthStr };
    }

    // Delete old summary for this month, then bulk insert fresh data
    await dbManager.execute(
        `DELETE FROM att_monthly_summary WHERE summary_month = ?`,
        [monthStr]
    );

    // Batch upsert — split into chunks of 200 to avoid parameter limits
    const CHUNK = 200;
    let rebuilt = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const placeholders = chunk.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
        const values = chunk.flatMap(r => [
            r.empno, r.empname, r.designation, r.category, monthStr,
            r.total_days, r.present_days, r.absent_days,
            r.lop_days, r.leave_days, r.half_days, r.weekoff_days, r.od_days
        ]);

        await dbManager.execute(`
            INSERT INTO att_monthly_summary
                (empno, empname, designation, category, summary_month,
                 total_days, present_days, absent_days, lop_days,
                 leave_days, half_days, weekoff_days, od_days)
            VALUES ${placeholders}
        `, values);
        rebuilt += chunk.length;
    }

    // Invalidate cache for this month
    cache.invalidate(`summary:${monthStr}`);
    cache.invalidate(`dashboard:`);
    cache.invalidate(`report:monthly-summary:${monthStr}`);

    console.log(`[Summary] ✓ Rebuilt ${rebuilt} employee summaries for ${monthStr}.`);
    return { rebuilt, month: monthStr };
}

/**
 * Fetch summary for a month from the summary table (fast path).
 * Falls back to live query if summary table is empty for this month.
 *
 * @param {string} monthStr 'YYYY-MM'
 * @returns {Array} rows from att_monthly_summary
 */
export async function getSummary(monthStr) {
    const cacheKey = `summary:${monthStr}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const [rows] = await dbManager.query(
        `SELECT * FROM att_monthly_summary WHERE summary_month = ? ORDER BY empno`,
        [monthStr]
    );

    if (rows && rows.length > 0) {
        cache.set(cacheKey, rows, cache.TTL.SUMMARY);
        return rows;
    }

    // Summary table empty for this month — trigger a rebuild and return live data
    console.log(`[Summary] No summary for ${monthStr} — triggering live fallback & rebuild.`);
    rebuildMonth(monthStr).catch(() => { }); // async rebuild in background

    // Return live data as fallback
    const [year, month] = monthStr.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const [liveRows] = await dbManager.query(`
        SELECT
            e.EMPNO AS empno, e.SNAME AS empname,
            e.DESIGNATION AS designation, e.Category AS category,
            COUNT(CASE WHEN a.AttType IN ('Present', 'OD', 'H') THEN 1 END) AS present_days,
            COUNT(CASE WHEN a.AttType = 'Absent' THEN 1 END)                AS absent_days,
            COUNT(CASE WHEN a.AttType = 'LOP'    THEN 1 END)                AS lop_days,
            COUNT(CASE WHEN a.AttType IN ('CL','ML','PL','SL') THEN 1 END)  AS leave_days,
            COUNT(a.EMPNO)                                                   AS total_days
        FROM empdet e
        LEFT JOIN staffattendance a ON e.EMPNO = a.EMPNO AND a.ADATE BETWEEN ? AND ?
        WHERE e.CheckStatus IN ('Active', 'True') OR e.CheckStatus IS NULL
        GROUP BY e.EMPNO, e.SNAME, e.DESIGNATION, e.Category
        ORDER BY e.EMPNO
    `, [startDate, endDate]);

    cache.set(cacheKey, liveRows || [], cache.TTL.SHORT);
    return liveRows || [];
}

export default { ensureSummaryTable, rebuildMonth, getSummary };

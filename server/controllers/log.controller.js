import dbManager from '../database/dbManager.js';

/**
 * Get Logs (Read-Only)
 */
export const getLogs = async (req, res) => {
    try {
        const { startDate, endDate, user, role, actionType } = req.query;

        // Base Query
        let query = 'SELECT * FROM userlogs WHERE 1=1';
        const params = [];

        // Filters
        if (startDate) {
            query += ' AND LogDate >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND LogDate <= ?';
            params.push(endDate);
        }

        if (user) {
            query += ' AND (UserName LIKE ? OR UserID LIKE ?)';
            params.push(`%${user}%`, `%${user}%`);
        }

        if (role) {
            query += ' AND Role = ?';
            params.push(role);
        }

        if (actionType) {
            query += ' AND ActionType = ?';
            params.push(actionType);
        }

        // Sort by Latest First (LogDate DESC, LogTime DESC)
        query += ' ORDER BY LogDate DESC, LogTime DESC LIMIT 1000';

        const [logs] = await dbManager.query(query, params);

        res.json({
            success: true,
            data: logs,
            count: logs ? logs.length : 0
        });

    } catch (error) {
        console.error('Fetch Logs Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

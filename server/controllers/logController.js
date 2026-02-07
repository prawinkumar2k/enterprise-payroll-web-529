import pool from '../db.js';

export const getLogs = async (req, res) => {
    try {
        const { startDate, endDate, user, module } = req.query;

        let query = 'SELECT * FROM userlogs WHERE 1=1';
        const params = [];

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

        if (module) {
            query += ' AND Module = ?';
            params.push(module);
        }

        query += ' ORDER BY LogDate DESC, LogTime DESC LIMIT 1000';

        const [logs] = await pool.query(query, params);

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Fetch Logs Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

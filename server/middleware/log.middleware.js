import pool from '../db.js';

/**
 * Capture IP Address
 */
const getIp = (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
};

/**
 * Direct Log Helper (Internal use or manual calls)
 */
export const logAction = async ({ userId, username, role, module, actionType, description, ip }) => {
    try {
        const now = new Date();
        const logDate = now.toISOString().split('T')[0];
        const logTime = now.toTimeString().split(' ')[0];

        // Ensure Role is captured (default to 'user' if missing)
        const userRole = role || 'user';

        await pool.query(
            `INSERT INTO userlogs 
            (UserID, UserName, Role, Module, ActionType, Description, IPAddress, LogDate, LogTime, CreatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, userRole, module, actionType, description, ip, logDate, logTime, now]
        );
    } catch (err) {
        console.error('Audit Log Failed:', err);
        // We do not throw error here to avoid breaking the main transaction, 
        // but in strict audit systems, failing to log might require rolling back transaction.
        // Prompt says "Logs must be stored even if main action fails (where applicable)".
        // So we just try best effort or use separate connection.
    }
};

/**
 * Audit Logger Middleware
 * Attaches req.audit(module, action, description) to the request object
 */
export const logMiddleware = (req, res, next) => {
    req.audit = async (module, actionType, description) => {
        if (!req.user) {
            console.warn('Audit Log: User not authenticated/attached when log requested');
            // Log anyway if possible using partial info
        }

        await logAction({
            userId: req.user?.username || 'SYSTEM',
            username: req.user?.name || req.user?.username || 'Unknown',
            role: req.user?.role || 'system',
            module,
            actionType,
            description,
            ip: getIp(req)
        });
    };
    next();
};

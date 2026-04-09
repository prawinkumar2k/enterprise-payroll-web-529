import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';

/**
 * Unified Single-Tenant Authentication Middleware
 */
export const authenticate = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        // 1. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 2. Attach user info to request (No company context)
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: (decoded.role || 'EMPLOYEE').toUpperCase(),
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired.' });
        }
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

/**
 * RBAC Authorization
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized.' });

        const userRole = (req.user.role || '').toUpperCase();
        const effectiveAllowed = allowedRoles.map(r => r.toUpperCase());

        // Support for flexible role mapping if needed (e.g. COMPANY_ADMIN -> ADMIN)
        if (effectiveAllowed.includes('ADMIN') && userRole === 'COMPANY_ADMIN') {
            return next();
        }

        const hasRole = effectiveAllowed.some(r => r === userRole);
        if (!hasRole) {
            return res.status(403).json({ success: false, message: 'Access Denied: Insufficient permissions.' });
        }
        next();
    };
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: (decoded.role || 'EMPLOYEE').toUpperCase(),
            };
        }
        next();
    } catch (error) { next(); }
};

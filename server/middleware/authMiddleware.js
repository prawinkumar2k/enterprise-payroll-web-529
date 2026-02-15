import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.',
                code: 'AUTH_REQUIRED'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Your session has expired. Please refresh.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid security token. Please log in again.',
                code: 'INVALID_TOKEN'
            });
        }

        console.error('[AuthMiddleware] error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_FAILURE'
        });
    }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s)
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login.',
                code: 'AUTH_REQUIRED'
            });
        }

        const hasRole = allowedRoles.includes(req.user.role);

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: You do not have the required permissions for this action.',
                code: 'FORBIDDEN'
            });
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
                role: decoded.role
            };
        }

        next();
    } catch (error) {
        next();
    }
};

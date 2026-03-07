import jwt from 'jsonwebtoken';
const SA_SECRET = process.env.SA_JWT_SECRET || process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';

/**
 * Verifies that the request is from an authenticated Super Admin.
 * Super Admin tokens carry { id, username, role:'superadmin' }.
 */
export const verifySuperAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Super Admin authentication required.', code: 'SA_AUTH_REQUIRED' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SA_SECRET);
        if (decoded.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied. Super Admin only.', code: 'SA_FORBIDDEN' });
        }
        req.superAdmin = { id: decoded.id, username: decoded.username };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Super Admin session expired.', code: 'SA_TOKEN_EXPIRED' });
        }
        return res.status(401).json({ success: false, message: 'Invalid Super Admin token.', code: 'SA_INVALID_TOKEN' });
    }
};

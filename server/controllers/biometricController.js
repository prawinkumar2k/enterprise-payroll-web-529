import crypto from 'crypto';
import db from '../database/dbManager.js';
import jwt from 'jsonwebtoken';
import { logAudit } from '../utils/auditLogger.js';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || '5f4dcc3b5aa765d61d8327deb882cf99';
const BIO_SECRET = process.env.BIO_ENCRYPTION_KEY || '5f4dcc3b5aa765d61d8327deb882cf99'; 
const ALGORITHM = 'aes-256-gcm';
const CONFIDENCE_THRESHOLD = 85;

// Validation Schemas
const registerSchema = z.object({
    user_id: z.number().positive(),
    biometric_type: z.enum(['fingerprint', 'face', 'iris']),
    template_data: z.string().min(10),
    nonce: z.string().optional()
});

const loginSchema = z.object({
    sample_data: z.string().min(10),
    biometric_type: z.enum(['fingerprint', 'face', 'iris'])
});

/**
 * Advanced Encryption for Biometric Templates
 */
const encryptTemplate = (text) => {
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(BIO_SECRET, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Secure Decryption
 */
const decryptTemplate = (encryptedText) => {
    try {
        if (!encryptedText.includes(':')) return encryptedText; 
        const [ivHex, authTagHex, dataHex] = encryptedText.split(':');
        const key = Buffer.from(BIO_SECRET, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        let decrypted = decipher.update(dataHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error('[Biometric] Decryption failed:', e.message);
        return null; 
    }
};

/**
 * Enterprise Similarity Engine
 */
const getSimilarityScore = (s1, s2) => {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 100;
    const len = Math.max(s1.length, s2.length);
    if (len === 0) return 0;
    let dist = 0;
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) dist++;
    }
    return (dist / len) * 100;
};

/**
 * registerBiometric
 */
export const registerBiometric = async (req, res) => {
    try {
        const validated = registerSchema.parse(req.body);
        const { user_id, biometric_type, template_data } = validated;

        // Anti-Replay / Duplicate template check
        const [existing] = await db.query('SELECT id FROM biometric_profiles WHERE biometric_type = ? AND is_active = 1', [biometric_type]);
        for (const profile of existing) {
            const dec = decryptTemplate(profile.template_data);
            if (getSimilarityScore(template_data, dec) > 95) {
                return res.status(409).json({ success: false, message: 'This biometric signature is already registered.' });
            }
        }

        const encrypted = encryptTemplate(template_data);
        await db.execute(
            'INSERT INTO biometric_profiles (user_id, biometric_type, template_data) VALUES (?, ?, ?)',
            [user_id, biometric_type, encrypted]
        );

        await logAudit({
            userId: req.user?.id,
            username: req.user?.username,
            actionType: 'BIOMETRIC_REGISTER',
            module: 'SECURITY',
            description: `Registered ${biometric_type} for user ID ${user_id}`,
        });

        res.json({ success: true, message: 'Biometric profile registered successfully.' });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * biometricLogin
 */
export const biometricLogin = async (req, res) => {
    try {
        const { sample_data, biometric_type } = loginSchema.parse(req.body);

        const [profiles] = await db.query('SELECT * FROM biometric_profiles WHERE biometric_type = ? AND is_active = 1', [biometric_type]);
        
        let matchedProfile = null;
        let maxScore = 0;

        for (const profile of profiles) {
            const decrypted = decryptTemplate(profile.template_data);
            const score = getSimilarityScore(sample_data, decrypted);
            if (score >= CONFIDENCE_THRESHOLD && score > maxScore) {
                maxScore = score;
                matchedProfile = profile;
            }
        }

        if (!matchedProfile) {
            return res.status(401).json({ success: false, message: 'Biometric signature not recognized.' });
        }

        const [userRows] = await db.query('SELECT id, UserID, UserName, Role FROM users WHERE id = ? AND deleted_at IS NULL', [matchedProfile.user_id]);
        const user = userRows ? userRows[0] : null;

        if (!user) return res.status(401).json({ success: false, message: 'User mapping failed.' });

        // Update last_used
        await db.execute('UPDATE biometric_profiles SET last_used = CURRENT_TIMESTAMP WHERE id = ?', [matchedProfile.id]);

        const token = jwt.sign(
            { id: user.id, username: user.UserID, role: user.Role },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        await logAudit({
            userId: user.id,
            username: user.UserID,
            actionType: 'BIOMETRIC_LOGIN',
            module: 'AUTH',
            description: `Successful ${biometric_type} login with confidence ${maxScore.toFixed(2)}%`,
        });

        res.json({ success: true, token, user: { username: user.UserID, fullName: user.UserName, role: user.Role } });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * verifyBiometric
 */
export const verifyBiometric = async (req, res) => {
    try {
        const { sample_data, biometric_type } = loginSchema.parse(req.body);
        const user_id = req.user.id;

        const [profiles] = await db.query('SELECT template_data FROM biometric_profiles WHERE user_id = ? AND biometric_type = ? AND is_active = 1', [user_id, biometric_type]);
        if (!profiles?.length) return res.status(404).json({ success: false, message: 'No active profile found for this user.' });

        const decrypted = decryptTemplate(profiles[0].template_data);
        const score = getSimilarityScore(sample_data, decrypted);
        const match = score >= CONFIDENCE_THRESHOLD;

        await logAudit({
            userId: req.user.id,
            username: req.user.username,
            actionType: 'BIOMETRIC_VERIFY',
            module: 'AUTH',
            description: `Biometric verification: ${match ? 'PASSED' : 'FAILED'} (Confidence: ${score.toFixed(2)}%)`,
        });

        res.json({ success: true, match, confidence: score.toFixed(2) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * batchSyncBiometric (Batch Operations)
 */
export const batchSyncBiometric = async (req, res) => {
    const { profiles } = req.body; // Expect array of profiles
    if (!Array.isArray(profiles)) return res.status(400).json({ success: false, message: 'Invalid payload' });

    try {
        const results = [];
        for (const p of profiles) {
            const encrypted = encryptTemplate(p.template_data);
            await db.execute(
                'INSERT INTO biometric_profiles (user_id, biometric_type, template_data) VALUES (?, ?, ?)',
                [p.user_id, p.biometric_type, encrypted]
            );
            results.push(p.user_id);
        }
        res.json({ success: true, count: results.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * encryption.js — AES-256-GCM Field-Level Encryption
 *
 * Provides transparent encrypt/decrypt for sensitive PII fields:
 *   PANCARD, AccountNo, IFSCCode, OtherAccNo, AadhaarNo
 *
 * Key: process.env.ENCRYPTION_KEY (32 bytes = 64 hex chars)
 * Format stored in DB: base64(iv:authTag:ciphertext)
 * IV is random per encryption (prevents pattern analysis).
 *
 * Usage:
 *   import enc from './encryption.js';
 *   const stored = enc.encrypt('ABCDE1234F');  // store this in DB
 *   const plain  = enc.decrypt(stored);          // retrieves original
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;        // 96-bit IV for GCM (recommended)
const AUTH_TAG_LENGTH = 16;  // 128-bit auth tag
const SEPARATOR = ':';
const ENCRYPTED_MARKER = 'ENC:';  // Prefix to detect already-encrypted values

function getKey() {
    const hex = process.env.ENCRYPTION_KEY;
    if (!hex) {
        // In development without ENCRYPTION_KEY — encryption is a no-op
        if (process.env.NODE_ENV !== 'production') {
            return null;  // Fallback: skip encryption
        }
        throw new Error(
            'FATAL: ENCRYPTION_KEY environment variable is not set. ' +
            'Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
        throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).');
    }
    return Buffer.from(hex, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns an encrypted string prefixed with 'ENC:' for storage.
 * Returns the original value if ENCRYPTION_KEY is not set (dev mode).
 *
 * @param {string|null} plaintext
 * @returns {string|null}
 */
export function encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') return plaintext;
    if (plaintext.startsWith(ENCRYPTED_MARKER)) return plaintext; // Already encrypted

    const key = getKey();
    if (!key) return plaintext; // Dev mode — no key set

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    const combined = [
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted
    ].join(SEPARATOR);

    return ENCRYPTED_MARKER + Buffer.from(combined).toString('base64');
}

/**
 * Decrypt an encrypted string.
 * Returns the original value if not encrypted or ENCRYPTION_KEY not set.
 *
 * @param {string|null} ciphertext
 * @returns {string|null}
 */
export function decrypt(ciphertext) {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
    if (!ciphertext.startsWith(ENCRYPTED_MARKER)) return ciphertext; // Not encrypted

    const key = getKey();
    if (!key) return ciphertext; // Dev mode — can't decrypt

    try {
        const base64 = ciphertext.slice(ENCRYPTED_MARKER.length);
        const combined = Buffer.from(base64, 'base64').toString('utf8');
        const [ivHex, authTagHex, encrypted] = combined.split(SEPARATOR);

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error('[Encryption] Decryption failed:', err.message);
        return null; // Return null rather than exposing corrupted data
    }
}

/**
 * Check if a value is encrypted.
 */
export function isEncrypted(value) {
    return typeof value === 'string' && value.startsWith(ENCRYPTED_MARKER);
}

/**
 * Mask sensitive values for display.
 * 'ABCDE1234F' → 'XXXXX1234X'
 * '9876543210' → '9876XXXXXX'
 */
export function maskPAN(pan) {
    if (!pan || typeof pan !== 'string') return '';
    const p = pan.replace(/\s/g, '');
    if (p.length <= 4) return 'X'.repeat(p.length);
    return p.slice(0, 5).replace(/./g, 'X') + p.slice(5, 9) + 'X';
}

export function maskAccountNumber(accNo) {
    if (!accNo || typeof accNo !== 'string') return '';
    const a = accNo.replace(/\s/g, '');
    if (a.length <= 4) return 'X'.repeat(a.length);
    return 'X'.repeat(a.length - 4) + a.slice(-4);
}

export function maskIFSC(ifsc) {
    if (!ifsc || typeof ifsc !== 'string') return '';
    // IFSC: first 4 = bank code, 5th = 0, last 6 = branch
    // Mask: ABCD0XXXXXX
    return ifsc.slice(0, 4) + '0XXXXXX';
}

/**
 * Encrypt all sensitive fields in an employee data object.
 * Safe to call with any object — skips non-existent fields.
 */
export function encryptEmployeeData(data) {
    if (!data) return data;
    const result = { ...data };
    if (result.PANCARD !== undefined) result.PANCARD = encrypt(result.PANCARD);
    if (result.AccountNo !== undefined) result.AccountNo = encrypt(result.AccountNo);
    if (result.IFSCCode !== undefined) result.IFSCCode = encrypt(result.IFSCCode);
    if (result.OtherAccNo !== undefined) result.OtherAccNo = encrypt(result.OtherAccNo);
    return result;
}

/**
 * Decrypt all sensitive fields in an employee data object.
 */
export function decryptEmployeeData(data) {
    if (!data) return data;
    const result = { ...data };
    if (result.PANCARD !== undefined) result.PANCARD = decrypt(result.PANCARD);
    if (result.AccountNo !== undefined) result.AccountNo = decrypt(result.AccountNo);
    if (result.IFSCCode !== undefined) result.IFSCCode = decrypt(result.IFSCCode);
    if (result.OtherAccNo !== undefined) result.OtherAccNo = decrypt(result.OtherAccNo);
    return result;
}

/**
 * Return masked version of employee data for display (non-admin).
 */
export function maskEmployeeData(data) {
    if (!data) return data;
    const result = { ...data };
    if (result.PANCARD) result.PANCARD = maskPAN(decrypt(result.PANCARD) || result.PANCARD);
    if (result.AccountNo) result.AccountNo = maskAccountNumber(decrypt(result.AccountNo) || result.AccountNo);
    if (result.IFSCCode) result.IFSCCode = maskIFSC(decrypt(result.IFSCCode) || result.IFSCCode);
    if (result.OtherAccNo) result.OtherAccNo = maskAccountNumber(decrypt(result.OtherAccNo) || result.OtherAccNo);
    return result;
}

export default {
    encrypt,
    decrypt,
    isEncrypted,
    maskPAN,
    maskAccountNumber,
    maskIFSC,
    encryptEmployeeData,
    decryptEmployeeData,
    maskEmployeeData,
};

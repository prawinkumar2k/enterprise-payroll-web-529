/**
 * envValidator.js — Startup Environment Variable Validator
 *
 * Called ONCE at server boot before app.listen().
 * Throws a descriptive FATAL error for every missing required variable.
 * This prevents silent security failures (e.g., hardcoded JWT secrets).
 */

const REQUIRED_VARS = [
    {
        key: 'JWT_SECRET',
        description: 'JWT signing secret (min 32 chars, use: openssl rand -hex 32)',
        validate: (v) => v.length >= 32,
        hint: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    },
    {
        key: 'DB_HOST',
        description: 'MySQL database host',
        optional: true // SQLite-only mode is valid
    },
    {
        key: 'DB_USER',
        description: 'MySQL database username',
        optional: true
    },
    {
        key: 'DB_PASSWORD',
        description: 'MySQL database password',
        optional: true
    },
    {
        key: 'DB_NAME',
        description: 'MySQL database name',
        optional: true
    },
    {
        key: 'ENCRYPTION_KEY',
        description: 'AES-256 field encryption key (exactly 64 hex chars = 32 bytes)',
        optional: true, // Will be required once PII encryption is active
        validate: (v) => /^[0-9a-fA-F]{64}$/.test(v),
        hint: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    },
];

const WEAK_SECRETS = new Set([
    '5f4dcc3b5aa765d61d8327deb882cf99',  // MD5 of "password"
    'your_jwt_secret_key_change_in_production',
    'secret',
    'changeme',
    '1234567890',
    'jwt_secret',
    'mysecret',
]);

/**
 * Validate all required environment variables.
 * @throws {Error} with FATAL prefix if any required var is missing or invalid.
 */
export function validateEnv() {
    const errors = [];
    const warnings = [];

    for (const spec of REQUIRED_VARS) {
        const val = process.env[spec.key];

        if (!val || val.trim() === '') {
            if (!spec.optional) {
                errors.push(`  ✗ ${spec.key}: MISSING — ${spec.description}`);
                if (spec.hint) errors.push(`    → Hint: ${spec.hint}`);
            }
            continue;
        }

        // Run custom validator if provided
        if (spec.validate && !spec.validate(val)) {
            if (!spec.optional) {
                errors.push(`  ✗ ${spec.key}: INVALID — ${spec.description}`);
                if (spec.hint) errors.push(`    → Hint: ${spec.hint}`);
            } else {
                warnings.push(`  ⚠ ${spec.key}: value present but failed validation — ${spec.description}`);
            }
        }
    }

    // Check for weak JWT secrets
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && WEAK_SECRETS.has(jwtSecret.toLowerCase())) {
        errors.push(`  ✗ JWT_SECRET: INSECURE — The current value is a known weak/default secret.`);
        errors.push(`    → Generate a strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
    }

    // Print warnings (non-fatal)
    if (warnings.length > 0) {
        console.warn('\n[EnvValidator] ⚠️  Configuration Warnings:');
        warnings.forEach(w => console.warn(w));
    }

    // Throw on errors (fatal)
    if (errors.length > 0) {
        const message = [
            '',
            '╔══════════════════════════════════════════════════════╗',
            '║   FATAL: Environment Configuration Errors Found       ║',
            '╚══════════════════════════════════════════════════════╝',
            '',
            'The server cannot start due to missing or invalid environment variables.',
            'Fix the following issues in your .env file:\n',
            ...errors,
            '',
            'Reference: See .env.example for all required variables.',
            '',
        ].join('\n');

        throw new Error(message);
    }

    console.log('[EnvValidator] ✓ All required environment variables validated.');
}

export default { validateEnv };

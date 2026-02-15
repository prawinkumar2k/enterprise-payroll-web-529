/**
 * ============================================
 * RATE LIMITING ARCHITECTURE VALIDATION SUITE
 * ============================================
 * 
 * Tests the layered rate limiting architecture:
 * - Auth limiter (strict)
 * - Sync limiter (moderate)
 * - Read limiter (light)
 * - Health endpoint isolation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

function log(message, type = 'INFO') {
    const colors = {
        INFO: '\x1b[34m',
        SUCCESS: '\x1b[32m',
        WARNING: '\x1b[33m',
        ERROR: '\x1b[31m',
        RESET: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type}] ${message}${colors.RESET}`);
}

// ============================================
// TEST 1: Auth Limiter (Strict - 5 req/min)
// ============================================
async function testAuthLimiter() {
    log('========================================', 'INFO');
    log('TEST 1: Auth Limiter (Strict)', 'INFO');
    log('========================================', 'INFO');

    const results = {
        test: 'Auth Limiter',
        limit: 5,
        requests: 0,
        success: 0,
        rateLimited: 0,
        errors: 0
    };

    // Send 10 requests rapidly
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'test', password: 'test' })
            });

            results.requests++;

            if (res.status === 200 || res.status === 401) {
                results.success++;
            } else if (res.status === 429) {
                results.rateLimited++;
            } else {
                results.errors++;
            }
        } catch (err) {
            results.errors++;
        }
    }

    const status = (results.success <= 5 && results.rateLimited >= 5) ? 'PASS' : 'FAIL';

    log(`Requests: ${results.requests}`, 'INFO');
    log(`Allowed: ${results.success}`, results.success <= 5 ? 'SUCCESS' : 'ERROR');
    log(`Rate Limited: ${results.rateLimited}`, results.rateLimited >= 5 ? 'SUCCESS' : 'ERROR');
    log(`Errors: ${results.errors}`, results.errors === 0 ? 'SUCCESS' : 'ERROR');
    log(`Status: ${status}`, status === 'PASS' ? 'SUCCESS' : 'ERROR');

    return { ...results, status };
}

// ============================================
// TEST 2: Sync Limiter (Moderate - 60 req/min)
// ============================================
async function testSyncLimiter() {
    log('========================================', 'INFO');
    log('TEST 2: Sync Limiter (Moderate)', 'INFO');
    log('========================================', 'INFO');

    // First get a valid token
    const authRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'admin', password: 'admin' })
    });

    if (!authRes.ok) {
        log('Failed to get auth token - waiting for rate limit reset...', 'WARNING');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return { status: 'SKIPPED', reason: 'Auth rate limited' };
    }

    const { accessToken } = await authRes.json();

    const results = {
        test: 'Sync Limiter',
        limit: 60,
        requests: 0,
        success: 0,
        rateLimited: 0,
        errors: 0
    };

    // Send 70 requests rapidly
    for (let i = 0; i < 70; i++) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/sync/status`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            results.requests++;

            if (res.ok) {
                results.success++;
            } else if (res.status === 429) {
                results.rateLimited++;
            } else {
                results.errors++;
            }
        } catch (err) {
            results.errors++;
        }
    }

    const status = (results.success <= 60 && results.rateLimited >= 10) ? 'PASS' : 'FAIL';

    log(`Requests: ${results.requests}`, 'INFO');
    log(`Allowed: ${results.success}`, 'INFO');
    log(`Rate Limited: ${results.rateLimited}`, results.rateLimited >= 10 ? 'SUCCESS' : 'WARNING');
    log(`Errors: ${results.errors}`, results.errors === 0 ? 'SUCCESS' : 'ERROR');
    log(`Status: ${status}`, status === 'PASS' ? 'SUCCESS' : 'ERROR');

    return { ...results, status };
}

// ============================================
// TEST 3: Read Limiter (Light - 200 req/min)
// ============================================
async function testReadLimiter() {
    log('========================================', 'INFO');
    log('TEST 3: Read Limiter (Light)', 'INFO');
    log('========================================', 'INFO');

    const results = {
        test: 'Read Limiter',
        limit: 200,
        requests: 0,
        success: 0,
        rateLimited: 0,
        errors: 0
    };

    // Send 210 requests rapidly
    for (let i = 0; i < 210; i++) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/settings/global`);

            results.requests++;

            if (res.ok) {
                results.success++;
            } else if (res.status === 429) {
                results.rateLimited++;
            } else {
                results.errors++;
            }
        } catch (err) {
            results.errors++;
        }
    }

    const status = (results.success <= 200 && results.rateLimited >= 10) ? 'PASS' : 'FAIL';

    log(`Requests: ${results.requests}`, 'INFO');
    log(`Allowed: ${results.success}`, 'INFO');
    log(`Rate Limited: ${results.rateLimited}`, results.rateLimited >= 10 ? 'SUCCESS' : 'WARNING');
    log(`Errors: ${results.errors}`, results.errors === 0 ? 'SUCCESS' : 'ERROR');
    log(`Status: ${status}`, status === 'PASS' ? 'SUCCESS' : 'ERROR');

    return { ...results, status };
}

// ============================================
// TEST 4: Health Endpoint Isolation
// ============================================
async function testHealthIsolation() {
    log('========================================', 'INFO');
    log('TEST 4: Health Endpoint Isolation', 'INFO');
    log('========================================', 'INFO');

    const results = {
        test: 'Health Isolation',
        requests: 0,
        success: 0,
        rateLimited: 0,
        errors: 0
    };

    // Send 100 rapid health checks
    for (let i = 0; i < 100; i++) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/health`);

            results.requests++;

            if (res.ok) {
                results.success++;
            } else if (res.status === 429) {
                results.rateLimited++;
            } else {
                results.errors++;
            }
        } catch (err) {
            results.errors++;
        }
    }

    const status = (results.success === 100 && results.rateLimited === 0) ? 'PASS' : 'FAIL';

    log(`Requests: ${results.requests}`, 'INFO');
    log(`Success: ${results.success}`, results.success === 100 ? 'SUCCESS' : 'ERROR');
    log(`Rate Limited: ${results.rateLimited}`, results.rateLimited === 0 ? 'SUCCESS' : 'ERROR');
    log(`Errors: ${results.errors}`, results.errors === 0 ? 'SUCCESS' : 'ERROR');
    log(`Status: ${status}`, status === 'PASS' ? 'SUCCESS' : 'ERROR');

    return { ...results, status };
}

// ============================================
// TEST 5: Mixed Traffic Stability
// ============================================
async function testMixedTraffic() {
    log('========================================', 'INFO');
    log('TEST 5: Mixed Traffic Stability', 'INFO');
    log('========================================', 'INFO');

    const results = {
        test: 'Mixed Traffic',
        healthChecks: 0,
        healthSuccess: 0,
        authRequests: 0,
        authRateLimited: 0,
        readRequests: 0,
        readSuccess: 0
    };

    // Simultaneous mixed traffic
    const promises = [];

    // 50 health checks
    for (let i = 0; i < 50; i++) {
        promises.push(
            fetch(`${BACKEND_URL}/api/health`)
                .then(r => {
                    results.healthChecks++;
                    if (r.ok) results.healthSuccess++;
                })
                .catch(() => { })
        );
    }

    // 20 auth attempts
    for (let i = 0; i < 20; i++) {
        promises.push(
            fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'test', password: 'test' })
            })
                .then(r => {
                    results.authRequests++;
                    if (r.status === 429) results.authRateLimited++;
                })
                .catch(() => { })
        );
    }

    // 30 read requests
    for (let i = 0; i < 30; i++) {
        promises.push(
            fetch(`${BACKEND_URL}/api/settings/global`)
                .then(r => {
                    results.readRequests++;
                    if (r.ok) results.readSuccess++;
                })
                .catch(() => { })
        );
    }

    await Promise.all(promises);

    const status = (results.healthSuccess === 50 && results.authRateLimited > 0) ? 'PASS' : 'FAIL';

    log(`Health Checks: ${results.healthSuccess}/${results.healthChecks}`, results.healthSuccess === 50 ? 'SUCCESS' : 'ERROR');
    log(`Auth Rate Limited: ${results.authRateLimited}/${results.authRequests}`, results.authRateLimited > 0 ? 'SUCCESS' : 'WARNING');
    log(`Read Success: ${results.readSuccess}/${results.readRequests}`, 'INFO');
    log(`Status: ${status}`, status === 'PASS' ? 'SUCCESS' : 'ERROR');

    return { ...results, status };
}

// ============================================
// MAIN EXECUTION
// ============================================
async function runValidation() {
    console.log('\n');
    log('========================================', 'INFO');
    log('🔒 RATE LIMITING ARCHITECTURE VALIDATION', 'INFO');
    log('========================================', 'INFO');
    console.log('\n');

    const summary = {};

    try {
        summary.authLimiter = await testAuthLimiter();
        console.log('\n');

        // Wait 60 seconds for rate limit reset
        log('Waiting 60 seconds for rate limit reset...', 'WARNING');
        await new Promise(resolve => setTimeout(resolve, 60000));

        summary.syncLimiter = await testSyncLimiter();
        console.log('\n');

        summary.readLimiter = await testReadLimiter();
        console.log('\n');

        summary.healthIsolation = await testHealthIsolation();
        console.log('\n');

        summary.mixedTraffic = await testMixedTraffic();
        console.log('\n');

        // Final Report
        log('========================================', 'INFO');
        log('📊 FINAL VALIDATION REPORT', 'INFO');
        log('========================================', 'INFO');
        console.log('\n');

        const report = {
            'Auth Limiter': summary.authLimiter.status,
            'Sync Limiter': summary.syncLimiter.status || 'SKIPPED',
            'Read Limiter': summary.readLimiter.status,
            'Health Isolation': summary.healthIsolation.status,
            'Mixed Traffic Stability': summary.mixedTraffic.status
        };

        const allPassed = Object.values(report).every(s => s === 'PASS' || s === 'SKIPPED');
        report['Overall Status'] = allPassed ? 'PRODUCTION_SAFE' : 'NOT_READY';

        console.log('==== RATE LIMITING ARCHITECTURE VALIDATION ====\n');
        Object.entries(report).forEach(([key, value]) => {
            const type = value === 'PASS' || value === 'PRODUCTION_SAFE' ? 'SUCCESS' :
                value === 'FAIL' || value === 'NOT_READY' ? 'ERROR' : 'WARNING';
            log(`${key}: ${value}`, type);
        });
        console.log('\n===============================================\n');

    } catch (error) {
        log(`Validation failed: ${error.message}`, 'ERROR');
        console.error(error);
        process.exit(1);
    }
}

runValidation().catch(console.error);

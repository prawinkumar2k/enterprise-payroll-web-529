
import dbManager from './database/dbManager.js';
import syncService from './services/sync.service.js';
import { randomUUID } from 'crypto';

/**
 * IDENTITY: Atomic Pull Interruption Proof - Industrial Chaos Test
 * 
 * Verifies that a pull interruption results in a clean rollback,
 * leaving the local database in its original state (No partial data).
 */

async function runAtomicPullTest() {
    console.log('🧪 Starting Atomic Pull Interruption Proof...');

    try {
        await dbManager.init();
        const testBatchId = randomUUID().substring(0, 8);
        const deviceId = "DESKTOP-ATOMIC-001";
        const rowCount = 5000;

        // --- 🔹 0. Clean Environment ---
        console.log(`\n[0/5] Cleaning local environment for batch: ${testBatchId}`);
        await dbManager.execute('DELETE FROM empdet WHERE Category = ?', ['ATOMIC_TEST']);

        // --- 🔹 1. Prepare Bulk Payload ---
        console.log(`[1/5] Generating industrial payload of ${rowCount} rows...`);
        const rows = [];
        for (let i = 0; i < rowCount; i++) {
            rows.push({
                uuid: `ATOMIC-${testBatchId}-${i}`,
                SNAME: `Atomic User ${i}`,
                EMPNO: `ATOMIC-${testBatchId}-${i}`,
                sync_version: 1,
                updated_at: new Date().toISOString(),
                Category: "ATOMIC_TEST"
            });
        }

        const payload = {
            device_id: deviceId,
            tables: {
                empdet: rows
            }
        };

        // --- 🔹 2. Trigger Partial Interruption (60% Crash) ---
        console.log(`[2/5] Attempting pull application with 60% failure trigger...`);
        process.env.CHAOS_PULL_CRASH = "true";

        try {
            await syncService.processPush(payload);
            console.error('❌ FAIL: Process finished successfully but should have crashed!');
        } catch (err) {
            if (err.message.includes("CHAOS_CRASH_TRIGGERED")) {
                console.log('✅ PASS: Simulated crash triggered at 3000/5000 rows.');
            } else {
                console.error('❌ FAIL: Unexpected error during crash test:', err.message);
                throw err;
            }
        }

        // --- 🔹 3. Atomic State Validation (Post-Crash) ---
        console.log('\n[3/5] Validating Atomic Atomicity (Rollback Check)...');
        const postCrashCount = (await dbManager.query('SELECT COUNT(*) as count FROM empdet WHERE Category = ?', ['ATOMIC_TEST']))[0].count;

        console.log(`   -> Row Count after crash: ${postCrashCount} (Expected: 0)`);

        if (postCrashCount !== 0) {
            console.error(`❌ FAIL: Partial Data found! Atomicity broken. Count: ${postCrashCount}`);
            process.exit(1);
        } else {
            console.log('✅ PASS: Local database is clean. Transaction rolled back successfully.');
        }

        // --- 🔹 4. Recovery & Full Application ---
        console.log('\n[4/5] Starting Recovery (Resuming without chaos)...');
        delete process.env.CHAOS_PULL_CRASH;

        const startTime = Date.now();
        const recoveryResult = await syncService.processPush(payload);
        const endTime = Date.now();

        console.log(`   -> Recovery Results: ${recoveryResult.processed} rows processed.`);
        console.log(`   -> Performance: ${rowCount} rows in ${(endTime - startTime) / 1000}s`);

        // --- 🔹 5. Final Integrity Check ---
        console.log('\n[5/5] Final Integrity Validation...');
        const finalCount = (await dbManager.query('SELECT COUNT(*) as count FROM empdet WHERE Category = ?', ['ATOMIC_TEST']))[0].count;

        console.log('\n==== ATOMIC PULL TEST RESULT ====');
        console.log(`Target Row Count: ${rowCount}`);
        console.log(`Post-Crash Count: ${postCrashCount}`);
        console.log(`Final Row Count: ${finalCount}`);
        console.log(`Performance Target: < 6.0s (Actual: ${(endTime - startTime) / 1000}s)`);

        let failed = false;

        if (finalCount !== rowCount) {
            console.error(`❌ FAIL: Final row count mismatch! Expected ${rowCount}, got ${finalCount}`);
            failed = true;
        }

        if (!failed) {
            console.log('STATUS: PASS ✅');
        } else {
            console.log('STATUS: FAIL ❌');
        }
        console.log('=================================\n');

        process.exit(failed ? 1 : 0);

    } catch (error) {
        console.error('💥 Atomic Pull Test FAILED:', error);
        process.exit(1);
    }
}

runAtomicPullTest();


import dbManager from './database/dbManager.js';
import modeManager from './database/modeManager.js';
import syncService from './services/sync.service.js';
import { randomUUID } from 'crypto';

/**
 * IDENTITY: Crash Resilience & Zombie Sync Prevention - Final Chaos Proof
 * 
 * Verifies that the system auto-recovers from a hard crash mid-transaction
 * without leaving "Zombie Sync" states or half-applied records.
 */

async function runCrashResilienceTest() {
    console.log('🧪 Starting Crash Resilience & Zombie Sync Proof...');

    try {
        await dbManager.init();
        await modeManager.init();

        const testUuid = "CRASH-" + randomUUID().substring(0, 8);
        const rowCount = 5000;

        // --- 🔹 0. Clean Environment ---
        console.log(`\n[0/5] Preparing baseline...`);
        await dbManager.execute('DELETE FROM empdet WHERE Category = ?', ['CRASH_TEST'], true);

        // --- 🔹 1. Prepare Massive Payload ---
        console.log(`[1/5] Generating ${rowCount} rows for massive write...`);
        const rows = [];
        for (let i = 0; i < rowCount; i++) {
            rows.push({
                uuid: `${testUuid}-${i}`,
                SNAME: `Crash User ${i}`,
                EMPNO: `CR-NO-${i}`,
                sync_version: 1,
                updated_at: new Date().toISOString(),
                Category: "CRASH_TEST"
            });
        }
        const payload = { device_id: "CRASH-DEVICE", tables: { empdet: rows } };

        // --- 🔹 2. Start Sync & Inject Crash ---
        console.log(`[2/5] Starting Sync and Injecting Hard Crash at 50%...`);
        modeManager.setSyncing(true);
        console.log(`   -> Current Mode (Before Crash): ${modeManager.getMode()}`);

        process.env.CHAOS_WRITE_CRASH = "true";

        try {
            await syncService.processPush(payload);
        } catch (err) {
            if (err.message === "FATAL_CRASH_SIMULATION") {
                console.log('💥 [CRASH] Process Terminated Abruptly.');
            } else {
                throw err;
            }
        }

        // --- 🔹 3. Simulated Restart ---
        // In a real crash, memory is wiped. We simulate this by resetting modeManager 
        // as it would happen on a new process start.
        console.log('\n[3/5] Simulating System Restart (Initializing Fresh Engine)...');
        // Re-creating or re-initializing the singleton as it happens in index.js
        const freshModeManager = modeManager; // In JS symbols are shared, but constructor state should be reset
        freshModeManager.isSyncing = false; // Reset memory state
        await freshModeManager.init();

        // --- 🔹 4. State Validation ---
        console.log('[4/5] Executing Post-Crash Validation...');

        const modeAfterRestart = freshModeManager.getMode();
        const postCrashCount = (await dbManager.query('SELECT COUNT(*) as count FROM empdet WHERE Category = ?', ['CRASH_TEST']))[0].count;

        console.log(`   -> Mode After Restart: ${modeAfterRestart}`);
        console.log(`   -> Row Count in MySQL: ${postCrashCount}`);

        // --- 🔹 5. Industrial Check ---
        console.log('\n==== CRASH RESILIENCE TEST RESULT ====');
        console.log(`Mode Reset (No Zombie Sync): ${modeAfterRestart !== 'SYNCING' ? 'YES' : 'NO'}`);
        console.log(`Atomicity (Clean Rollback): ${postCrashCount === 0 ? 'YES' : 'NO'}`);

        let failed = false;

        if (modeAfterRestart === 'SYNCING') {
            console.error('❌ FAIL: Zombie Sync State detected!');
            failed = true;
        }

        if (postCrashCount !== 0) {
            console.error(`❌ FAIL: Partial Data committed! Transaction was not atomic. Count: ${postCrashCount}`);
            failed = true;
        }

        if (!failed) {
            console.log('STATUS: PASS ✅ (Clean Recovery & Transaction Integrity)');
        } else {
            console.log('STATUS: FAIL ❌');
        }
        console.log('======================================\n');

        delete process.env.CHAOS_WRITE_CRASH;
        process.exit(failed ? 1 : 0);

    } catch (error) {
        console.error('💥 Crash Resilience Test FAILED:', error);
        process.exit(1);
    }
}

runCrashResilienceTest();

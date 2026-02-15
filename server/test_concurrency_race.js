
import dbManager from './database/dbManager.js';
import syncService from './services/sync.service.js';
import { randomUUID } from 'crypto';

/**
 * IDENTITY: Concurrency Race Proof - Industrial Chaos Test
 * 
 * Verifies that simultaneous updates to the same record by different clients
 * are handled deterministically using row-level locking (FOR UPDATE).
 * One should succeed (v1->v2), and the other should be rejected as a conflict.
 */

async function runConcurrencyTest() {
    console.log('🧪 Starting Concurrency Race Proof...');

    try {
        await dbManager.init();
        const testUuid = "RACE-" + randomUUID().substring(0, 8);
        const testEmpNo = "RACE-" + Math.floor(Math.random() * 10000);
        const fixedTimestamp = new Date().toISOString();

        // --- 🔹 0. Clean Environment ---
        console.log(`\n[0/4] Preparing baseline for UUID: ${testUuid}`);
        await dbManager.execute('DELETE FROM empdet WHERE uuid = ?', [testUuid]);
        await dbManager.execute('DELETE FROM sync_logs WHERE record_uuid = ?', [testUuid]);

        // --- 🔹 1. Create Initial Record (Version 1) ---
        console.log('[1/4] Creating initial server record (Version 1)...');
        const initialPayload = {
            device_id: "INIT-DEVICE",
            tables: {
                empdet: [{
                    uuid: testUuid,
                    SNAME: "Original Name",
                    EMPNO: testEmpNo,
                    sync_version: 1,
                    updated_at: fixedTimestamp,
                    Category: "RaceBaseline"
                }]
            }
        };
        const initResult = await syncService.processPush(initialPayload);
        console.log(`   -> Init Result: Processed=${initResult.processed}, Conflicts=${initResult.conflicts.length}`);

        console.log('[1.5/4] Waiting 2s to ensure timestamp progression...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- 🔹 2. Prepare Concurrent Updates (v1 -> v2) ---
        // Both clients think they are updating version 1 to version 2
        console.log('[2/4] Preparing two concurrent push requests for the same record...');

        const payloadA = {
            device_id: "CLIENT-A",
            tables: {
                empdet: [{
                    uuid: testUuid,
                    SNAME: "Update By Client A",
                    EMPNO: testEmpNo,
                    sync_version: 1, // Updating based on v1
                    updated_at: new Date().toISOString(),
                    Category: "RaceUpdateA"
                }]
            }
        };

        const payloadB = {
            device_id: "CLIENT-B",
            tables: {
                empdet: [{
                    uuid: testUuid,
                    SNAME: "Update By Client B",
                    EMPNO: testEmpNo,
                    sync_version: 1, // Updating based on v1
                    updated_at: new Date().toISOString(),
                    Category: "RaceUpdateB"
                }]
            }
        };

        // --- 🔹 3. Execute concurrently ---
        console.log('[3/4] Launching parallel push requests...');
        const [resultA, resultB] = await Promise.all([
            syncService.processPush(payloadA).catch(e => ({ error: e.message })),
            syncService.processPush(payloadB).catch(e => ({ error: e.message }))
        ]);

        console.log(`   -> Result A: Processed=${resultA.processed || 0}, Conflicts=${(resultA.conflicts || []).length}, Error=${resultA.error || 'None'}`);
        console.log(`   -> Result B: Processed=${resultB.processed || 0}, Conflicts=${(resultB.conflicts || []).length}, Error=${resultB.error || 'None'}`);

        // Log conflicts found (simulating controller behavior)
        if (resultA.conflicts && resultA.conflicts.length > 0) {
            for (const c of resultA.conflicts) await syncService.logSyncConflict({ ...c, device_id: 'CLIENT-A' });
        }
        if (resultB.conflicts && resultB.conflicts.length > 0) {
            for (const c of resultB.conflicts) await syncService.logSyncConflict({ ...c, device_id: 'CLIENT-B' });
        }

        // --- 🔹 4. Validation ---
        console.log('\n[4/4] Validating Concurrency Safety...');

        const finalRow = (await dbManager.query('SELECT SNAME, sync_version, updated_at FROM empdet WHERE uuid = ?', [testUuid]))[0];
        const conflictLogs = await dbManager.query('SELECT conflict_reason, device_id FROM sync_logs WHERE record_uuid = ? AND status = "CONFLICT"', [testUuid]);

        console.log('\n==== CONCURRENCY TEST RESULT ====');
        console.log(`Initial Version: 1`);
        console.log(`Final Version: ${finalRow.sync_version}`);
        console.log(`Final Content: ${finalRow.SNAME}`);
        console.log(`Conflicts Detected: ${conflictLogs.length}`);

        if (conflictLogs.length > 0) {
            console.log(`Conflict Device: ${conflictLogs[0].device_id}`);
            console.log(`Reason: ${conflictLogs[0].conflict_reason}`);
        }

        let failed = false;

        // Check 1: Version Integrity
        if (finalRow.sync_version !== 2) {
            console.error(`❌ FAIL: Version drift or double increment! Expected 2, got ${finalRow.sync_version}`);
            failed = true;
        }

        // Check 2: Conflict Resolution
        if (conflictLogs.length === 0) {
            console.error('❌ FAIL: No conflict detected! One update might have been lost (silent overwrite).');
            failed = true;
        }

        // Check 3: Determinism
        if (finalRow.SNAME !== "Update By Client A" && finalRow.SNAME !== "Update By Client B") {
            console.error('❌ FAIL: Data corruption! Neither update matches.');
            failed = true;
        }

        if (!failed) {
            console.log('STATUS: PASS ✅ (Deterministic Conflict Resolution)');
        } else {
            console.log('STATUS: FAIL ❌');
        }
        console.log('=================================\n');

        process.exit(failed ? 1 : 0);

    } catch (error) {
        console.error('💥 Concurrency Test FAILED:', error);
        process.exit(1);
    }
}

runConcurrencyTest();

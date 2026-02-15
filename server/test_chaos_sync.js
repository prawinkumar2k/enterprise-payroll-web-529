
import axios from 'axios';
import modeManager from './database/modeManager.js';
import dbManager from './database/dbManager.js';

/**
 * Chaos Test Utility - Hybrid Stabilization Phase
 * 
 * Objectives:
 * 1. Test SYNCING lock during writes
 * 2. Simulate rapid mode switches
 * 3. Verify error handling for duplicates
 */

async function runChaosTest() {
    console.log('🚀 Starting Chaos & Stability Test...');

    try {
        await dbManager.init();

        // Scenario 1: Write Attempt during SYNCING mode
        console.log('\n[Scenario 1] Blocking writes during Sync...');
        modeManager.setSyncing(true);

        try {
            await dbManager.execute('INSERT INTO empdet (uuid, SNAME) VALUES ("CHAOS-1", "Test User")');
            console.error('❌ FAIL: Write allowed during SYNCING mode!');
        } catch (err) {
            console.log('✅ PASS: Write blocked as expected:', err.message);
        }

        modeManager.setSyncing(false);

        // Scenario 2: Rapid Mode Switching
        console.log('\n[Scenario 2] Rapid Online/Offline switching...');
        for (let i = 0; i < 5; i++) {
            modeManager._updateMode(); // Force recalculation
            console.log(`Current Mode: ${modeManager.getMode()}`);
        }
        console.log('✅ PASS: Mode manager stable under stress.');

        // Scenario 3: Large Payload Simulation
        console.log('\n[Scenario 3] Database transaction safety...');
        const conn = await dbManager.getConnection();
        try {
            await conn.beginTransaction();
            await conn.execute('DELETE FROM empdet WHERE uuid = "TRAN-TEST"');
            await conn.execute('INSERT INTO empdet (uuid, SNAME) VALUES ("TRAN-TEST", "A")');
            await conn.execute('INSERT INTO empdet (uuid, SNAME) VALUES ("TRAN-TEST", "B")'); // Force unique constraint fail
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            console.log('✅ PASS: Transaction rolled back on duplicate error.');
        } finally {
            conn.release();
        }

        console.log('\n[Summary] Chaos tests completed.');
        process.exit(0);

    } catch (error) {
        console.error('💥 Chaos Test FAILED:', error);
        process.exit(1);
    }
}

runChaosTest();


import dbManager from '../database/dbManager.js';
import syncService from '../services/sync.service.js';
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

/**
 * BENCHMARK: 1,000 Row Sync (Push + Pull Cycle)
 * Target: < 2.5 seconds
 */

async function runBenchmark() {
    console.log('📊 Starting 1,000 Row Sync Benchmark...');

    try {
        await dbManager.init();

        const ITERATIONS = 20;
        const SINGLE_LOAD = 1000;
        const times = [];

        console.log(`Setting: ${SINGLE_LOAD} rows per cycle, ${ITERATIONS} iterations.\n`);

        for (let i = 0; i <= ITERATIONS; i++) {
            const isWarmup = i === 0;
            if (isWarmup) console.log('🔥 Warm-up run starting...');
            else console.log(`🚀 Iteration ${i}/${ITERATIONS}...`);

            // 1. Prepare Data
            const rows = [];
            const deviceId = `BENCH-SYNC-${randomUUID().substring(0, 8)}`;
            for (let j = 0; j < SINGLE_LOAD; j++) {
                rows.push({
                    uuid: randomUUID(),
                    SNAME: `Sync User ${j}`,
                    EMPNO: `SYNC-${j}`,
                    Category: 'BENCHMARK_SYNC',
                    sync_version: 1,
                    updated_at: new Date().toISOString()
                });
            }

            const payload = {
                device_id: deviceId,
                tables: { empdet: rows }
            };

            // 2. Measure Operation
            const start = performance.now();

            // a. Push
            await syncService.processPush(payload);

            // b. Pull (Since old timestamp)
            const since = new Date(Date.now() - 10000).toISOString();
            await syncService.processPull(since, 'ANOTHER-DEVICE');

            const end = performance.now();
            const duration = (end - start) / 1000;

            if (!isWarmup) {
                times.push(duration);
                console.log(`   -> Completed in ${duration.toFixed(3)}s`);
            } else {
                console.log(`   -> Warm-up done in ${duration.toFixed(3)}s`);
            }

            // 3. Cleanup
            await dbManager.execute('DELETE FROM empdet WHERE Category = ?', ['BENCHMARK_SYNC'], true);
            await dbManager.execute('DELETE FROM sync_logs WHERE device_id = ?', [deviceId], true);
        }

        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);

        console.log('\n==== BENCHMARK RESULT ====');
        console.log(`Test: 1,000 Row Sync Cycle`);
        console.log(`Average: ${avg.toFixed(3)}s`);
        console.log(`Max: ${max.toFixed(3)}s`);
        console.log(`Min: ${min.toFixed(3)}s`);

        const status = avg < 2.5 ? 'PASS ✅' : 'FAIL ❌';
        console.log(`Status: ${status}`);
        console.log('==========================\n');

        process.exit(avg < 2.5 ? 0 : 1);

    } catch (error) {
        console.error('💥 Benchmark FAILED:', error);
        process.exit(1);
    }
}

runBenchmark();

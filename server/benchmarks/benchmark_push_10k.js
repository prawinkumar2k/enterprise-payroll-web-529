
import dbManager from '../database/dbManager.js';
import syncService from '../services/sync.service.js';
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

/**
 * BENCHMARK: 10,000 Row Push
 * Target: < 6 seconds
 */

async function runBenchmark() {
    console.log('📊 Starting 10,000 Row Push Benchmark...');

    try {
        await dbManager.init();

        const ITERATIONS = 20;
        const SINGLE_LOAD = 10000;
        const times = [];

        console.log(`Setting: ${SINGLE_LOAD} rows per push, ${ITERATIONS} iterations.\n`);

        for (let i = 0; i <= ITERATIONS; i++) {
            const isWarmup = i === 0;
            if (isWarmup) console.log('🔥 Warm-up run starting...');
            else console.log(`🚀 Iteration ${i}/${ITERATIONS}...`);

            // 1. Prepare Data
            const rows = [];
            for (let j = 0; j < SINGLE_LOAD; j++) {
                rows.push({
                    uuid: randomUUID(),
                    SNAME: `Push User ${j}`,
                    EMPNO: `PSH-${i}-${j}`,
                    Category: 'BENCHMARK_PUSH',
                    sync_version: 1,
                    updated_at: new Date().toISOString()
                });
            }

            const payload = {
                device_id: "BENCH-PUSH-DEVICE",
                tables: { empdet: rows }
            };

            // 2. Measure Operation
            const start = performance.now();
            await syncService.processPush(payload);
            const end = performance.now();

            const duration = (end - start) / 1000;

            if (!isWarmup) {
                times.push(duration);
                console.log(`   -> Completed in ${duration.toFixed(3)}s`);
            } else {
                console.log(`   -> Warm-up done in ${duration.toFixed(3)}s`);
            }

            // 3. Cleanup
            await dbManager.execute('DELETE FROM sync_logs WHERE device_id = ?', ['BENCH-PUSH-DEVICE'], true);
            await dbManager.execute('DELETE FROM audit_logs WHERE username = ?', ['BENCH-PUSH-DEVICE'], true);
            await dbManager.execute('DELETE FROM empdet WHERE EMPNO LIKE ?', [`PSH-${i}-%`], true);
        }

        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);

        console.log('\n==== BENCHMARK RESULT ====');
        console.log(`Test: 10,000 Row Push`);
        console.log(`Average: ${avg.toFixed(3)}s`);
        console.log(`Max: ${max.toFixed(3)}s`);
        console.log(`Min: ${min.toFixed(3)}s`);

        const status = avg < 6 ? 'PASS ✅' : 'FAIL ❌';
        console.log(`Status: ${status}`);
        console.log('==========================\n');

        process.exit(avg < 6 ? 0 : 1);

    } catch (error) {
        console.error('💥 Benchmark FAILED:', error);
        process.exit(1);
    }
}

runBenchmark();

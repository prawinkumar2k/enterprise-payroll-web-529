
import dbManager from '../database/dbManager.js';
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

/**
 * BENCHMARK: 50,000 Attendance Insert
 * Target: < 12 seconds
 */

async function runBenchmark() {
    console.log('📊 Starting 50k Attendance Insert Benchmark...');

    try {
        await dbManager.init();

        const ITERATIONS = 20;
        const SINGLE_LOAD = 50000;
        const BATCH_SIZE = 1000;
        const times = [];

        console.log(`Setting: ${SINGLE_LOAD} rows per iteration, ${ITERATIONS} iterations.`);
        console.log(`Architecture: Chunked inserts of ${BATCH_SIZE} rows within a single transaction.\n`);

        for (let i = 0; i <= ITERATIONS; i++) {
            const isWarmup = i === 0;
            if (isWarmup) console.log('🔥 Warm-up run starting...');
            else console.log(`🚀 Iteration ${i}/${ITERATIONS}...`);

            // 1. Prepare Data
            const rows = [];
            for (let j = 0; j < SINGLE_LOAD; j++) {
                rows.push({
                    uuid: randomUUID(),
                    ADATE: '2026-02-11',
                    EMPNO: `BENCH-${j}`,
                    SNAME: `Benchmark User ${j}`,
                    Category: 'BENCHMARK',
                    AttType: 'P'
                });
            }

            // 2. Measure Operation
            const start = performance.now();

            const connection = await dbManager.getConnection(true);
            try {
                await connection.beginTransaction();

                for (let k = 0; k < rows.length; k += BATCH_SIZE) {
                    const batch = rows.slice(k, k + BATCH_SIZE);
                    const fields = ['uuid', 'ADATE', 'EMPNO', 'SNAME', 'Category', 'AttType'];
                    const placeholders = batch.map(() => `(${fields.map(() => '?').join(',')})`).join(',');
                    const values = batch.flatMap(row => fields.map(f => row[f]));

                    const sql = `INSERT INTO staffattendance (${fields.map(f => `\`${f}\``).join(',')}) VALUES ${placeholders}`;
                    await connection.query(sql, values);
                }

                await connection.commit();
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }

            const end = performance.now();
            const duration = (end - start) / 1000;

            if (!isWarmup) {
                times.push(duration);
                console.log(`   -> Completed in ${duration.toFixed(3)}s`);
            } else {
                console.log(`   -> Warm-up done in ${duration.toFixed(3)}s`);
            }

            // 3. Cleanup (not measured)
            await dbManager.execute('DELETE FROM staffattendance WHERE Category = ?', ['BENCHMARK'], true);
        }

        // --- Summary Statistics ---
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);

        console.log('\n==== BENCHMARK RESULT ====');
        console.log(`Test: 50,000 Attendance Insert`);
        console.log(`Average: ${avg.toFixed(3)}s`);
        console.log(`Max: ${max.toFixed(3)}s`);
        console.log(`Min: ${min.toFixed(3)}s`);

        const status = avg < 12 ? 'PASS ✅' : 'FAIL ❌';
        console.log(`Status: ${status}`);
        console.log('==========================\n');

        process.exit(avg < 12 ? 0 : 1);

    } catch (error) {
        console.error('💥 Benchmark FAILED:', error);
        process.exit(1);
    }
}

runBenchmark();

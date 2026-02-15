
import dbManager from '../database/dbManager.js';
import { generateSalary } from '../controllers/salary.controller.js';
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

/**
 * BENCHMARK: Salary Generation (100 Employees)
 * Target: < 1.5 seconds
 */

async function runBenchmark() {
    console.log('📊 Starting 100 Employee Salary Generation Benchmark...');

    try {
        await dbManager.init();

        const ITERATIONS = 20;
        const EMP_COUNT = 100;
        const times = [];

        // --- 0. Setup Baseline Employees ---
        console.log(`[0/4] Preparing ${EMP_COUNT} active employees...`);
        await dbManager.execute('DELETE FROM empdet WHERE Category = ?', ['BENCHMARK_SALARY'], true);
        await dbManager.execute('DELETE FROM emppay WHERE MONTHYEAR LIKE ?', ['BENCH-RY-%'], true);

        const employees = [];
        for (let i = 0; i < EMP_COUNT; i++) {
            employees.push([
                randomUUID(), `EMP-SAL-${i}`, `Salary User ${i}`, 'Active', 'BENCHMARK_SALARY', 50000, 5000, 1000, 500, 200
            ]);
        }

        const fields = ['uuid', 'EMPNO', 'SNAME', 'CheckStatus', 'Category', 'PAY', 'GradePay', 'DA', 'EPF', 'ESI'];
        const placeholders = employees.map(() => `(${fields.map(() => '?').join(',')})`).join(',');
        const sql = `INSERT INTO empdet (${fields.map(f => `\`${f}\``).join(',')}) VALUES ${placeholders}`;
        await dbManager.execute(sql, employees.flat(), true);

        console.log(`[1/4] Starting ${ITERATIONS} iterations of generation.\n`);

        for (let i = 0; i <= ITERATIONS; i++) {
            const isWarmup = i === 0;
            const monthYear = `BENCH-RY-${i.toString().padStart(2, '0')}-2026`; // Unique month per iteration to avoid conflict

            if (isWarmup) console.log('🔥 Warm-up run starting...');
            else console.log(`🚀 Iteration ${i}/${ITERATIONS} (${monthYear})...`);

            const mockReq = {
                body: { monthYear },
                user: { username: 'BENCHMARK_USER', name: 'Benchmark Operator' },
                socket: { remoteAddress: '127.0.0.1' }
            };
            const mockRes = {
                json: (data) => data,
                status: function (code) { this.statusCode = code; return this; }
            };

            // 2. Measure Operation
            const start = performance.now();
            await generateSalary(mockReq, mockRes);
            const end = performance.now();
            const duration = (end - start) / 1000;

            if (mockRes.statusCode && mockRes.statusCode !== 200) {
                console.error(`❌ Error during generation: ${mockRes.statusCode}`);
            }

            if (!isWarmup) {
                times.push(duration);
                console.log(`   -> Completed in ${duration.toFixed(3)}s`);
            } else {
                console.log(`   -> Warm-up done in ${duration.toFixed(3)}s`);
            }
        }

        // --- Summary Statistics ---
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);

        console.log('\n==== BENCHMARK RESULT ====');
        console.log(`Test: Salary Generation (100 Employees)`);
        console.log(`Average: ${avg.toFixed(3)}s`);
        console.log(`Max: ${max.toFixed(3)}s`);
        console.log(`Min: ${min.toFixed(3)}s`);

        const status = avg < 1.5 ? 'PASS ✅' : 'FAIL ❌';
        console.log(`Status: ${status}`);
        console.log('==========================\n');

        // Cleanup
        console.log('[Cleanup] Removing benchmark salary data...');
        await dbManager.execute('DELETE FROM empdet WHERE Category = ?', ['BENCHMARK_SALARY'], true);
        await dbManager.execute('DELETE FROM emppay WHERE MONTHYEAR LIKE ?', ['BENCH-RY-%'], true);

        process.exit(avg < 1.5 ? 0 : 1);

    } catch (error) {
        console.error('💥 Benchmark FAILED:', error);
        process.exit(1);
    }
}

runBenchmark();

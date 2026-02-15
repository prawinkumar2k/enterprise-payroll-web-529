import fs from 'fs';
import path from 'path';

/**
 * Enterprise Metrics Service
 * Tracks stability, performance, and usage patterns for beta validation.
 */
class MetricsService {
    constructor() {
        this.metricsPath = path.join(process.env.DATA_PATH || process.cwd(), 'beta-metrics.json');
        this.dbPath = path.join(process.env.DATA_PATH || process.cwd(), 'local_payroll.db');
    }

    /**
     * Load existing metrics or return defaults
     */
    getMetrics() {
        try {
            if (fs.existsSync(this.metricsPath)) {
                return JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
            }
        } catch (e) {
            console.error('[Metrics] Load failed:', e);
        }
        return {
            total_app_launches: 0,
            successful_launches: 0,
            safe_mode_launches: 0,
            crash_count: 0,
            last_crash_timestamp: null,
            avg_startup_time_ms: 0,
            memory_peak_mb: 0,
            db_size_mb: 0,
            usage: {
                payroll_generations: 0,
                reversals: 0,
                attendance_imports: 0,
                report_exports: 0
            },
            integrity_failures: 0,
            last_integrity_fail: null,
            startup_history: [] // Keep last 10 for averaging
        };
    }

    saveMetrics(metrics) {
        try {
            fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
        } catch (e) {
            console.error('[Metrics] Save failed:', e);
        }
    }

    /**
     * Update metrics on app start (without incrementing launch count)
     */
    updateSystemMetrics(isSafeMode, startupTimeMs) {
        const metrics = this.getMetrics();
        if (isSafeMode) metrics.safe_mode_launches++;

        // Performance
        if (startupTimeMs) {
            metrics.startup_history.push(startupTimeMs);
            if (metrics.startup_history.length > 10) metrics.startup_history.shift();
            metrics.avg_startup_time_ms = Math.round(
                metrics.startup_history.reduce((a, b) => a + b, 0) / metrics.startup_history.length
            );
        }

        // DB Size
        try {
            if (fs.existsSync(this.dbPath)) {
                const stats = fs.statSync(this.dbPath);
                metrics.db_size_mb = Number((stats.size / (1024 * 1024)).toFixed(2));
            }
        } catch (e) { }

        this.saveMetrics(metrics);
        return metrics;
    }

    /**
     * Record specific usage events
     */
    recordUsage(event) {
        const metrics = this.getMetrics();
        if (metrics.usage[event] !== undefined) {
            metrics.usage[event]++;
            this.saveMetrics(metrics);
        }
    }

    /**
     * Record a crash event
     */
    recordCrash() {
        const metrics = this.getMetrics();
        metrics.crash_count++;
        metrics.last_crash_timestamp = new Date().toISOString();
        this.saveMetrics(metrics);
    }

    /**
     * Calculate Release Readiness Score (0-100)
     */
    calculateReadinessScore() {
        const metrics = this.getMetrics();
        let score = 100;

        // 1. Crash Rate Check
        const crashRate = metrics.total_app_launches > 0
            ? (metrics.crash_count / metrics.total_app_launches)
            : 0;

        if (crashRate > 0.05) score -= 15; // Unstable
        else if (crashRate > 0.03) score -= 5;

        // 2. Safe Mode Impacts
        score -= (metrics.safe_mode_launches * 10);

        // 3. Integrity Failures
        score -= (metrics.integrity_failures * 10);

        // 4. Resource Warnings
        if (metrics.db_size_mb > 200) score -= 5;
        if (metrics.memory_peak_mb > 1024) score -= 5;

        return {
            score: Math.max(0, score),
            crashRate: Number((crashRate * 100).toFixed(2)),
            isStable: score >= 80,
            metrics
        };
    }
}

export default new MetricsService();

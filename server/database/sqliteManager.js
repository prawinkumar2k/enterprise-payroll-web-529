
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MigrationEngine from '../services/migration.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SQLite Manager - Pure JS Persistence Layer (sql.js)
 * Guarantees zero native build errors on Windows.
 */
class SQLiteManager {
    constructor() {
        this.db = null;
        this.SQL = null;
        this.baseDataPath = process.env.DATA_PATH || path.join(__dirname, '../../');
        this.dbPath = path.join(this.baseDataPath, 'local_payroll.db');
        this.isInitialized = false;
    }

    async ensureInitialized() {
        if (this.isInitialized) return;

        console.log(`[SQLiteManager] Initializing Pure JS Engine. DB: ${this.dbPath}`);
        this.SQL = await initSqlJs();

        if (fs.existsSync(this.dbPath)) {
            const fileBuffer = fs.readFileSync(this.dbPath);
            this.db = new this.SQL.Database(fileBuffer);
        } else {
            this.db = new this.SQL.Database();
            this.saveToDisk();
        }

        this.isInitialized = true;
    }

    saveToDisk() {
        try {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(this.dbPath, buffer);
        } catch (error) {
            console.error('[SQLiteManager] Persistence Failure:', error);
        }
    }

    /**
     * Initialize Local Schema
     */
    async initSchema() {
        await this.ensureInitialized();
        console.log('[SQLiteManager] Initializing local schema...');

        try {
            // 1. Initial Baseline Table Creation
            this.db.exec(`
                -- Core User Tables
                CREATE TABLE IF NOT EXISTS userdetails (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    UserID TEXT NOT NULL UNIQUE,
                    Password TEXT NOT NULL,
                    UserName TEXT NOT NULL,
                    Qualification TEXT,
                    Department TEXT,
                    Role TEXT NOT NULL,
                    Contact TEXT,
                    Remark TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS login_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    ip_address TEXT,
                    status TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    token TEXT NOT NULL UNIQUE,
                    user_id INTEGER,
                    device_id TEXT,
                    expires_at TEXT,
                    revoked_at TEXT,
                    replaced_by_token TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                -- Business Logic Tables
                CREATE TABLE IF NOT EXISTS empdet (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT UNIQUE,
                    EMPNO TEXT,
                    SNAME TEXT,
                    DESIGNATION TEXT,
                    AbsGroup TEXT,
                    DGroup TEXT,
                    PAY REAL,
                    GradePay REAL,
                    Category TEXT,
                    PANCARD TEXT,
                    AccountNo TEXT,
                    BankName TEXT,
                    IFSCCode TEXT,
                    OtherAccNo TEXT,
                    DOB TEXT,
                    JDATE TEXT,
                    RDATE TEXT,
                    LDATE TEXT,
                    CheckStatus TEXT,
                    DA REAL,
                    EPF REAL,
                    ESI REAL,
                    MPHIL REAL,
                    PHD REAL,
                    HATA REAL,
                    Allowance REAL,
                    SPECIAL REAL,
                    INTERIM REAL,
                    OD INTEGER,
                    CL INTEGER,
                    ML INTEGER,
                    MaL INTEGER,
                    RH INTEGER,
                    SL INTEGER,
                    LOP REAL,
                    LopDate TEXT,
                    is_synced INTEGER DEFAULT 0,
                    sync_version INTEGER DEFAULT 1,
                    device_id TEXT,
                    tenant_id TEXT DEFAULT 'local',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    deleted_at TEXT
                );

                CREATE TABLE IF NOT EXISTS staffattendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT UNIQUE,
                    ADATE TEXT,
                    EMPNO TEXT,
                    SNAME TEXT,
                    DESIGNATION TEXT,
                    Category TEXT,
                    AttType TEXT,
                    Leave REAL,
                    Sessions TEXT,
                    Remark TEXT,
                    LOP REAL,
                    CREATED_BY TEXT,
                    is_synced INTEGER DEFAULT 0,
                    sync_version INTEGER DEFAULT 1,
                    device_id TEXT,
                    tenant_id TEXT DEFAULT 'local',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS app_settings (
                    setting_key TEXT PRIMARY KEY,
                    setting_value TEXT,
                    category TEXT,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS emppay (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uuid TEXT UNIQUE,
                    MONTHYEAR TEXT,
                    EMPNO TEXT,
                    SNAME TEXT,
                    Designation TEXT,
                    DGroup TEXT,
                    NoofDays TEXT,
                    LeaveDays TEXT,
                    WorkingDays TEXT,
                    PAY REAL,
                    GradePay REAL,
                    PHD TEXT,
                    MPHIL TEXT,
                    HATA REAL,
                    Allowance REAL,
                    DA REAL,
                    SPECIAL REAL,
                    INTERIM REAL,
                    GROSSPAY REAL,
                    EPF REAL,
                    ESI REAL,
                    ESIM REAL,
                    IT REAL,
                    PT REAL,
                    Advance REAL,
                    LIC REAL,
                    RECOVERY REAL,
                    OTHERS REAL,
                    TOTDED REAL,
                    NETSAL REAL,
                    AccountNo TEXT,
                    BankName TEXT,
                    IFSCCode TEXT,
                    OtherAccNo TEXT,
                    Remark TEXT,
                    InterimPay REAL,
                    DAper TEXT,
                    AbsGroup TEXT,
                    Bonus REAL,
                    is_synced INTEGER DEFAULT 0,
                    sync_version INTEGER DEFAULT 1,
                    device_id TEXT,
                    tenant_id TEXT DEFAULT 'local',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    deleted_at TEXT
                );

                CREATE TABLE IF NOT EXISTS payroll_reversals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    month_year TEXT NOT NULL,
                    reversed_by TEXT,
                    reason TEXT,
                    record_count INTEGER,
                    total_amount REAL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS audit_logs (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    username TEXT,
                    action_type TEXT,
                    module TEXT,
                    description TEXT,
                    old_value TEXT,
                    new_value TEXT,
                    ip_address TEXT,
                    device_id TEXT,
                    prev_hash TEXT,
                    hash TEXT,
                    tenant_id TEXT DEFAULT 'local',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS userlogs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    LogDate TEXT,
                    LogTime TEXT,
                    UserID TEXT,
                    UserName TEXT,
                    Module TEXT,
                    ActionType TEXT,
                    Description TEXT,
                    IPAddress TEXT,
                    Role TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                -- Sync Management
                CREATE TABLE IF NOT EXISTS sync_batches (
                    batch_id TEXT PRIMARY KEY,
                    tenant_id TEXT NOT NULL,
                    direction TEXT NOT NULL,
                    status TEXT NOT NULL,
                    record_count INTEGER DEFAULT 0,
                    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    completed_at TEXT,
                    error_message TEXT
                );

                -- Indexes
                CREATE INDEX IF NOT EXISTS idx_emppay_month ON emppay(MONTHYEAR);
                CREATE INDEX IF NOT EXISTS idx_empdet_uuid ON empdet(uuid);
                CREATE INDEX IF NOT EXISTS idx_empdet_synced ON empdet(is_synced);
                CREATE INDEX IF NOT EXISTS idx_attendance_date ON staffattendance(ADATE);
                CREATE INDEX IF NOT EXISTS idx_audit_hash ON audit_logs(hash);
                CREATE INDEX IF NOT EXISTS idx_users_id ON userdetails(UserID);
            `);

            // 2. Ensure tenant_id exists on legacy tables (Safety Guard)
            await this.ensureColumnsExist();

            // 3. Default Admin User (Forced reset for this debug version if needed)
            this.db.exec(`
                INSERT OR REPLACE INTO userdetails (UserID, Password, UserName, Role)
                VALUES ('admin', 'admin123', 'Administrator', 'admin');

                INSERT OR IGNORE INTO app_settings (setting_key, setting_value, category) VALUES 
                ('enable_attendance', 'true', 'FEATURE'),
                ('enable_pay_bill', 'true', 'FEATURE'),
                ('enable_bank_statement', 'true', 'FEATURE'),
                ('enable_abstract_1', 'true', 'FEATURE'),
                ('enable_abstract_2', 'true', 'FEATURE'),
                ('enable_pay_certificate', 'true', 'FEATURE'),
                ('enable_staff_report', 'true', 'FEATURE'),
                ('org_name', 'Enterprise Payroll', 'GENERAL'),
                ('print_font_family', 'Times New Roman', 'STYLE'),
                ('print_font_size', '10pt', 'STYLE');
            `);

            this.saveToDisk();

            // 4. Run Migration Engine
            try {
                const Migrator = new MigrationEngine(this);
                await Migrator.migrate();
            } catch (migError) {
                console.warn('[SQLiteManager] Migration warning (continuing):', migError.message);
            }

            console.log('✓ SQLite (Pure JS) Initialized with User Security.');
        } catch (error) {
            console.error('[SQLiteManager] Schema Init Error:', error);
            throw error;
        }
    }

    /**
     * Safety Check: Ensure tenant_id column exists on core tables
     */
    async ensureColumnsExist() {
        const tableConfigs = {
            'empdet': [
                { name: 'tenant_id', type: 'TEXT DEFAULT \'local\'' },
                { name: 'SLNO', type: 'TEXT' },
                { name: 'uuid', type: 'TEXT UNIQUE' },
                { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
                { name: 'sync_version', type: 'INTEGER DEFAULT 1' },
                { name: 'device_id', type: 'TEXT' },
                { name: 'deleted_at', type: 'TEXT' }
            ],
            'emppay': [
                { name: 'tenant_id', type: 'TEXT DEFAULT \'local\'' },
                { name: 'uuid', type: 'TEXT UNIQUE' },
                { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
                { name: 'sync_version', type: 'INTEGER DEFAULT 1' },
                { name: 'device_id', type: 'TEXT' },
                { name: 'deleted_at', type: 'TEXT' }
            ],
            'staffattendance': [
                { name: 'tenant_id', type: 'TEXT DEFAULT \'local\'' },
                { name: 'uuid', type: 'TEXT UNIQUE' },
                { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
                { name: 'sync_version', type: 'INTEGER DEFAULT 1' },
                { name: 'device_id', type: 'TEXT' },
                { name: 'CREATED_BY', type: 'TEXT' }
            ],
            'audit_logs': [
                { name: 'tenant_id', type: 'TEXT DEFAULT \'local\'' }
            ],
            'userlogs': [
                { name: 'created_at', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' }
            ]
        };

        for (const [table, columns] of Object.entries(tableConfigs)) {
            try {
                // Check if table exists first
                const tableCheck = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
                if (tableCheck.length === 0) continue;

                const info = this.db.exec(`PRAGMA table_info(${table})`);
                const existingCols = info[0].values.map(v => v[1]);

                for (const col of columns) {
                    if (!existingCols.includes(col.name)) {
                        console.log(`[SQLiteManager] Column '${col.name}' missing from ${table}, adding...`);
                        this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`);
                    }
                }
            } catch (e) {
                console.warn(`[SQLiteManager] Could not verify columns for ${table}:`, e.message);
            }
        }
    }

    /**
     * Promise-compatible Query (Read)
     */
    async query(sql, params = []) {
        await this.ensureInitialized();
        try {
            const cleanParams = params.map(p => {
                if (p instanceof Date) return p.toISOString();
                if (p === undefined) return null;
                return p;
            });

            // Handle array expansion for IN (?)
            let finalSql = this._mysqlToSqlite(sql);
            let finalParams = [];

            if (cleanParams.some(p => Array.isArray(p))) {
                const parts = finalSql.split('?');
                // Basic safety check: placeholders should match params count
                // Note: this simple split breaks if '?' is in string literals, but suffices for current usage
                if (parts.length - 1 === cleanParams.length) {
                    finalSql = parts[0];
                    for (let i = 0; i < cleanParams.length; i++) {
                        const param = cleanParams[i];
                        if (Array.isArray(param)) {
                            if (param.length === 0) {
                                // Handle empty array IN (?) -> IN (NULL) to avoid syntax error
                                finalSql += 'NULL' + parts[i + 1];
                            } else {
                                const placeholders = param.map(() => '?').join(',');
                                finalSql += placeholders + parts[i + 1];
                                finalParams.push(...param);
                            }
                        } else {
                            finalSql += '?' + parts[i + 1];
                            finalParams.push(param);
                        }
                    }
                } else {
                    // Fallback if mismatch (warn and use original)
                    console.warn('[SQLiteManager] logical warning: Params length mismatch with placeholders during expansion. Using original.');
                    finalParams = cleanParams;
                }
            } else {
                finalParams = cleanParams;
            }

            const results = this.db.exec(finalSql, finalParams);

            if (results.length === 0) return [[], []];

            // Convert sql.js output to array of objects
            const columns = results[0].columns;
            const rows = results[0].values.map(v => {
                const obj = {};
                columns.forEach((col, i) => obj[col] = v[i]);
                return obj;
            });

            return [rows, []];
        } catch (error) {
            console.error('[SQLiteManager] Query Error:', error);
            throw error;
        }
    }

    /**
     * Promise-compatible Execute (Write)
     */
    async execute(sql, params = []) {
        await this.ensureInitialized();
        try {
            const cleanParams = params.map(p => {
                if (p instanceof Date) return p.toISOString();
                if (p === undefined) return null;
                return p;
            });
            const cleanSql = this._mysqlToSqlite(sql);
            this.db.run(cleanSql, cleanParams);

            // Get last insert ID and changes
            const lastIdResult = this.db.exec('SELECT last_insert_rowid() as id');
            const changesResult = this.db.exec('SELECT changes() as changes');

            const insertId = lastIdResult[0].values[0][0];
            const affectedRows = changesResult[0].values[0][0];

            this.saveToDisk(); // Immediate persistence for small ERP DBs

            return { insertId, affectedRows };
        } catch (error) {
            console.error('[SQLiteManager] Execution Error:', error);
            throw error;
        }
    }

    /**
     * Simple Transaction Helper
     */
    async transaction(callback) {
        await this.ensureInitialized();
        try {
            this.db.exec('BEGIN TRANSACTION');
            const result = await callback();
            this.db.exec('COMMIT');
            this.saveToDisk();
            return result;
        } catch (error) {
            try {
                this.db.exec('ROLLBACK');
            } catch (rbError) {
                // Ignore rollback errors if transaction wasn't active
            }
            throw error;
        }
    }

    async getConnection() {
        return {
            query: async (sql, params) => this.query(sql, params),
            execute: async (sql, params) => this.execute(sql, params),
            beginTransaction: async () => this.db.exec('BEGIN TRANSACTION'),
            commit: async () => { this.db.exec('COMMIT'); this.saveToDisk(); },
            rollback: async () => {
                try { this.db.exec('ROLLBACK'); } catch (e) { }
            },
            release: () => { }
        };
    }

    _mysqlToSqlite(sql) {
        return sql
            .replace(/FOR UPDATE/gi, '')
            .replace(/CURRENT_TIMESTAMP/gi, "(datetime('now', 'localtime'))")
            .replace(/CAST\((.*?)\s+AS\s+DECIMAL\(\d+,\s*\d+\)\)/gi, 'CAST($1 AS NUMERIC)');
    }

    // Compatibility shims
    getRawInstance() {
        return this.db;
    }

    prepare(sql) {
        const self = this;
        return {
            get: async (params = []) => {
                const [rows] = await self.query(sql, params);
                return rows ? rows[0] : null;
            },
            run: async (params = []) => {
                return self.execute(sql, params);
            }
        };
    }

    async exec(sql) {
        await this.ensureInitialized();
        this.db.exec(sql);
        this.saveToDisk();
    }
}

export default new SQLiteManager();

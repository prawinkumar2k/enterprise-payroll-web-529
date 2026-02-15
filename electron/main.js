import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- UPDATE CONFIG ---
autoUpdater.autoDownload = false;
autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version of Enterprise Payroll is available. Do you want to download it now?',
        buttons: ['Yes', 'No']
    }).then(result => {
        if (result.response === 0) autoUpdater.downloadUpdate();
    });
});
autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        title: 'Update Ready',
        message: 'Update downloaded. It will be installed on restart.'
    });
});

// --- PRODUCTION CONFIG ---
const APP_VERSION = '1.0.0';
const userDataPath = app.getPath('userData');
const secretsPath = path.join(userDataPath, 'app-secrets.json');
const stateFilePath = path.join(userDataPath, 'app-state.json');
const metricsFilePath = path.join(userDataPath, 'metrics.json');
const crashLogPath = path.join(userDataPath, 'crash-report.log');

// --- SECURE SECRET INJECTION ---
const getAppSecret = () => {
    try {
        if (fs.existsSync(secretsPath)) {
            const data = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
            return data.JWT_SECRET;
        }
    } catch (e) { }

    // Generate persistent secure secret on first run
    const newSecret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(secretsPath, JSON.stringify({
        JWT_SECRET: newSecret,
        generatedAt: new Date().toISOString(),
        version: APP_VERSION
    }, null, 2));
    return newSecret;
};

const internalJwtSecret = getAppSecret();

// --- STATE & METRICS ---
const loadMetrics = () => {
    try {
        if (fs.existsSync(metricsFilePath)) return JSON.parse(fs.readFileSync(metricsFilePath, 'utf8'));
    } catch (e) { }
    return {
        total_app_launches: 0,
        crash_count: 0,
        startup_history: [],
        memory_peak_mb: 0,
        last_run_timestamp: Date.now()
    };
};

const saveMetrics = (m) => {
    m.last_run_timestamp = Date.now();
    try { fs.writeFileSync(metricsFilePath, JSON.stringify(m, null, 2)); } catch (e) { }
};

const detectTimeRollback = (metrics) => {
    const now = Date.now();
    if (metrics.last_run_timestamp && now < metrics.last_run_timestamp) {
        console.error('[Security] Time rollback detected! System clocks may have been tampered.');
        return true;
    }
    return false;
};

const logCrash = (error, type = 'CRASH') => {
    const timestamp = new Date().toISOString();
    const report = JSON.stringify({ timestamp, type, error: error.stack || error }) + '\n';
    fs.appendFileSync(crashLogPath, report);

    const m = loadMetrics();
    m.crash_count++;
    m.last_crash_timestamp = timestamp;
    saveMetrics(m);
};

const checkCrashLoop = () => {
    const state = JSON.parse(fs.existsSync(stateFilePath) ? fs.readFileSync(stateFilePath, 'utf8') : '{"crashHistory":[], "isSafeMode":false}');
    const now = Date.now();
    state.crashHistory = state.crashHistory.filter(t => now - t < 300000); // 5 min window
    const inLoop = state.crashHistory.length >= 3;
    state.isSafeMode = inLoop;
    fs.writeFileSync(stateFilePath, JSON.stringify(state));
    return inLoop;
};

const recordCrashInstance = () => {
    const state = JSON.parse(fs.existsSync(stateFilePath) ? fs.readFileSync(stateFilePath, 'utf8') : '{"crashHistory":[], "isSafeMode":false}');
    state.crashHistory.push(Date.now());
    fs.writeFileSync(stateFilePath, JSON.stringify(state));
};

process.on('uncaughtException', (err) => {
    logCrash(err, 'UNCAUGHT_EXCEPTION');
    recordCrashInstance();
    app.quit();
});
process.on('unhandledRejection', (reason) => logCrash(reason, 'UNHANDLED_REJECTION'));

// --- CORE LIFECYCLE ---
let mainWindow;
let serverProcess;
let isSafeMode = false;

// --- LOGGING REDIRECTION ---
const debugLogPath = path.join(userDataPath, 'debug-console.log');
const logStream = fs.createWriteStream(debugLogPath, { flags: 'a' });

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = (chunk, encoding, callback) => {
    logStream.write(`[STDOUT] ${chunk}`);
    return originalStdoutWrite(chunk, encoding, callback);
};

process.stderr.write = (chunk, encoding, callback) => {
    logStream.write(`[STDERR] ${chunk}`);
    return originalStderrWrite(chunk, encoding, callback);
};

console.log(`[Electron] Logging redirected to: ${debugLogPath}`);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280, height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: true // TEMPORARY: Enabled for production debugging
        },
        icon: path.join(__dirname, '../client/public/favicon.ico'),
        title: `Enterprise Payroll System v${APP_VERSION} ${isSafeMode ? '[RECOVERY MODE]' : ''}`,
    });

    const indexPath = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
    } else {
        mainWindow.loadURL('http://127.0.0.1:5005');
    }

    // Maximize on start for best UX
    mainWindow.maximize();

    // Always open devtools for this debug build
    // mainWindow.webContents.openDevTools();

    // Register shortcuts for developer mode
    mainWindow.webContents.on('before-input-event', (event, input) => {
        // Ctrl+Shift+I or F12 for DevTools
        if ((input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
        // Ctrl+R or F5 for Reload
        if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
            mainWindow.webContents.reload();
            event.preventDefault();
        }
    });

    // Remove setMenu(null) to allow shortcuts and standard debugging
    // mainWindow.setMenu(null);
}

// function startServer() {
//     serverProcess = spawn('node', [path.join(__dirname, '../server/index.js')], {
//         cwd: path.join(__dirname, '../server'),
//         env: {
//             ...process.env,
//             NODE_ENV: 'production',
//             PORT: '5005', HOST: '127.0.0.1',
//             DB_HOST: 'localhost', DB_PORT: '3306',
//             DB_USER: 'root', DB_PASSWORD: 'Prawin@2k4', DB_NAME: 'billing_db',
//             JWT_SECRET: internalJwtSecret,
//             IS_DESKTOP: 'true',
//             SAFE_MODE: isSafeMode ? 'true' : 'false',
//             DATA_PATH: userDataPath
//         }
//     });
// 
//     serverProcess.stdout.on('data', (d) => console.log(`[BE]: ${d}`));
//     serverProcess.stderr.on('data', (d) => console.error(`[BE ERROR]: ${d}`));
// }

async function startServer() {
    console.log('[Electron] Starting internal backend server...');

    // 1. Set environment variables explicitly for the server process
    // We are running in the Main process, so modifying process.env directly works for subsequent imports.

    // Core Configuration
    process.env.NODE_ENV = 'production';
    process.env.PORT = '5005';
    process.env.HOST = '127.0.0.1';

    // Critical: Data Path for SQLite dev/prod separation
    process.env.DATA_PATH = userDataPath; // Defined earlier as app.getPath('userData')

    // Desktop Mode Flag
    process.env.IS_DESKTOP = 'true';
    process.env.SAFE_MODE = isSafeMode ? 'true' : 'false';

    // Security & Secrets
    process.env.JWT_SECRET = internalJwtSecret; // Defined earlier

    // Database Credentials (Defaults for desktop mode, mostly unused if SQLite only)
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'password'; // Placeholder
    process.env.DB_NAME = 'billing_db';

    // 3. Set Frontend Path explicitly for the server to find
    // __dirname is inside 'electron' folder. Go up one level to root, then 'client/dist'
    process.env.FRONTEND_PATH = path.join(__dirname, '../client/dist');
    console.log('[Electron] Setting FRONTEND_PATH:', process.env.FRONTEND_PATH);

    // 2. Dynamically import the server entry point
    try {
        // This is equivalent to running `node server/index.js` but inside the Electron process.
        // Because imports are cached, this will only run once even if called multiple times (though we shouldn't).
        await import('../server/index.js');
        console.log('[Electron] Internal server loaded successfully.');
    } catch (err) {
        console.error('[Electron] Failed to start internal server:', err);
        dialog.showErrorBox('Fatal Error', `Failed to start backend server.\n\nError: ${err.message}\n\nStack: ${err.stack}`);
        app.quit();
    }
}

const waitForServer = async (url) => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 50 * 500ms = 25 seconds

        const tryConnect = () => {
            attempts++;
            const req = http.get(url, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    if (attempts >= maxAttempts) reject(new Error('Server returned non-200 status'));
                    else setTimeout(tryConnect, 500);
                }
            });

            req.on('error', (err) => {
                if (attempts >= maxAttempts) reject(err);
                else setTimeout(tryConnect, 500);
            });
            req.end();
        };

        tryConnect();
    });
};

app.on('ready', () => {
    isSafeMode = checkCrashLoop();

    const m = loadMetrics();

    // ANTI-TAMPER: Detection rollbacks
    if (detectTimeRollback(m)) {
        dialog.showErrorBox('Security Alert', 'Time rollback detected. Please ensure your system clock is correct before using the software.');
        app.quit();
        return;
    }

    m.total_app_launches++;
    saveMetrics(m);

    if (process.env.NODE_ENV === 'production') {
        autoUpdater.checkForUpdatesAndNotify();
    }

    startServer();

    waitForServer('http://127.0.0.1:5005/api/health')
        .then(() => {
            createWindow();
        })
        .catch((err) => {
            logCrash(err, 'SERVER_INIT_TIMEOUT');
            // Check if server process is still running, maybe show log
            dialog.showErrorBox('Server Error', 'Failed to initialize backend server. Check logs.');
            app.quit();
        });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => { if (serverProcess) serverProcess.kill(); });

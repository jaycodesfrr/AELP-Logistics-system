const { app, BrowserWindow, Tray, Menu, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;
let tray;

function startBackendServer() {
    return new Promise((resolve, reject) => {
        console.log('Starting embedded AELP Station Server...');
        const serverPath = path.join(__dirname, 'server.js');
        
        serverProcess = spawn('node', [serverPath], {
            cwd: __dirname,
            env: { ...process.env, PORT: '3000' }
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`[Server]: ${data}`);
            if (data.toString().includes('AELP Station Server is LIVE')) {
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`[Server Error]: ${data}`);
        });

        // Fallback resolve after 2s
        setTimeout(resolve, 2500);
    });
}

async function createWindow() {
    await startBackendServer();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 1024,
        minHeight: 700,
        title: 'Antarctica Expedition & Logistics Platform (AELP) - Tactical Station Hub',
        icon: path.join(__dirname, 'public', 'favicon.ico'),
        backgroundColor: '#070c14',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Hide default menu bar for tactical fullscreen look
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL('http://localhost:3000');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        console.log('Terminating embedded backend server...');
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

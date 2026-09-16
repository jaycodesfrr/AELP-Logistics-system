// Antarctica Expedition & Logistics Platform (AELP) - Native Desktop App Launcher
const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

console.log('===================================================================');
console.log(' Launching AELP Tactical Station Desktop Application...');
console.log('===================================================================');

// Step 1: Ensure server is running
function checkServerReady(url, maxAttempts = 15) {
    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            http.get(url, (res) => {
                if (res.statusCode === 200) {
                    clearInterval(interval);
                    resolve(true);
                }
            }).on('error', () => {
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    resolve(false);
                }
            });
        }, 300);
    });
}

async function launch() {
    const isAlreadyRunning = await checkServerReady('http://localhost:3000/api/stats', 2);
    if (!isAlreadyRunning) {
        // Start Java Spring Boot backend server
        const jarPath = path.join(__dirname, 'target', 'antarctica-logistics-platform-1.0.0.jar');
        const javaExe = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
        const serverProcess = spawn(javaExe, ['-jar', jarPath], {
            cwd: __dirname,
            stdio: 'inherit'
        });
        await checkServerReady('http://localhost:3000/api/stats', 20);
    } else {
        console.log('[INFO] Backend Station Server is already running on http://localhost:3000.');
    }

    // Launch standalone Native Desktop Window using Edge or Chrome App Mode
    const appUrl = 'http://localhost:3000';
    const edgeCmd = `start msedge --app=${appUrl} --window-size=1280,850 --name="AELP Station Hub"`;
    const chromeCmd = `start chrome --app=${appUrl} --window-size=1280,850`;

    exec(edgeCmd, (err) => {
        if (err) {
            exec(chromeCmd, (err2) => {
                if (err2) {
                    console.log(`Application available in browser at: ${appUrl}`);
                }
            });
        } else {
            console.log('AELP Native Desktop Application Window opened successfully.');
        }
    });
}

launch();

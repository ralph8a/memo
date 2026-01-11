#!/usr/bin/env node
// Kill any process listening on a given port (default 3000) to free webpack-dev-server
const { execSync } = require('child_process');
const port = process.env.PORT || 3000;

function killOnWindows(port) {
    try {
        const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
        const lines = output.split(/\r?\n/).filter(Boolean);
        const pids = new Set(
            lines
                .map(line => line.trim().split(/\s+/).pop())
                .filter(pid => pid && pid !== '0')
        );
        pids.forEach(pid => {
            try {
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                console.log(`Killed process ${pid} on port ${port}`);
            } catch (err) {
                console.warn(`Could not kill process ${pid}: ${err.message}`);
            }
        });
    } catch (err) {
        // findstr returns 1 when no matches; ignore
        if (err.status !== 1) {
            console.warn(`Port scan failed: ${err.message}`);
        }
    }
}

function killOnUnix(port) {
    try {
        execSync(`lsof -i :${port} -sTCP:LISTEN -t | xargs kill -9`, { stdio: 'ignore' });
        console.log(`Killed listeners on port ${port}`);
    } catch (err) {
        // lsof returns non-zero when no matches; ignore
        if (err.status !== 1) {
            console.warn(`Port scan failed: ${err.message}`);
        }
    }
}

if (process.platform === 'win32') {
    killOnWindows(port);
} else {
    killOnUnix(port);
}

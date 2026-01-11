#!/usr/bin/env node
// Start webpack-dev-server picking an available port (defaults 3000, fallback up to 3010)
const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const MAX_PORT = 3010;
const basePort = Number(process.env.PORT) || 3000;

function checkPort(port) {
    return new Promise(resolve => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => resolve(false));
        server.listen({ port, host: '0.0.0.0' }, () => {
            const { port: boundPort } = server.address();
            server.close(() => resolve(boundPort));
        });
    });
}

(async () => {
    let chosen = null;
    for (let p = basePort; p <= MAX_PORT; p++) {
        const free = await checkPort(p);
        if (free) {
            chosen = free;
            break;
        }
    }

    if (!chosen) {
        console.error(`No free port found between ${basePort} and ${MAX_PORT}`);
        process.exit(1);
    }

    process.env.PORT = chosen;
    console.log(`Starting dev server on port ${chosen}...`);

    const child = spawn('npx', ['webpack', 'serve', '--config', path.join(__dirname, '..', 'webpack.config.js'), '--port', String(chosen)], {
        stdio: 'inherit',
        shell: true,
    });

    child.on('exit', (code) => {
        process.exit(code ?? 0);
    });
})();

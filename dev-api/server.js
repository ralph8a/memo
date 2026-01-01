const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.API_PORT || 4000;

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        return [];
    }
}

const DATA_DIR = path.join(__dirname, 'data');
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

const agents = readJson(AGENTS_FILE);
const clients = readJson(CLIENTS_FILE);

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const parts = parsed.pathname.split('/').filter(Boolean);

    // Allow CORS for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && parts[0] === 'api') {
        // /api/agents
        if (parts[1] === 'agents') {
            if (parts[2]) {
                const id = parts[2];
                const agent = agents.find(a => String(a.id) === id);
                if (agent) {
                    return res.end(JSON.stringify(agent));
                }
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Agent not found' }));
            }
            return res.end(JSON.stringify(agents));
        }

        // /api/clients
        if (parts[1] === 'clients') {
            if (parts[2]) {
                const id = parts[2];
                const client = clients.find(c => String(c.id) === id);
                if (client) {
                    return res.end(JSON.stringify(client));
                }
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Client not found' }));
            }
            return res.end(JSON.stringify(clients));
        }
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`Dev API listening on http://localhost:${PORT}`);
});

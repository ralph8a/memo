const http = require('http');

const postData = JSON.stringify({
    email: 'admin@ksinsurancee.com',
    password: 'Admin123!'
});

const options = {
    hostname: 'ksinsurancee.com',
    port: 80,
    path: '/backend/index.php?action=login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`\n=== DIRECT LOGIN TEST ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`\nBody:`);
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});

req.write(postData);
req.end();

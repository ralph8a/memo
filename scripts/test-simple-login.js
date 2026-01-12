const http = require('http');

http.get('http://ksinsurancee.com/backend/simple-login-test.php', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('\n=== SIMPLE LOGIN TEST ===\n');
        // Parse multiple JSON objects
        const lines = data.split('\n').filter(line => line.trim());
        lines.forEach((line, i) => {
            try {
                const json = JSON.parse(line);
                console.log(`Step ${i + 1}:`, JSON.stringify(json, null, 2));
            } catch (e) {
                console.log('Raw:', line);
            }
        });
    });
}).on('error', (e) => {
    console.error('Error:', e.message);
});

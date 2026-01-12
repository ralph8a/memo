const http = require('http');

http.get('http://ksinsurancee.com/backend/list-users.php', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('\n=== RAW RESPONSE ===');
        console.log(data);
        console.log('\n=== PARSED ===');
        try {
            const json = JSON.parse(data);
            console.log(`Total Users: ${json.total_users}\n`);
            if (json.users) {
                json.users.forEach(u => {
                    console.log(`ID: ${u.id} | Type: ${u.user_type.padEnd(8)} | Email: ${u.email.padEnd(30)} | Name: ${u.name}`);
                });
            } else if (json.error) {
                console.log('ERROR:', json.message);
            }
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    });
}).on('error', (e) => {
    console.error('Error:', e.message);
});

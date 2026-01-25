const https = require('https');

console.log('🔍 Testing Backend Diagnostic...\n');

// Test diagnostic endpoint (usar HTTPS para evitar 301)
const url = new URL('https://ksinsurancee.com/backend/diagnostic.php');

const agent = new https.Agent({ rejectUnauthorized: false });

const req = https.request(url, {
    method: 'GET',
    agent,
    headers: {
        'Accept': 'application/json'
    }
}, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    console.log('\n--- Response Body ---\n');

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(body);

        if (res.statusCode === 200) {
            try {
                const data = JSON.parse(body);
                console.log('\n--- Parsed Data ---\n');
                console.log('PHP Version:', data.php_version);
                console.log('PDO Available:', data.pdo_available ? '✅' : '❌');
                console.log('PDO MySQL:', data.pdo_mysql_available ? '✅' : '❌');
                console.log('Config Loaded:', data.config_loaded ? '✅' : '❌');
                console.log('DB Connection:', data.db_connection ? '✅' : '❌');

                if (data.config_loaded) {
                    console.log('\nDatabase Config:');
                    console.log('  Host:', data.db_host);
                    console.log('  Name:', data.db_name);
                    console.log('  User:', data.db_user);
                }

                if (data.db_connection) {
                    console.log('\n✅ DATABASE CONNECTED SUCCESSFULLY!');
                    console.log('\nTables:');
                    for (const [table, exists] of Object.entries(data.tables_exist)) {
                        console.log(`  ${exists ? '✅' : '❌'} ${table}`);
                    }
                    console.log('\nUsers in database:', data.user_count);
                    console.log('Admin exists:', data.admin_exists ? '✅' : '❌');
                } else {
                    console.log('\n❌ DATABASE CONNECTION FAILED');
                    if (data.db_error) {
                        console.log('\nError:', data.db_error);
                        console.log('Error Code:', data.db_error_code);
                    }
                }

                if (data.error) {
                    console.log('\n❌ General Error:', data.error);
                }
            } catch (e) {
                console.log('\n❌ Failed to parse JSON:', e.message);
            }
        } else {
            console.log('\n❌ HTTP Error:', res.statusCode);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
});

req.end();

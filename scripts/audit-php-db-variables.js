#!/usr/bin/env node
/**
 * PHP Database Variables Audit Report
 * Auditoría de inconsistencias en variables de BD en archivos PHP
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = 'c:/react/backend';

// Columnas esperadas por tabla (según database-schema.sql)
const EXPECTED_COLUMNS = {
    users: {
        id: 'INT',
        email: 'VARCHAR',
        password_hash: 'VARCHAR',
        user_type: 'ENUM',
        first_name: 'VARCHAR',
        last_name: 'VARCHAR',
        phone: 'VARCHAR',
        region: 'VARCHAR',
        status: 'ENUM',
        last_login: 'TIMESTAMP',
        created_at: 'TIMESTAMP'
    },
    policies: {
        id: 'INT',
        policy_number: 'VARCHAR',
        client_id: 'INT',
        agent_id: 'INT',
        policy_type: 'ENUM',
        status: 'ENUM',
        premium_amount: 'DECIMAL',
        coverage_amount: 'DECIMAL',
        start_date: 'DATE',
        end_date: 'DATE',
        renewal_date: 'DATE',
        created_at: 'TIMESTAMP'
    },
    policy_comments: {
        comment_id: 'INT',
        policy_id: 'INT',
        author_type: 'ENUM',
        author_id: 'INT',
        comment_text: 'TEXT',
        created_at: 'TIMESTAMP',
        is_read: 'BOOLEAN'
    },
    direct_messages: {
        message_id: 'INT',
        thread_id: 'INT',
        sender_id: 'INT',
        message_text: 'TEXT',
        created_at: 'TIMESTAMP'
    },
    payments: {
        id: 'INT',
        policy_id: 'INT',
        client_id: 'INT',
        amount: 'DECIMAL',
        payment_date: 'DATE',
        status: 'ENUM'
    }
};

// Patrones de uso incorrecto
const INCORRECT_PATTERNS = [
    { pattern: /\$\w+\['name'\]/g, correct: 'first_name + last_name', table: 'users' },
    { pattern: /\$\w+\['user_id'\](?!.*users)/g, correct: 'id', table: 'users' },
    { pattern: /\$\w+\['client_name'\]/g, correct: 'first_name + last_name', table: 'policies' },
    { pattern: /policy_id\s*=\s*\$\w+\['id'\]/g, correct: 'use policy_id directly', table: 'policies' },
    { pattern: /created_by/g, correct: 'author_id', table: 'policy_comments' },
    { pattern: /is_read_by_client|is_read_by_agent/g, correct: 'is_read', table: 'policy_comments' }
];

function scanFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        const issues = [];

        // Buscar patrones incorrectos
        for (const { pattern, correct, table } of INCORRECT_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
                issues.push({
                    file: fileName,
                    line: content.split(pattern)[0].split('\n').length,
                    issue: `Usar '${correct}' para tabla '${table}'`,
                    found: matches[0],
                    severity: 'HIGH'
                });
            }
        }

        // Buscar variables de tabla inconsistentes
        const tableVarPattern = /(?:SELECT|INSERT|UPDATE|FROM|JOIN)\s+\w+\s+(?:as\s+)?(\w+)/gi;
        const matches = content.matchAll(tableVarPattern);

        for (const match of matches) {
            const alias = match[1].toLowerCase();
            if (alias.length === 1) {
                const context = content.substring(Math.max(0, match.index - 50), match.index + 100);
                if (context.includes('SELECT') && !context.includes('AS ' + match[1])) {
                    // Potential issue with alias naming
                }
            }
        }

        return issues;
    } catch (error) {
        return [];
    }
}

function auditBackend() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║ 🔍 PHP DATABASE VARIABLES AUDIT REPORT             ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    const phpFiles = fs.readdirSync(BACKEND_PATH)
        .filter(f => f.endsWith('.php') && !f.startsWith('test-'))
        .filter(f => f !== 'index.php'); // Excluir endpoints conocidos

    let totalIssues = 0;
    const allIssues = [];

    for (const file of phpFiles) {
        const filePath = path.join(BACKEND_PATH, file);
        const issues = scanFile(filePath);

        if (issues.length > 0) {
            totalIssues += issues.length;
            allIssues.push(...issues.map(i => ({ ...i, file })));

            console.log(`⚠️  ${file}`);
            issues.forEach(issue => {
                console.log(`   └─ ${issue.issue}`);
                console.log(`      Found: ${issue.found}`);
            });
            console.log();
        }
    }

    if (totalIssues === 0) {
        console.log('✅ No inconsistencies found in backend PHP files\n');
    } else {
        console.log(`\n📊 SUMMARY: ${totalIssues} potential issues found\n`);
        console.log('DETAILED ISSUES:\n');
        allIssues.forEach((issue, idx) => {
            console.log(`${idx + 1}. [${issue.severity}] ${issue.file}`);
            console.log(`   Issue: ${issue.issue}`);
            console.log(`   Line ~${issue.line}`);
            console.log();
        });
    }

    // Mostrar tabla de variables esperadas vs encontradas
    console.log('\n📋 EXPECTED COLUMN MAPPINGS BY TABLE:\n');
    for (const [table, columns] of Object.entries(EXPECTED_COLUMNS)) {
        console.log(`${table}:`);
        Object.keys(columns).forEach(col => {
            console.log(`  • ${col}`);
        });
        console.log();
    }
}

auditBackend();

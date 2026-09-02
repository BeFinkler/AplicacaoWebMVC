require('dotenv').config({ quiet: true });

const fs = require('node:fs/promises');
const path = require('node:path');
const { closePool, getPool } = require('../config/db');

async function runMigrations() {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    const statements = schema
        .split(/;\s*(?:\r?\n|$)/)
        .map((statement) => statement.trim())
        .filter(Boolean);
    const connection = await getPool().getConnection();

    try {
        for (const statement of statements) await connection.query(statement);
    } finally {
        connection.release();
    }
}

if (require.main === module) {
    runMigrations()
        .then(() => console.log('Estrutura do banco atualizada com sucesso.'))
        .catch((error) => {
            console.error(`Erro ao atualizar o banco: ${error.message}`);
            process.exitCode = 1;
        })
        .finally(closePool);
}

module.exports = { runMigrations };

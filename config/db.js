const mysql = require('mysql2/promise');

let pool;

function databaseConfig() {
    const port = Number(process.env.DB_PORT || 3306);
    const sslEnabled = process.env.DB_SSL !== 'false';

    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
        throw new Error('Defina DB_HOST, DB_USER e DB_NAME nas variáveis de ambiente.');
    }
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error('DB_PORT deve ser uma porta válida.');
    }

    let ssl;
    if (sslEnabled) {
        if (!process.env.DB_SSL_CA_BASE64) {
            throw new Error('Defina DB_SSL_CA_BASE64 para validar a conexão TLS com o banco.');
        }
        ssl = {
            ca: Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf8'),
            rejectUnauthorized: true
        };
    }

    return {
        host: process.env.DB_HOST,
        port,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        timezone: 'Z',
        ssl
    };
}

function getPool() {
    if (!pool) pool = mysql.createPool(databaseConfig());
    return pool;
}

async function checkDatabaseConnection() {
    const [rows] = await getPool().execute('SELECT 1 AS connected');
    return rows[0]?.connected === 1;
}

async function closePool() {
    if (!pool) return;
    await pool.end();
    pool = undefined;
}

module.exports = { checkDatabaseConnection, closePool, databaseConfig, getPool };

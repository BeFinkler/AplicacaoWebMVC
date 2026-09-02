const test = require('node:test');
const assert = require('node:assert/strict');
const { databaseConfig } = require('../config/db');

function withEnvironment(values, callback) {
    const previous = {};
    for (const [key, value] of Object.entries(values)) {
        previous[key] = process.env[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
    try {
        callback();
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
}

test('configuração local permite desativar TLS explicitamente', () => {
    withEnvironment({
        DB_HOST: 'localhost', DB_PORT: '3306', DB_USER: 'eventhub',
        DB_PASSWORD: 'senha', DB_NAME: 'eventhub', DB_SSL: 'false', DB_SSL_CA_BASE64: undefined
    }, () => {
        const config = databaseConfig();
        assert.equal(config.host, 'localhost');
        assert.equal(config.ssl, undefined);
        assert.equal(config.timezone, 'Z');
    });
});

test('configuração de produção decodifica o certificado TLS', () => {
    const certificate = '-----BEGIN CERTIFICATE-----\nTESTE\n-----END CERTIFICATE-----';
    withEnvironment({
        DB_HOST: 'mysql.aivencloud.com', DB_PORT: '12345', DB_USER: 'avnadmin',
        DB_PASSWORD: 'senha', DB_NAME: 'eventhub', DB_SSL: 'true',
        DB_SSL_CA_BASE64: Buffer.from(certificate).toString('base64')
    }, () => {
        const config = databaseConfig();
        assert.equal(config.ssl.ca, certificate);
        assert.equal(config.ssl.rejectUnauthorized, true);
    });
});

test('TLS ativo exige certificado da autoridade certificadora', () => {
    withEnvironment({
        DB_HOST: 'mysql.aivencloud.com', DB_PORT: '12345', DB_USER: 'avnadmin',
        DB_PASSWORD: 'senha', DB_NAME: 'eventhub', DB_SSL: 'true', DB_SSL_CA_BASE64: undefined
    }, () => {
        assert.throws(() => databaseConfig(), /DB_SSL_CA_BASE64/);
    });
});

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const User = require('../models/authModel');
const { createApp, validateEnvironment } = require('../server');

test('senha é derivada com scrypt e pode ser validada', async () => {
    const user = new User({
        name: 'Teste',
        email: 'teste@example.com',
        password: await User.hashPassword('senha-segura')
    });

    assert.match(user.password, /^scrypt:[a-f0-9]+:[a-f0-9]+$/);
    assert.equal(await user.comparePassword('senha-segura'), true);
    assert.equal(await user.comparePassword('senha-incorreta'), false);
});

test('rota protegida redireciona visitante para login', async () => {
    const server = http.createServer(createApp());
    await new Promise((resolve) => server.listen(0, resolve));

    try {
        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}/produtos`, { redirect: 'manual' });
        assert.equal(response.status, 302);
        assert.equal(response.headers.get('location'), '/login');
    } finally {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
});

test('ambiente exige MongoDB e chave JWT forte', () => {
    const previous = { MONGO_URI: process.env.MONGO_URI, JWT_SECRET: process.env.JWT_SECRET };
    try {
        delete process.env.MONGO_URI;
        delete process.env.JWT_SECRET;
        assert.throws(validateEnvironment, /MONGO_URI/);

        process.env.MONGO_URI = 'mongodb://localhost:27017/test';
        assert.throws(validateEnvironment, /JWT_SECRET/);
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

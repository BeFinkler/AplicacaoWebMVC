process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'segredo-de-testes-com-mais-de-trinta-e-dois-caracteres';
process.env.SESSION_COOKIE_NAME = 'eventhub.test';

const test = require('node:test');
const assert = require('node:assert/strict');
const session = require('express-session');
const request = require('supertest');
const { createApp } = require('../server');

function memorySession() {
    return session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { httpOnly: true, sameSite: 'lax' }
    });
}

function appWithSession(sessionMiddleware = memorySession()) {
    return createApp({ sessionMiddleware, healthCheck: async () => true });
}

function csrfFrom(html) {
    return html.match(/name="_csrf" value="([a-f0-9]+)"/)?.[1];
}

test('health check confirma aplicação e banco disponíveis', async () => {
    const response = await request(appWithSession()).get('/health');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok', database: 'connected' });
});

test('health check retorna 503 quando o banco está indisponível', async () => {
    const app = createApp({
        sessionMiddleware: memorySession(),
        healthCheck: async () => { throw new Error('indisponível'); }
    });
    const response = await request(app).get('/health');
    assert.equal(response.status, 503);
    assert.deepEqual(response.body, { status: 'error', database: 'unavailable' });
});

test('formulário de login cria token CSRF e cookie HTTP-only', async () => {
    const response = await request(appWithSession()).get('/login');
    assert.equal(response.status, 200);
    assert.ok(csrfFrom(response.text));
    assert.match(response.headers['set-cookie'][0], /HttpOnly/i);
    assert.match(response.headers['set-cookie'][0], /SameSite=Lax/i);
});

test('requisição de alteração sem CSRF é rejeitada', async () => {
    const response = await request(appWithSession()).post('/login').send('email=x&password=y');
    assert.equal(response.status, 403);
    assert.match(response.text, /sessão do formulário expirou/i);
});

test('login inválido é barrado antes de consultar o banco', async () => {
    const agent = request.agent(appWithSession());
    const page = await agent.get('/login');
    const response = await agent
        .post('/login')
        .type('form')
        .send({ _csrf: csrfFrom(page.text), email: 'email-invalido', password: '' });
    assert.equal(response.status, 422);
    assert.match(response.text, /e-mail válido/i);
});

test('cadastro inválido apresenta mensagens de validação', async () => {
    const agent = request.agent(appWithSession());
    const page = await agent.get('/cadastro');
    const response = await agent
        .post('/cadastro')
        .type('form')
        .send({
            _csrf: csrfFrom(page.text), name: 'A', email: 'invalido',
            password: '123', passwordConfirmation: '456'
        });
    assert.equal(response.status, 422);
    assert.match(response.text, /nome deve ter/i);
    assert.match(response.text, /confirmação de senha/i);
});

test('área privada redireciona visitante para login', async () => {
    const response = await request(appWithSession()).get('/organizador');
    assert.equal(response.status, 302);
    assert.equal(response.headers.location, '/login');
});

test('participante não acessa a área do organizador', async () => {
    const participantSession = (req, res, next) => {
        req.session = {
            csrfToken: 'a'.repeat(64),
            user: { id: 10, name: 'Participante', email: 'p@example.com', role: 'participante' }
        };
        next();
    };
    const response = await request(appWithSession(participantSession)).get('/organizador');
    assert.equal(response.status, 403);
    assert.match(response.text, /não possui permissão/i);
});

test('organizador não acessa a área exclusiva do participante', async () => {
    const organizerSession = (req, res, next) => {
        req.session = {
            csrfToken: 'b'.repeat(64),
            user: { id: 20, name: 'Organizador', email: 'o@example.com', role: 'organizador' }
        };
        next();
    };
    const response = await request(appWithSession(organizerSession)).get('/minhas-inscricoes');
    assert.equal(response.status, 403);
});

test('rota desconhecida retorna página 404 sem stack trace', async () => {
    const response = await request(appWithSession()).get('/pagina-inexistente');
    assert.equal(response.status, 404);
    assert.match(response.text, /Não encontramos esta página/i);
    assert.doesNotMatch(response.text, /at Function|node_modules/);
});

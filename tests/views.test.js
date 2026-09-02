const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const ejs = require('ejs');
const { formatDateTime, toInputDateTime } = require('../middlewares/locals');

const viewsDirectory = path.join(__dirname, '..', 'views');
const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
const futureEnd = new Date(Date.now() + 26 * 60 * 60 * 1000);
const sampleEvent = {
    id: 1,
    titulo: 'Semana de Tecnologia',
    descricao: 'Palestras e oficinas para compartilhar conhecimentos sobre desenvolvimento web.',
    local: 'Auditório principal',
    inicio: futureStart,
    fim: futureEnd,
    capacidade: 100,
    inscritos: 25,
    organizador_id: 2,
    organizador_nome: 'Organização Acadêmica'
};

const baseLocals = {
    title: 'Teste',
    currentPath: '/',
    user: null,
    flash: null,
    csrfToken: 'a'.repeat(64),
    formatDateTime,
    toInputDateTime
};

const cases = [
    ['home.ejs', { events: [sampleEvent] }],
    ['about.ejs', {}],
    ['auth/login.ejs', { errors: [], formData: {} }],
    ['auth/register.ejs', { errors: [], formData: {} }],
    ['events/index.ejs', { events: [sampleEvent] }],
    ['events/show.ejs', { event: sampleEvent, registered: false, availableSpots: 75 }],
    ['organizer/dashboard.ejs', { user: { name: 'Org', role: 'organizador' }, events: [sampleEvent] }],
    ['organizer/form.ejs', {
        user: { name: 'Org', role: 'organizador' }, heading: 'Editar evento',
        action: '/organizador/eventos/1/editar', event: sampleEvent, errors: []
    }],
    ['organizer/participants.ejs', {
        user: { name: 'Org', role: 'organizador' }, event: sampleEvent,
        participants: [{ nome: 'Ana', email: 'ana@example.com', inscrito_em: new Date() }]
    }],
    ['registrations/index.ejs', {
        user: { name: 'Ana', role: 'participante' },
        registrations: [{ ...sampleEvent, inscricao_id: 10, inscrito_em: new Date() }]
    }],
    ['errors/404.ejs', {}],
    ['errors/error.ejs', { statusCode: 500, message: 'Mensagem segura' }]
];

for (const [view, locals] of cases) {
    test(`renderiza a View ${view}`, async () => {
        const html = await ejs.renderFile(path.join(viewsDirectory, view), { ...baseLocals, ...locals });
        assert.match(html, /<!DOCTYPE html>/);
        assert.match(html, /EventHub/);
        assert.doesNotMatch(html, /Gerenciador de Produtos/);
    });
}

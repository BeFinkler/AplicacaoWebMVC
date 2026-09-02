const { validationResult } = require('express-validator');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const { setFlash } = require('../middlewares/locals');

function formValues(body = {}) {
    return {
        title: body.title || '',
        description: body.description || '',
        location: body.location || '',
        startAt: body.startAt || '',
        endAt: body.endAt || '',
        capacity: body.capacity || ''
    };
}

function eventData(body) {
    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);

    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) {
        return { error: 'A data de término deve ser posterior à data de início.' };
    }
    if (startAt <= new Date()) return { error: 'A data de início deve estar no futuro.' };

    return {
        data: {
            title: body.title,
            description: body.description,
            location: body.location,
            startAt,
            endAt,
            capacity: Number(body.capacity)
        }
    };
}

/**
 * Renderiza a página inicial com os próximos eventos.
 * @async
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza a página inicial.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function home(req, res, next) {
    try {
        const events = await Event.findUpcoming(3);
        return res.render('home', { title: 'Início', events });
    } catch (error) {
        return next(error);
    }
}

/**
 * Lista os eventos disponíveis em uma View renderizada no servidor.
 * @async
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza o catálogo de eventos.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function listPublic(req, res, next) {
    try {
        const events = await Event.findUpcoming();
        return res.render('events/index', { title: 'Eventos', events });
    } catch (error) {
        return next(error);
    }
}

/**
 * Exibe os detalhes e o estado da inscrição do usuário atual.
 * @async
 * @param {import('express').Request} req Requisição com o identificador do evento.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza os detalhes ou a página 404.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function show(req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).render('errors/404', { title: 'Evento não encontrado' });

        let registered = false;
        if (req.session.user?.role === 'participante') {
            registered = await Registration.isRegistered(event.id, req.session.user.id);
        }
        return res.render('events/show', {
            title: event.titulo,
            event,
            registered,
            availableSpots: Math.max(0, Number(event.capacidade) - Number(event.inscritos))
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Lista os eventos pertencentes ao organizador autenticado.
 * @async
 * @param {import('express').Request} req Requisição autenticada.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza o painel do organizador.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function dashboard(req, res, next) {
    try {
        const events = await Event.findByOrganizer(req.session.user.id);
        return res.render('organizer/dashboard', { title: 'Meus eventos', events });
    } catch (error) {
        return next(error);
    }
}

/**
 * Renderiza o formulário de criação de evento.
 * @param {import('express').Request} req Requisição autenticada.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {void} Renderiza o formulário vazio.
 */
function showCreate(req, res) {
    res.render('organizer/form', {
        title: 'Novo evento', heading: 'Criar evento', action: '/organizador/eventos',
        event: formValues(), errors: []
    });
}

/**
 * Cria um evento vinculado ao organizador autenticado.
 * @async
 * @param {import('express').Request} req Requisição com os dados validados.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Persiste e redireciona ao painel.
 * @throws {Error} Quando a persistência falha.
 */
async function create(req, res, next) {
    const errors = validationResult(req).array().map((error) => error.msg);
    const parsed = eventData(req.body);
    if (parsed.error) errors.push(parsed.error);
    if (errors.length) {
        return res.status(422).render('organizer/form', {
            title: 'Novo evento', heading: 'Criar evento', action: '/organizador/eventos',
            event: formValues(req.body), errors: [...new Set(errors)]
        });
    }

    try {
        await Event.create(parsed.data, req.session.user.id);
        setFlash(req, 'success', 'Evento criado com sucesso.');
        return res.redirect('/organizador');
    } catch (error) {
        return next(error);
    }
}

/**
 * Renderiza a edição somente para o proprietário do evento.
 * @async
 * @param {import('express').Request} req Requisição com identificador validado.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza o formulário ou a página 404.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function showEdit(req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
    }
    try {
        const event = await Event.findById(req.params.id);
        if (!event || Number(event.organizador_id) !== Number(req.session.user.id)) {
            return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
        }
        return res.render('organizer/form', {
            title: 'Editar evento', heading: 'Editar evento',
            action: `/organizador/eventos/${event.id}/editar`, event, errors: []
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Atualiza somente um evento pertencente ao organizador autenticado.
 * @async
 * @param {import('express').Request} req Requisição com identificador e dados validados.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Atualiza e redireciona ao painel.
 * @throws {Error} Quando a atualização falha.
 */
async function update(req, res, next) {
    const errors = validationResult(req).array().map((error) => error.msg);
    const parsed = eventData(req.body);
    if (parsed.error) errors.push(parsed.error);
    if (errors.length) {
        return res.status(422).render('organizer/form', {
            title: 'Editar evento', heading: 'Editar evento',
            action: `/organizador/eventos/${req.params.id}/editar`,
            event: { id: req.params.id, ...formValues(req.body) }, errors: [...new Set(errors)]
        });
    }

    try {
        const updated = await Event.updateOwned(req.params.id, req.session.user.id, parsed.data);
        if (!updated) return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
        setFlash(req, 'success', 'Evento atualizado com sucesso.');
        return res.redirect('/organizador');
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.statusCode).render('organizer/form', {
                title: 'Editar evento', heading: 'Editar evento',
                action: `/organizador/eventos/${req.params.id}/editar`,
                event: { id: req.params.id, ...formValues(req.body) }, errors: [error.message]
            });
        }
        return next(error);
    }
}

/**
 * Exclui somente um evento pertencente ao organizador autenticado.
 * @async
 * @param {import('express').Request} req Requisição com identificador validado.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Exclui e redireciona ao painel.
 * @throws {Error} Quando a exclusão falha.
 */
async function remove(req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
    }
    try {
        const deleted = await Event.deleteOwned(req.params.id, req.session.user.id);
        if (!deleted) return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
        setFlash(req, 'success', 'Evento e suas inscrições foram excluídos.');
        return res.redirect('/organizador');
    } catch (error) {
        return next(error);
    }
}

/**
 * Lista os participantes de um evento pertencente ao organizador.
 * @async
 * @param {import('express').Request} req Requisição com identificador validado.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza a lista de inscritos ou a página 404.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function participants(req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
    }
    try {
        const result = await Event.findParticipants(req.params.id, req.session.user.id);
        if (!result) return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
        return res.render('organizer/participants', {
            title: `Inscritos - ${result.event.titulo}`,
            event: result.event,
            participants: result.participants
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Renderiza a página institucional do projeto.
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {void} Renderiza a apresentação da arquitetura.
 */
function about(req, res) {
    res.render('about', { title: 'Sobre' });
}

module.exports = {
    about, create, dashboard, home, listPublic, participants, remove, show, showCreate, showEdit, update
};

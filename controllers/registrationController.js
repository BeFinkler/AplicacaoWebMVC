const { validationResult } = require('express-validator');
const Registration = require('../models/registrationModel');
const { setFlash } = require('../middlewares/locals');

/**
 * Lista as inscrições do participante autenticado.
 * @async
 * @param {import('express').Request} req Requisição autenticada.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Renderiza a página Minhas inscrições.
 * @throws {Error} Quando a consulta ao banco falha.
 */
async function listMine(req, res, next) {
    try {
        const registrations = await Registration.findByParticipant(req.session.user.id);
        return res.render('registrations/index', { title: 'Minhas inscrições', registrations });
    } catch (error) {
        return next(error);
    }
}

/**
 * Inscreve o participante em um evento com controle transacional de vagas.
 * @async
 * @param {import('express').Request} req Requisição com o evento selecionado.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Registra a inscrição e redireciona.
 * @throws {Error} Quando a transação ou persistência falha.
 */
async function create(req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
    }
    try {
        await Registration.create(req.params.id, req.session.user.id);
        setFlash(req, 'success', 'Inscrição realizada com sucesso.');
        return res.redirect(`/eventos/${req.params.id}`);
    } catch (error) {
        if (error.isOperational) {
            setFlash(req, 'danger', error.message);
            return res.redirect(`/eventos/${req.params.id}`);
        }
        return next(error);
    }
}

/**
 * Cancela somente a inscrição pertencente ao participante autenticado.
 * @async
 * @param {import('express').Request} req Requisição com o evento selecionado.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Remove a inscrição e redireciona.
 * @throws {Error} Quando a exclusão falha.
 */
async function cancel(req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(404).render('errors/404', { title: 'Evento não encontrado' });
    }
    try {
        const removed = await Registration.cancel(req.params.id, req.session.user.id);
        setFlash(req, removed ? 'success' : 'warning', removed
            ? 'Inscrição cancelada com sucesso.'
            : 'Nenhuma inscrição foi encontrada para cancelar.');
        return res.redirect('/minhas-inscricoes');
    } catch (error) {
        return next(error);
    }
}

module.exports = { cancel, create, listMine };

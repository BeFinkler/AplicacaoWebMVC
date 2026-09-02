const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const { destroySession, regenerateSession, saveSession } = require('../utils/asyncSession');
const { sessionCookieOptions } = require('../middlewares/session');

const BCRYPT_ROUNDS = 12;

async function authenticateSession(req, user) {
    const returnTo = req.session.returnTo;
    await regenerateSession(req);
    req.session.user = {
        id: Number(user.id),
        name: user.nome,
        email: user.email,
        role: user.papel
    };
    await saveSession(req);
    return returnTo;
}

/**
 * Renderiza o formulário de login.
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {void} Renderiza a View de autenticação.
 */
function showLogin(req, res) {
    res.set('Cache-Control', 'no-store');
    res.render('auth/login', { title: 'Entrar', errors: [], formData: {} });
}

/**
 * Autentica um usuário e inicia uma sessão protegida.
 * @async
 * @param {import('express').Request} req Requisição com e-mail e senha validados.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Redireciona para a área correspondente ao papel.
 * @throws {Error} Quando o banco ou o armazenamento de sessão falha.
 */
async function processLogin(req, res, next) {
    const errors = validationResult(req);
    const formData = { email: req.body.email || '' };
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            title: 'Entrar', errors: errors.array().map((error) => error.msg), formData
        });
    }

    try {
        const user = await User.findByEmail(req.body.email);
        const validPassword = user && await bcrypt.compare(req.body.password, user.senha_hash);
        if (!validPassword) {
            return res.status(401).render('auth/login', {
                title: 'Entrar', errors: ['E-mail ou senha inválidos.'], formData
            });
        }

        const returnTo = await authenticateSession(req, user);
        return res.redirect(returnTo || (user.papel === 'organizador' ? '/organizador' : '/eventos'));
    } catch (error) {
        return next(error);
    }
}

/**
 * Renderiza o cadastro público de participantes.
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} res Resposta HTTP.
 * @returns {void} Renderiza o formulário de cadastro.
 */
function showRegister(req, res) {
    res.render('auth/register', { title: 'Criar conta', errors: [], formData: {} });
}

/**
 * Cadastra um participante com senha protegida por bcrypt.
 * @async
 * @param {import('express').Request} req Requisição com os dados validados.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Cria a sessão e redireciona para os eventos.
 * @throws {Error} Quando não é possível persistir o novo usuário.
 */
async function register(req, res, next) {
    const errors = validationResult(req);
    const formData = { name: req.body.name || '', email: req.body.email || '' };
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/register', {
            title: 'Criar conta', errors: errors.array().map((error) => error.msg), formData
        });
    }

    try {
        if (await User.findByEmail(req.body.email)) {
            return res.status(409).render('auth/register', {
                title: 'Criar conta', errors: ['Este e-mail já está cadastrado.'], formData
            });
        }

        const passwordHash = await bcrypt.hash(req.body.password, BCRYPT_ROUNDS);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            passwordHash,
            role: 'participante'
        });
        await authenticateSession(req, user);
        req.session.flash = { type: 'success', message: 'Conta criada com sucesso. Bem-vindo ao EventHub!' };
        await saveSession(req);
        return res.redirect('/eventos');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).render('auth/register', {
                title: 'Criar conta', errors: ['Este e-mail já está cadastrado.'], formData
            });
        }
        return next(error);
    }
}

/**
 * Encerra a sessão atual e remove o cookie do navegador.
 * @async
 * @param {import('express').Request} req Requisição autenticada.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Encaminha falhas inesperadas.
 * @returns {Promise<void>} Redireciona para a tela de login.
 * @throws {Error} Quando o armazenamento não consegue destruir a sessão.
 */
async function logout(req, res, next) {
    try {
        await destroySession(req);
        const cookie = sessionCookieOptions();
        res.clearCookie(process.env.SESSION_COOKIE_NAME || 'eventhub.sid', {
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            path: cookie.path
        });
        res.set('Clear-Site-Data', '"cache", "cookies", "storage"');
        return res.redirect('/login');
    } catch (error) {
        return next(error);
    }
}

module.exports = { logout, processLogin, register, showLogin, showRegister };

const crypto = require('node:crypto');
const AppError = require('../utils/AppError');

function ensureCsrfToken(req, res, next) {
    if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

function verifyCsrfToken(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const stored = Buffer.from(req.session.csrfToken || '');
    const received = Buffer.from(req.body?._csrf || '');
    if (stored.length === received.length && stored.length > 0 && crypto.timingSafeEqual(stored, received)) {
        return next();
    }

    return next(new AppError('A sessão do formulário expirou. Atualize a página e tente novamente.', 403, 'INVALID_CSRF'));
}

module.exports = { ensureCsrfToken, verifyCsrfToken };

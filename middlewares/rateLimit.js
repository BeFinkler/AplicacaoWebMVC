const { rateLimit } = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => res.status(429).render('auth/login', {
        title: 'Entrar',
        errors: ['Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'],
        formData: { email: req.body.email || '' }
    })
});

module.exports = { loginLimiter };

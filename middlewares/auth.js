function requireAuth(req, res, next) {
    if (!req.session?.user) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/login');
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return next();
}

function redirectAuthenticated(req, res, next) {
    if (!req.session?.user) return next();
    return res.redirect(req.session.user.role === 'organizador' ? '/organizador' : '/eventos');
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.session?.user?.role !== role) {
            return res.status(403).render('errors/error', {
                title: 'Acesso negado',
                statusCode: 403,
                message: 'Seu perfil não possui permissão para acessar esta página.'
            });
        }
        return next();
    };
}

module.exports = { redirectAuthenticated, requireAuth, requireRole };

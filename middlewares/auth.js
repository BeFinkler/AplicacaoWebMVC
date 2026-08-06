const jwt = require('jsonwebtoken');

/**
 * @middleware authMiddleware
 * @description Middleware de autenticação baseado em JWT (JSON Web Token).
 * Verifica o token JWT armazenado no cookie httpOnly 'token'.
 * Se válido, injeta os dados do usuário em `req.user` e prossegue.
 * Se inválido ou ausente, redireciona para a página de login.
 *
 * O token é gerado no `authController.processLogin` e armazenado em cookie httpOnly,
 * o que impede acesso via JavaScript no navegador (proteção contra XSS).
 *
 * @param {import('express').Request} req - Objeto de Requisição do Express.
 *        Espera req.cookies.token = JWT assinado com process.env.JWT_SECRET.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @param {import('express').NextFunction} next - Função para passar ao próximo middleware.
 * @returns {void} Chama next() se autenticado, ou redireciona para '/login'.
 * @example
 * // Proteger todas as rotas de um router:
 * router.use(authMiddleware);
 */
module.exports = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Verifica e decodifica o token usando a chave secreta do .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Injeta o payload do usuário na requisição para uso nos controllers
        req.user = decoded;

        // Impede cache de páginas autenticadas
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        next();
    } catch (err) {
        // Token expirado ou inválido — limpa o cookie e redireciona
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

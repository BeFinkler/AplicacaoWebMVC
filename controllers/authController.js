/**
 * @typedef {Object} User
 * @property {number} id - Identificador único do usuário.
 * @property {string} email - Email do usuário (identificador único).
 * @property {string} password - Senha do usuário (em produção, deve ser hasheada com bcrypt).
 * @property {string} name - Nome completo do usuário.
 */

/**
 * @type {User[]}
 * @description Simulação de uma tabela de usuários em memória.
 * Em produção, isso seria consultado direto do banco de dados (MySQL, PostgreSQL, etc).
 * @note AVISO DE SEGURANÇA: Nunca armazene senhas em texto plano!
 * TODO: Implementar bcrypt para hash seguro de senhas antes de persistir.
 */
const users = [
    { id: 1, email: 'user@example.com', password: '123456', name: 'Usuário Teste' }
];

/**
 * @controller AuthController
 * @description Intercepta requisições HTTP relacionadas a autenticação e autorização.
 * Gerencia login, logout e renderização de páginas de autenticação.
 */

/**
 * Renderiza a página de login.
 * Aplica headers de cache HTTP para evitar que a página fique em cache do navegador.
 * @async
 * @method showLogin
 * @param {import('express').Request} req - Objeto de Requisição do Express.
 * @param {import('express').Response} res - Objeto de Resposta do Express (renderiza template login.ejs).
 * @returns {void} Renderiza a página de login sem variáveis de contexto.
 * @example
 * // GET /login
 * // Rota de acesso: app.get('/login', authController.showLogin);
 */
exports.showLogin = (req, res) => {
    // Impede cache da página de login
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.render('login');
};

/**
 * Processa a requisição de login (POST).
 * Valida credenciais do usuário contra o banco em memória,
 * e cria uma sessão autenticada caso as credenciais sejam válidas.
 * @async
 * @method processLogin
 * @param {import('express').Request} req - Objeto de Requisição do Express.
 *        Espera req.body = { email: string, password: string }
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Redireciona para '/' (home) se sucesso, ou re-renderiza login com erro.
 * @throws {Error} Dispara erro se o formulário não contiver email ou senha.
 * @example
 * // POST /login
 * // Body esperado: { email: "user@example.com", password: "123456" }
 * // Rota de acesso: app.post('/login', authController.processLogin);
 */
exports.processLogin = (req, res) => {
    const { email, password } = req.body;

    // Valida se email e senha foram fornecidos
    if (!email || !password) {
        return res.render('login', { error: 'Email e senha são obrigatórios!' });
    }

    // Busca o usuário em memória
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.render('login', { error: 'Email ou senha inválidos!' });
    }

    // Salva o usuário na sessão (estrutura segura sem expor senha)
    req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    res.redirect('/');
};

/**
 * Processa a requisição de logout (POST).
 * Destroi a sessão do usuário e invalida cookies de autenticação.
 * @async
 * @method logout
 * @param {import('express').Request} req - Objeto de Requisição do Express com sessão ativa.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Redireciona para '/login' após destruir sessão.
 * @throws {Error} Dispara erro se falhar ao destruir sessão no backend.
 * @example
 * // GET /logout
 * // Rota de acesso: app.get('/logout', authController.logout);
 */
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Erro ao fazer logout!');
        }
        
        // Impede cache e historico da pagina após logout
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        res.redirect('/login');
    });
};

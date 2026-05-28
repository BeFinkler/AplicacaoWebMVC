// Simulação de usuários em memória
const users = [
    { id: 1, email: 'user@example.com', password: '123456', name: 'Usuário Teste' }
];

// Renderiza a página de login
exports.showLogin = (req, res) => {
    // Impede cache da página de login
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.render('login');
};

// Processa o login
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

    // Salva o usuário na sessão
    req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    res.redirect('/');
};

// Processa o logout
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

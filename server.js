const express = require('express');
const path = require('node:path');
const session = require('express-session');
const app = express();
const port = 3000;

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Middleware de sessão
app.use(session({
    secret: 'sua-chave-secreta-aqui',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// view engine
app.set('view engine', 'ejs');

// Middleware para impedir cache de páginas autenticadas
app.use((req, res, next) => {
    if (req.session && req.session.user) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

// rotas de autenticação (sem proteção)
app.use('/', authRoutes);

// rotas da aplicação (com proteção)
app.use('/', userRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

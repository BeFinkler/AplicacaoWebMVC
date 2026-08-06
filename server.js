require('dotenv').config({ quiet: true });

const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const User = require('./models/authModel');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

function validateEnvironment() {
    if (!process.env.MONGO_URI) throw new Error('Defina MONGO_URI no arquivo .env.');
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('Defina JWT_SECRET com pelo menos 32 caracteres no arquivo .env.');
    }
}

async function seedInitialUser() {
    const { SEED_USER_NAME, SEED_USER_EMAIL, SEED_USER_PASSWORD } = process.env;
    const values = [SEED_USER_NAME, SEED_USER_EMAIL, SEED_USER_PASSWORD];

    if (values.every((value) => !value)) return;
    if (values.some((value) => !value)) {
        throw new Error('Defina SEED_USER_NAME, SEED_USER_EMAIL e SEED_USER_PASSWORD juntos.');
    }

    const email = SEED_USER_EMAIL.toLowerCase();
    const existingUser = await User.exists({ email });
    if (!existingUser) {
        await User.create({ name: SEED_USER_NAME, email, password: SEED_USER_PASSWORD });
    }
}

function createApp() {
    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
    app.use('/', authRoutes);
    app.use('/', userRoutes);

    app.use((req, res) => res.status(404).render('login', { error: 'Página não encontrada.' }));
    app.use((error, req, res, next) => {
        console.error('Erro não tratado:', error.message);
        res.status(500).render('login', { error: 'Ocorreu um erro inesperado. Tente novamente.' });
    });

    return app;
}

async function startServer() {
    validateEnvironment();
    await connectDB();
    await seedInitialUser();

    const app = createApp();
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta ${port}`));
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error(`Erro ao iniciar a aplicação: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { createApp, seedInitialUser, validateEnvironment };

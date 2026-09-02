require('dotenv').config({ quiet: true });

process.env.TZ = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

const express = require('express');
const helmet = require('helmet');
const path = require('node:path');
const { checkDatabaseConnection, closePool, databaseConfig } = require('./config/db');
const { createSessionMiddleware } = require('./middlewares/session');
const { ensureCsrfToken, verifyCsrfToken } = require('./middlewares/csrf');
const { templateLocals } = require('./middlewares/locals');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const { runMigrations } = require('./scripts/migrate');
const { seedOrganizer } = require('./scripts/seedOrganizer');

function validateEnvironment() {
    databaseConfig();
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
        throw new Error('Defina SESSION_SECRET com pelo menos 32 caracteres.');
    }
    const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port <= 0) throw new Error('PORT deve ser uma porta válida.');
}

function createApp(options = {}) {
    const app = express();
    const healthCheck = options.healthCheck || checkDatabaseConnection;

    app.disable('x-powered-by');
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.set('trust proxy', Number(process.env.TRUST_PROXY || (process.env.NODE_ENV === 'production' ? 1 : 0)));

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
                formAction: ["'self'"],
                frameAncestors: ["'none'"]
            }
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));
    app.use(express.urlencoded({ extended: false, limit: '32kb' }));
    app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 }));

    app.get('/health', async (req, res) => {
        try {
            await healthCheck();
            return res.status(200).json({ status: 'ok', database: 'connected' });
        } catch (error) {
            console.error(`Falha no health check: ${error.message}`);
            return res.status(503).json({ status: 'error', database: 'unavailable' });
        }
    });

    app.use(options.sessionMiddleware || createSessionMiddleware());
    app.use(ensureCsrfToken);
    app.use(templateLocals);
    app.use(verifyCsrfToken);

    app.use('/', authRoutes);
    app.use('/', eventRoutes);
    app.use('/organizador', organizerRoutes);
    app.use('/', registrationRoutes);

    app.use((req, res) => res.status(404).render('errors/404', { title: 'Página não encontrada' }));
    app.use((error, req, res, next) => {
        console.error('Erro na aplicação:', error.isOperational ? error.message : (error.stack || error.message));
        const statusCode = error.isOperational ? error.statusCode : 500;
        const message = error.isOperational
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
        return res.status(statusCode).render('errors/error', {
            title: statusCode === 403 ? 'Acesso negado' : 'Erro', statusCode, message
        });
    });

    return app;
}

async function startServer() {
    validateEnvironment();
    await runMigrations();
    await seedOrganizer({ required: false });
    await checkDatabaseConnection();

    const app = createApp();
    const port = Number(process.env.PORT || 3000);
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`EventHub disponível na porta ${port}.`);
    });

    const shutdown = () => {
        server.close(async () => {
            await closePool();
            process.exit(0);
        });
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
    return server;
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error(`Não foi possível iniciar o EventHub: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { createApp, startServer, validateEnvironment };

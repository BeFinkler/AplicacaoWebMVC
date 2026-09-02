const session = require('express-session');
const MySQLSessionStore = require('../config/MySQLSessionStore');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function sessionCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ONE_DAY_MS,
        path: '/'
    };
}

function createSessionMiddleware(options = {}) {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
        throw new Error('Defina SESSION_SECRET com pelo menos 32 caracteres.');
    }

    const store = options.store || new MySQLSessionStore();
    if (typeof store.clearExpired === 'function') {
        store.clearExpired().catch((error) => console.error(`Erro ao limpar sessões expiradas: ${error.message}`));
        const cleanupTimer = setInterval(
            () => store.clearExpired().catch((error) => console.error(`Erro ao limpar sessões expiradas: ${error.message}`)),
            60 * 60 * 1000
        );
        cleanupTimer.unref();
    }

    return session({
        name: process.env.SESSION_COOKIE_NAME || 'eventhub.sid',
        secret: process.env.SESSION_SECRET,
        store,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        proxy: process.env.NODE_ENV === 'production',
        cookie: sessionCookieOptions()
    });
}

module.exports = { createSessionMiddleware, sessionCookieOptions };

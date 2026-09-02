const session = require('express-session');
const { getPool } = require('./db');

class MySQLSessionStore extends session.Store {
    async get(sessionId, callback) {
        try {
            const [rows] = await getPool().execute(
                'SELECT dados FROM sessoes WHERE id = ? AND expira_em > UTC_TIMESTAMP(3) LIMIT 1',
                [sessionId]
            );
            callback(null, rows[0] ? JSON.parse(rows[0].dados) : null);
        } catch (error) {
            callback(error);
        }
    }

    async set(sessionId, sessionData, callback = () => {}) {
        try {
            const fallback = Date.now() + 24 * 60 * 60 * 1000;
            const expiresAt = sessionData.cookie?.expires
                ? new Date(sessionData.cookie.expires)
                : new Date(fallback);
            await getPool().execute(
                `INSERT INTO sessoes (id, dados, expira_em)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE dados = VALUES(dados), expira_em = VALUES(expira_em)`,
                [sessionId, JSON.stringify(sessionData), expiresAt]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async destroy(sessionId, callback = () => {}) {
        try {
            await getPool().execute('DELETE FROM sessoes WHERE id = ?', [sessionId]);
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async touch(sessionId, sessionData, callback = () => {}) {
        try {
            const fallback = Date.now() + 24 * 60 * 60 * 1000;
            const expiresAt = sessionData.cookie?.expires
                ? new Date(sessionData.cookie.expires)
                : new Date(fallback);
            await getPool().execute(
                'UPDATE sessoes SET expira_em = ? WHERE id = ?',
                [expiresAt, sessionId]
            );
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async clearExpired() {
        await getPool().execute('DELETE FROM sessoes WHERE expira_em <= UTC_TIMESTAMP(3)');
    }
}

module.exports = MySQLSessionStore;

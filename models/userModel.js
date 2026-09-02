const { getPool } = require('../config/db');

async function findByEmail(email) {
    const [rows] = await getPool().execute(
        `SELECT id, nome, email, senha_hash, papel
         FROM usuarios
         WHERE email = ?
         LIMIT 1`,
        [email]
    );
    return rows[0] || null;
}

async function findById(id) {
    const [rows] = await getPool().execute(
        `SELECT id, nome, email, papel, criado_em
         FROM usuarios
         WHERE id = ?
         LIMIT 1`,
        [id]
    );
    return rows[0] || null;
}

async function create({ name, email, passwordHash, role }) {
    const [result] = await getPool().execute(
        `INSERT INTO usuarios (nome, email, senha_hash, papel)
         VALUES (?, ?, ?, ?)`,
        [name, email, passwordHash, role]
    );
    return findById(result.insertId);
}

module.exports = { create, findByEmail, findById };

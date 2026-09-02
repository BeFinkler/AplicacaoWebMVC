const { getPool } = require('../config/db');
const AppError = require('../utils/AppError');

const eventSelect = `
    SELECT e.id, e.titulo, e.descricao, e.local, e.inicio, e.fim,
           e.capacidade, e.organizador_id, e.criado_em, e.atualizado_em,
           u.nome AS organizador_nome,
           (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id) AS inscritos
    FROM eventos e
    INNER JOIN usuarios u ON u.id = e.organizador_id`;

async function findUpcoming(limit) {
    const params = [];
    let sql = `${eventSelect}
        WHERE e.fim >= UTC_TIMESTAMP()
        ORDER BY e.inicio ASC`;

    if (Number.isInteger(limit) && limit > 0) {
        sql += ' LIMIT ?';
        params.push(limit);
    }

    const [rows] = await getPool().execute(sql, params);
    return rows;
}

async function findById(id) {
    const [rows] = await getPool().execute(
        `${eventSelect} WHERE e.id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
}

async function findByOrganizer(organizerId) {
    const [rows] = await getPool().execute(
        `${eventSelect}
         WHERE e.organizador_id = ?
         ORDER BY e.inicio DESC`,
        [organizerId]
    );
    return rows;
}

async function create(data, organizerId) {
    const [result] = await getPool().execute(
        `INSERT INTO eventos
            (titulo, descricao, local, inicio, fim, capacidade, organizador_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.title, data.description, data.location, data.startAt, data.endAt, data.capacity, organizerId]
    );
    return findById(result.insertId);
}

async function updateOwned(id, organizerId, data) {
    const connection = await getPool().getConnection();
    try {
        await connection.beginTransaction();
        const [events] = await connection.execute(
            `SELECT id FROM eventos
             WHERE id = ? AND organizador_id = ?
             FOR UPDATE`,
            [id, organizerId]
        );
        if (!events[0]) {
            await connection.rollback();
            return false;
        }
        const [counts] = await connection.execute(
            'SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?',
            [id]
        );
        if (Number(data.capacity) < Number(counts[0].total)) {
            throw new AppError(
                `A capacidade não pode ser menor que as ${counts[0].total} inscrições existentes.`,
                409,
                'CAPACITY_BELOW_REGISTRATIONS'
            );
        }

        await connection.execute(
            `UPDATE eventos
             SET titulo = ?, descricao = ?, local = ?, inicio = ?, fim = ?, capacidade = ?
             WHERE id = ? AND organizador_id = ?`,
            [data.title, data.description, data.location, data.startAt, data.endAt, data.capacity, id, organizerId]
        );
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteOwned(id, organizerId) {
    const [result] = await getPool().execute(
        'DELETE FROM eventos WHERE id = ? AND organizador_id = ?',
        [id, organizerId]
    );
    return result.affectedRows > 0;
}

async function findParticipants(id, organizerId) {
    const [events] = await getPool().execute(
        'SELECT id, titulo, capacidade FROM eventos WHERE id = ? AND organizador_id = ? LIMIT 1',
        [id, organizerId]
    );
    if (!events[0]) return null;

    const [participants] = await getPool().execute(
        `SELECT u.id, u.nome, u.email, i.criado_em AS inscrito_em
         FROM inscricoes i
         INNER JOIN usuarios u ON u.id = i.participante_id
         WHERE i.evento_id = ?
         ORDER BY i.criado_em ASC`,
        [id]
    );
    return { event: events[0], participants };
}

module.exports = {
    create,
    deleteOwned,
    findById,
    findByOrganizer,
    findParticipants,
    findUpcoming,
    updateOwned
};

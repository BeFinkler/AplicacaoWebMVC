const { getPool } = require('../config/db');
const AppError = require('../utils/AppError');

async function create(eventId, participantId) {
    const connection = await getPool().getConnection();

    try {
        await connection.beginTransaction();
        const [events] = await connection.execute(
            `SELECT id, capacidade, inicio, fim
             FROM eventos
             WHERE id = ?
             FOR UPDATE`,
            [eventId]
        );
        const event = events[0];

        if (!event) throw new AppError('Evento não encontrado.', 404, 'EVENT_NOT_FOUND');
        if (new Date(event.fim) <= new Date()) {
            throw new AppError('Este evento já foi encerrado.', 409, 'EVENT_FINISHED');
        }

        const [existing] = await connection.execute(
            'SELECT id FROM inscricoes WHERE evento_id = ? AND participante_id = ? LIMIT 1',
            [eventId, participantId]
        );
        if (existing[0]) {
            throw new AppError('Você já está inscrito neste evento.', 409, 'ALREADY_REGISTERED');
        }

        const [counts] = await connection.execute(
            'SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?',
            [eventId]
        );
        if (Number(counts[0].total) >= Number(event.capacidade)) {
            throw new AppError('Não há mais vagas disponíveis.', 409, 'EVENT_FULL');
        }

        await connection.execute(
            'INSERT INTO inscricoes (evento_id, participante_id) VALUES (?, ?)',
            [eventId, participantId]
        );
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            throw new AppError('Você já está inscrito neste evento.', 409, 'ALREADY_REGISTERED');
        }
        throw error;
    } finally {
        connection.release();
    }
}

async function cancel(eventId, participantId) {
    const [result] = await getPool().execute(
        'DELETE FROM inscricoes WHERE evento_id = ? AND participante_id = ?',
        [eventId, participantId]
    );
    return result.affectedRows > 0;
}

async function isRegistered(eventId, participantId) {
    const [rows] = await getPool().execute(
        'SELECT id FROM inscricoes WHERE evento_id = ? AND participante_id = ? LIMIT 1',
        [eventId, participantId]
    );
    return Boolean(rows[0]);
}

async function findByParticipant(participantId) {
    const [rows] = await getPool().execute(
        `SELECT i.id AS inscricao_id, i.criado_em AS inscrito_em,
                e.id, e.titulo, e.descricao, e.local, e.inicio, e.fim,
                u.nome AS organizador_nome
         FROM inscricoes i
         INNER JOIN eventos e ON e.id = i.evento_id
         INNER JOIN usuarios u ON u.id = e.organizador_id
         WHERE i.participante_id = ?
         ORDER BY e.inicio ASC`,
        [participantId]
    );
    return rows;
}

module.exports = { cancel, create, findByParticipant, isRegistered };

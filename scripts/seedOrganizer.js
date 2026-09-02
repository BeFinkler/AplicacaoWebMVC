require('dotenv').config({ quiet: true });

const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { closePool } = require('../config/db');
const { runMigrations } = require('./migrate');

async function seedOrganizer({ required = true } = {}) {
    const name = process.env.SEED_ORGANIZER_NAME?.trim();
    const email = process.env.SEED_ORGANIZER_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_ORGANIZER_PASSWORD;
    const values = [name, email, password];

    if (values.every((value) => !value) && !required) return false;
    if (values.some((value) => !value)) {
        throw new Error('Defina SEED_ORGANIZER_NAME, SEED_ORGANIZER_EMAIL e SEED_ORGANIZER_PASSWORD juntos.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('SEED_ORGANIZER_EMAIL deve ser um e-mail válido.');
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        throw new Error('SEED_ORGANIZER_PASSWORD deve ter entre 8 caracteres e 72 bytes.');
    }

    const existing = await User.findByEmail(email);
    if (existing) {
        if (existing.papel !== 'organizador') {
            throw new Error('O e-mail informado já pertence a um participante.');
        }
        console.log('O organizador inicial já existe; nenhuma alteração foi realizada.');
        return false;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: 'organizador' });
    console.log('Organizador inicial criado com sucesso.');
    return true;
}

if (require.main === module) {
    runMigrations()
        .then(() => seedOrganizer({ required: true }))
        .catch((error) => {
            console.error(`Erro ao criar organizador: ${error.message}`);
            process.exitCode = 1;
        })
        .finally(closePool);
}

module.exports = { seedOrganizer };

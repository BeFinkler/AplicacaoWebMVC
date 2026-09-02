const { body, param } = require('express-validator');

const cleanText = (value) => typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim()
    : value;

const loginValidation = [
    body('email').trim().normalizeEmail().isEmail().withMessage('Informe um e-mail válido.'),
    body('password').isString().notEmpty().withMessage('Informe sua senha.')
];

const registerValidation = [
    body('name')
        .customSanitizer(cleanText)
        .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),
    body('email').trim().normalizeEmail().isEmail().withMessage('Informe um e-mail válido.'),
    body('password')
        .isLength({ min: 8 }).withMessage('A senha deve ter pelo menos 8 caracteres.')
        .bail()
        .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
        .withMessage('A senha deve ter no máximo 72 bytes.'),
    body('passwordConfirmation')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('A confirmação de senha não confere.')
];

const eventValidation = [
    body('title')
        .customSanitizer(cleanText)
        .isLength({ min: 3, max: 140 }).withMessage('O título deve ter entre 3 e 140 caracteres.'),
    body('description')
        .customSanitizer(cleanText)
        .isLength({ min: 10, max: 5000 }).withMessage('A descrição deve ter entre 10 e 5000 caracteres.'),
    body('location')
        .customSanitizer(cleanText)
        .isLength({ min: 3, max: 180 }).withMessage('O local deve ter entre 3 e 180 caracteres.'),
    body('startAt').isISO8601().withMessage('Informe uma data de início válida.'),
    body('endAt').isISO8601().withMessage('Informe uma data de término válida.'),
    body('capacity').isInt({ min: 1, max: 100000 }).withMessage('A capacidade deve ser entre 1 e 100000.').toInt()
];

const idValidation = [param('id').isInt({ min: 1 }).withMessage('Identificador inválido.').toInt()];

module.exports = { eventValidation, idValidation, loginValidation, registerValidation };

const express = require('express');
const registrationController = require('../controllers/registrationController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { idValidation } = require('../middlewares/validation');

const router = express.Router();
const participantOnly = [requireAuth, requireRole('participante')];

router.get('/minhas-inscricoes', participantOnly, registrationController.listMine);
router.post('/eventos/:id/inscrever', participantOnly, idValidation, registrationController.create);
router.post('/eventos/:id/cancelar', participantOnly, idValidation, registrationController.cancel);

module.exports = router;

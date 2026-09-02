const express = require('express');
const eventController = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { eventValidation, idValidation } = require('../middlewares/validation');

const router = express.Router();

router.use(requireAuth, requireRole('organizador'));
router.get('/', eventController.dashboard);
router.get('/eventos/novo', eventController.showCreate);
router.post('/eventos', eventValidation, eventController.create);
router.get('/eventos/:id/editar', idValidation, eventController.showEdit);
router.post('/eventos/:id/editar', idValidation, eventValidation, eventController.update);
router.post('/eventos/:id/excluir', idValidation, eventController.remove);
router.get('/eventos/:id/inscritos', idValidation, eventController.participants);

module.exports = router;

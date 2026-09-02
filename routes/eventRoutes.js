const express = require('express');
const eventController = require('../controllers/eventController');
const { idValidation } = require('../middlewares/validation');

const router = express.Router();

router.get('/', eventController.home);
router.get('/eventos', eventController.listPublic);
router.get('/eventos/:id', idValidation, eventController.show);
router.get('/sobre', eventController.about);

module.exports = router;

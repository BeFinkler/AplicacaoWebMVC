const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// páginas
router.get('/', userController.home);
router.get('/sobre', userController.sobre);
router.get('/contato', userController.contato);

// CRUD
router.get('/produtos', userController.listUsers);
router.post('/produtos', userController.createUser);
router.get('/delete/:id', userController.deleteUser);

module.exports = router;

const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// páginas
router.get('/', userController.home);
router.get('/sobre', userController.sobre);
router.get('/contato', userController.contato);

// CRUD de Produtos
router.get('/produtos', userController.listProducts);
router.post('/produtos', userController.createProduct);
router.get('/delete/:id', userController.deleteProduct);

module.exports = router;

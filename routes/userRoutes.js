const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// Todas as rotas de usuário são protegidas por autenticação
router.use(authMiddleware);

// páginas
router.get('/', userController.home);
router.get('/sobre', userController.sobre);
router.get('/contato', userController.contato);

// CRUD de Produtos
router.get('/produtos', userController.listProducts);
router.post('/produtos', userController.createProduct);
router.post('/produtos/:id/delete', userController.deleteProduct);
router.get('/editar/:id', userController.showEditForm);
router.post('/editar/:id', userController.updateProduct);

module.exports = router;

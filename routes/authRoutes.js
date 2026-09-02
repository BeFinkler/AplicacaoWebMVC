const express = require('express');
const authController = require('../controllers/authController');
const { redirectAuthenticated, requireAuth } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimit');
const { loginValidation, registerValidation } = require('../middlewares/validation');

const router = express.Router();

router.get('/login', redirectAuthenticated, authController.showLogin);
router.post('/login', redirectAuthenticated, loginLimiter, loginValidation, authController.processLogin);
router.get('/cadastro', redirectAuthenticated, authController.showRegister);
router.post('/cadastro', redirectAuthenticated, registerValidation, authController.register);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login (GET e POST)
router.get('/login', authController.showLogin);
router.post('/login', authController.processLogin);

// Rota de logout
router.get('/logout', authController.logout);

module.exports = router;

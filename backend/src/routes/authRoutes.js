const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registrar', AuthController.registrar);
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/verificar', authMiddleware, AuthController.verificarToken);

module.exports = router;

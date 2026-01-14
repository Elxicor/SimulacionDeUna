const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener perfil del usuario
router.get('/perfil', UsuariosController.obtenerPerfil);

// Obtener saldo
router.get('/saldo', UsuariosController.obtenerSaldo);

// Obtener historial de transacciones
router.get('/historial', UsuariosController.obtenerHistorial);

module.exports = router;

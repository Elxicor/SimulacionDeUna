const express = require('express');
const router = express.Router();
const TransaccionesController = require('../controllers/transaccionesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener historial de transacciones
router.get('/', TransaccionesController.obtenerHistorial);

// Obtener detalle de una transacción
router.get('/:transaccionId', TransaccionesController.obtenerDetalle);

module.exports = router;

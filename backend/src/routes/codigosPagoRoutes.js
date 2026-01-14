const express = require('express');
const router = express.Router();
const CodigosPagoController = require('../controllers/codigosPagoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Generar código (para negocios)
router.post('/generar', CodigosPagoController.generar);

// Validar código (antes de pagar)
router.get('/validar/:codigo', CodigosPagoController.validar);

// Procesar pago con código
router.post('/pagar', CodigosPagoController.pagar);

// Cancelar código
router.put('/cancelar/:codigoId', CodigosPagoController.cancelar);

// Obtener códigos de un negocio
router.get('/negocio/:negocioId', CodigosPagoController.obtenerPorNegocio);

module.exports = router;

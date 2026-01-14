const TransaccionService = require('../services/transaccionService');
const Transaccion = require('../models/Transaccion');

class TransaccionesController {
  static async obtenerHistorial(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { limit = 20 } = req.query;
      
      const transacciones = await TransaccionService.obtenerHistorial(
        usuarioId,
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: { transacciones }
      });
      
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de transacciones'
      });
    }
  }

  static async obtenerDetalle(req, res) {
    try {
      const { transaccionId } = req.params;
      const usuarioId = req.usuario.id;
      
      const transaccion = await Transaccion.buscarPorId(transaccionId);
      
      if (!transaccion) {
        return res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
      }
      
      // Verificar que la transacción pertenezca al usuario
      if (transaccion.tra_usuario_origen_id !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta transacción'
        });
      }
      
      res.json({
        success: true,
        data: { transaccion }
      });
      
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle de transacción'
      });
    }
  }
}

module.exports = TransaccionesController;

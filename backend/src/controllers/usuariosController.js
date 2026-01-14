const Usuario = require('../models/Usuario');
const Transaccion = require('../models/Transaccion');

class UsuariosController {
  static async obtenerPerfil(req, res) {
    try {
      const usuarioId = req.usuario.id;
      
      const usuario = await Usuario.buscarPorId(usuarioId);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: { usuario }
      });
      
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil'
      });
    }
  }

  static async obtenerSaldo(req, res) {
    try {
      const usuarioId = req.usuario.id;
      
      const saldo = await Usuario.obtenerSaldo(usuarioId);
      
      res.json({
        success: true,
        data: { saldo }
      });
      
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener saldo'
      });
    }
  }

  static async obtenerHistorial(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { limit = 20, offset = 0 } = req.query;
      
      const transacciones = await Transaccion.obtenerPorUsuario(
        usuarioId,
        parseInt(limit),
        parseInt(offset)
      );
      
      res.json({
        success: true,
        data: { transacciones }
      });
      
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial'
      });
    }
  }
}

module.exports = UsuariosController;

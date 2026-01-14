const CodigoPago = require('../models/CodigoPago');
const TransaccionService = require('../services/transaccionService');

class CodigosPagoController {
  // Generar nuevo código (para negocios)
  static async generar(req, res) {
    try {
      const { negocioId, monto, descripcion } = req.body;
      const usuarioId = req.usuario?.usu_id; // ID del usuario autenticado
      
      console.log('🔑 Generando código para usuario:', usuarioId);
      
      if (!negocioId || !monto) {
        return res.status(400).json({
          success: false,
          message: 'Negocio ID y monto son requeridos'
        });
      }
      
      if (monto <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a cero'
        });
      }
      
      // Pasar el ID del usuario que genera el código
      const codigo = await CodigoPago.crear(negocioId, monto, descripcion, usuarioId);
      
      console.log('✅ Código generado:', codigo.cod_codigo, 'Usuario generador:', codigo.cod_usuario_generador_id);
      
      res.status(201).json({
        success: true,
        message: 'Código generado exitosamente',
        data: {
          codigo: codigo.cod_codigo,
          monto: codigo.cod_monto,
          descripcion: codigo.cod_descripcion,
          fechaExpiracion: codigo.cod_fecha_expiracion,
          minutosExpiracion: process.env.CODIGO_EXPIRATION_MINUTES || 3
        }
      });
      
    } catch (error) {
      console.error('Error al generar código:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar código de pago'
      });
    }
  }

  // Validar código (antes de pagar)
  static async validar(req, res) {
    try {
      const { codigo } = req.params;
      
      if (!codigo || codigo.length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'Código inválido'
        });
      }
      
      const codigoValido = await CodigoPago.validarCodigo(codigo);
      
      if (!codigoValido) {
        return res.status(404).json({
          success: false,
          message: 'Código no encontrado, inválido o expirado'
        });
      }
      
      // Calcular tiempo restante
      const ahora = new Date();
      const expiracion = new Date(codigoValido.cod_fecha_expiracion);
      const segundosRestantes = Math.floor((expiracion - ahora) / 1000);
      
      res.json({
        success: true,
        data: {
          codigo: codigoValido.cod_codigo,
          monto: codigoValido.cod_monto,
          descripcion: codigoValido.cod_descripcion,
          negocio: {
            nombre: codigoValido.neg_nombre_comercial,
            razonSocial: codigoValido.neg_razon_social
          },
          segundosRestantes: segundosRestantes
        }
      });
      
    } catch (error) {
      console.error('Error al validar código:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar código'
      });
    }
  }

  // Procesar pago con código
  static async pagar(req, res) {
    try {
      const { codigo, pin } = req.body;
      const usuarioId = req.usuario.id; // Del middleware de autenticación
      
      if (!codigo || !pin) {
        return res.status(400).json({
          success: false,
          message: 'Código y PIN son requeridos'
        });
      }
      
      if (codigo.length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'El código debe tener 6 dígitos'
        });
      }
      
      const resultado = await TransaccionService.procesarPagoConCodigo(
        codigo,
        usuarioId,
        pin
      );
      
      res.json({
        success: true,
        message: 'Pago realizado exitosamente',
        data: {
          codigoReferencia: resultado.transaccion.tra_codigo_referencia,
          monto: resultado.transaccion.tra_monto,
          nuevoSaldo: resultado.nuevoSaldo,
          negocio: resultado.negocio,
          fecha: resultado.transaccion.tra_fecha_hora
        }
      });
      
    } catch (error) {
      console.error('Error al procesar pago:', error);
      
      let statusCode = 500;
      let mensaje = 'Error al procesar el pago';
      
      if (error.message === 'PIN incorrecto') {
        statusCode = 401;
        mensaje = error.message;
      } else if (error.message === 'Código inválido o expirado') {
        statusCode = 404;
        mensaje = error.message;
      } else if (error.message === 'Saldo insuficiente') {
        statusCode = 400;
        mensaje = error.message;
      }
      
      res.status(statusCode).json({
        success: false,
        message: mensaje
      });
    }
  }

  // Cancelar código
  static async cancelar(req, res) {
    try {
      const { codigoId } = req.params;
      
      const codigo = await CodigoPago.cancelar(codigoId);
      
      if (!codigo) {
        return res.status(404).json({
          success: false,
          message: 'Código no encontrado o ya no está activo'
        });
      }
      
      res.json({
        success: true,
        message: 'Código cancelado exitosamente'
      });
      
    } catch (error) {
      console.error('Error al cancelar código:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar código'
      });
    }
  }

  // Obtener códigos de un negocio
  static async obtenerPorNegocio(req, res) {
    try {
      const { negocioId } = req.params;
      const { limit = 50 } = req.query;
      
      const codigos = await CodigoPago.obtenerPorNegocio(negocioId, limit);
      
      res.json({
        success: true,
        data: codigos
      });
      
    } catch (error) {
      console.error('Error al obtener códigos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener códigos'
      });
    }
  }
}

module.exports = CodigosPagoController;

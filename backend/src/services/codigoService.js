const CodigoPago = require('../models/CodigoPago');
const Negocio = require('../models/Negocio');

class CodigoService {
  static async generarCodigoPago(negocioId, monto, descripcion = '', usuarioGeneradorId = null) {
    try {
      // Verificar que el negocio existe y está activo
      const negocio = await Negocio.buscarPorId(negocioId);
      
      if (!negocio) {
        throw new Error('Negocio no encontrado');
      }
      
      if (!negocio.neg_activo) {
        throw new Error('El negocio no está activo');
      }
      
      // Validar monto
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a cero');
      }
      
      if (monto > 10000) {
        throw new Error('El monto máximo por transacción es $10,000');
      }
      
      // Generar código con el ID del usuario que lo genera
      const codigo = await CodigoPago.crear(negocioId, monto, descripcion, usuarioGeneradorId);
      
      return {
        success: true,
        codigo: codigo,
        mensaje: 'Código generado exitosamente'
      };
      
    } catch (error) {
      throw error;
    }
  }

  static async validarCodigoParaPago(codigoString) {
    try {
      // Validar formato
      if (!codigoString || codigoString.length !== 6) {
        return {
          valido: false,
          mensaje: 'El código debe tener 6 dígitos'
        };
      }
      
      if (!/^\d{6}$/.test(codigoString)) {
        return {
          valido: false,
          mensaje: 'El código debe contener solo números'
        };
      }
      
      // Buscar código en la base de datos
      const codigo = await CodigoPago.validarCodigo(codigoString);
      
      if (!codigo) {
        return {
          valido: false,
          mensaje: 'Código no encontrado, inválido o expirado'
        };
      }
      
      // Calcular tiempo restante
      const ahora = new Date();
      const expiracion = new Date(codigo.cod_fecha_expiracion);
      const segundosRestantes = Math.floor((expiracion - ahora) / 1000);
      
      if (segundosRestantes <= 0) {
        return {
          valido: false,
          mensaje: 'El código ha expirado'
        };
      }
      
      return {
        valido: true,
        codigo: codigo,
        segundosRestantes: segundosRestantes,
        mensaje: 'Código válido'
      };
      
    } catch (error) {
      throw error;
    }
  }

  static async obtenerEstadisticasCodigos(negocioId, fechaInicio, fechaFin) {
    try {
      const pool = require('../config/database');
      
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE cod_estado = 'ACTIVO') as activos,
          COUNT(*) FILTER (WHERE cod_estado = 'USADO') as usados,
          COUNT(*) FILTER (WHERE cod_estado = 'EXPIRADO') as expirados,
          COUNT(*) FILTER (WHERE cod_estado = 'CANCELADO') as cancelados,
          COUNT(*) as total,
          SUM(cod_monto) FILTER (WHERE cod_estado = 'USADO') as monto_total_cobrado,
          AVG(cod_monto) FILTER (WHERE cod_estado = 'USADO') as monto_promedio
        FROM codigos_pago
        WHERE cod_negocio_id = $1
          AND cod_fecha_generacion BETWEEN $2 AND $3
      `;
      
      const result = await pool.query(query, [negocioId, fechaInicio, fechaFin]);
      
      return result.rows[0];
      
    } catch (error) {
      throw error;
    }
  }

  static async limpiarCodigosExpirados() {
    try {
      const pool = require('../config/database');
      
      const query = `
        UPDATE codigos_pago
        SET cod_estado = 'EXPIRADO'
        WHERE cod_estado = 'ACTIVO'
          AND cod_fecha_expiracion < NOW()
        RETURNING cod_id
      `;
      
      const result = await pool.query(query);
      
      return {
        codigosExpirados: result.rowCount,
        mensaje: `Se expiraron ${result.rowCount} códigos`
      };
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CodigoService;

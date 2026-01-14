const pool = require('../config/database');
const Usuario = require('../models/Usuario');
const CodigoPago = require('../models/CodigoPago');

class TransaccionService {
  static async procesarPagoConCodigo(codigoPago, usuarioId, pin) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Verificar PIN del usuario
      const usuarioQuery = 'SELECT * FROM usuarios WHERE usu_id = $1';
      const usuarioResult = await client.query(usuarioQuery, [usuarioId]);
      const usuario = usuarioResult.rows[0];
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      const pinValido = await Usuario.verificarPin(pin, usuario.usu_pin_hash);
      if (!pinValido) {
        await this.registrarIntento(codigoPago, usuarioId, 'PIN_INVALIDO', 'PIN incorrecto', client);
        throw new Error('PIN incorrecto');
      }
      
      // 2. Validar código nuevamente (dentro de la transacción)
      const codigoValido = await CodigoPago.validarCodigo(codigoPago);
      if (!codigoValido) {
        await this.registrarIntento(codigoPago, usuarioId, 'CODIGO_INVALIDO', 'Código inválido o expirado', client);
        throw new Error('Código inválido o expirado');
      }
      
      // 3. Verificar saldo suficiente
      const saldoActual = parseFloat(usuario.usu_saldo);
      const monto = parseFloat(codigoValido.cod_monto);
      
      if (saldoActual < monto) {
        await this.registrarIntento(codigoPago, usuarioId, 'SALDO_INSUFICIENTE', 'Saldo insuficiente', client);
        throw new Error('Saldo insuficiente');
      }
      
      // 4. Actualizar saldo del usuario
      const nuevoSaldo = saldoActual - monto;
      await Usuario.actualizarSaldo(usuarioId, nuevoSaldo, client);
      
      // 5. Marcar código como usado
      await CodigoPago.marcarComoUsado(codigoValido.cod_id, usuarioId);
      
      // 6. Crear transacción
      const transaccionQuery = `
        INSERT INTO transacciones (
          tra_codigo_pago_id, tra_usuario_origen_id, tra_negocio_destino_id,
          tra_monto, tra_descripcion, tra_saldo_anterior_origen, tra_saldo_nuevo_origen
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const transaccionResult = await client.query(transaccionQuery, [
        codigoValido.cod_id,
        usuarioId,
        codigoValido.cod_negocio_id,
        monto,
        codigoValido.cod_descripcion || 'Pago con código único',
        saldoActual,
        nuevoSaldo
      ]);
      
      // 7. Registrar intento exitoso
      await this.registrarIntento(codigoPago, usuarioId, 'EXITOSO', 'Pago completado', client);
      
      await client.query('COMMIT');
      
      return {
        success: true,
        transaccion: transaccionResult.rows[0],
        nuevoSaldo: nuevoSaldo,
        negocio: {
          nombre: codigoValido.neg_nombre_comercial,
          razonSocial: codigoValido.neg_razon_social
        }
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async registrarIntento(codigo, usuarioId, resultado, mensaje, client = null) {
    const db = client || pool;
    const query = `
      INSERT INTO intentos_pago (int_codigo, int_usuario_id, int_resultado, int_mensaje)
      VALUES ($1, $2, $3, $4)
    `;
    await db.query(query, [codigo, usuarioId, resultado, mensaje]);
  }

  static async obtenerHistorial(usuarioId, limit = 20) {
    const query = `
      SELECT t.*, n.neg_nombre_comercial, n.neg_razon_social, n.neg_logo_url
      FROM transacciones t
      INNER JOIN negocios n ON t.tra_negocio_destino_id = n.neg_id
      WHERE t.tra_usuario_origen_id = $1
      ORDER BY t.tra_fecha_hora DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [usuarioId, limit]);
    return result.rows;
  }
}

module.exports = TransaccionService;

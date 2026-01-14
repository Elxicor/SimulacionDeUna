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
      
      if (!usuario.usu_activo) {
        throw new Error('Usuario inactivo');
      }
      
      const pinValido = await Usuario.verificarPin(pin, usuario.usu_pin_hash);
      if (!pinValido) {
        await this.registrarIntento(codigoPago, usuarioId, 'PIN_INVALIDO', 'PIN incorrecto', client);
        throw new Error('PIN incorrecto');
      }
      
      // 2. Validar código nuevamente (dentro de la transacción)
      const codigoValidoQuery = `
        SELECT cp.*, n.neg_nombre_comercial, n.neg_razon_social, n.neg_usuario_id,
               cp.cod_usuario_generador_id
        FROM codigos_pago cp
        INNER JOIN negocios n ON cp.cod_negocio_id = n.neg_id
        WHERE cp.cod_codigo = $1
        AND cp.cod_estado = 'ACTIVO'
        AND cp.cod_fecha_expiracion > NOW()
        FOR UPDATE
      `;
      const codigoResult = await client.query(codigoValidoQuery, [codigoPago]);
      const codigoValido = codigoResult.rows[0];
      
      if (!codigoValido) {
        await this.registrarIntento(codigoPago, usuarioId, 'CODIGO_INVALIDO', 'Código inválido o expirado', client);
        throw new Error('Código inválido o expirado');
      }
      
      console.log('📋 Código validado:', {
        codigo: codigoValido.cod_codigo,
        usuarioGenerador: codigoValido.cod_usuario_generador_id,
        usuarioDuenoNegocio: codigoValido.neg_usuario_id,
        negocioId: codigoValido.cod_negocio_id
      });
      
      // 3. Verificar saldo suficiente
      const saldoActual = parseFloat(usuario.usu_saldo);
      const monto = parseFloat(codigoValido.cod_monto);
      
      if (saldoActual < monto) {
        await this.registrarIntento(codigoPago, usuarioId, 'SALDO_INSUFICIENTE', 'Saldo insuficiente', client);
        throw new Error('Saldo insuficiente');
      }
      
      // 4. Actualizar saldo del usuario que paga
      const nuevoSaldo = saldoActual - monto;
      const actualizarSaldoQuery = `
        UPDATE usuarios 
        SET usu_saldo = $2 
        WHERE usu_id = $1
        RETURNING usu_saldo
      `;
      await client.query(actualizarSaldoQuery, [usuarioId, nuevoSaldo]);
      
      // 4.1 Incrementar saldo del usuario que generó el código (quien recibe el pago)
      // Prioridad: cod_usuario_generador_id > neg_usuario_id
      const usuarioReceptorId = codigoValido.cod_usuario_generador_id || codigoValido.neg_usuario_id;
      
      if (usuarioReceptorId && usuarioReceptorId !== usuarioId) {
        const saldoReceptorQuery = 'SELECT usu_saldo FROM usuarios WHERE usu_id = $1';
        const saldoReceptorResult = await client.query(saldoReceptorQuery, [usuarioReceptorId]);
        
        if (saldoReceptorResult.rows.length > 0) {
          const saldoReceptorActual = parseFloat(saldoReceptorResult.rows[0].usu_saldo || 0);
          const nuevoSaldoReceptor = saldoReceptorActual + monto;
          
          const actualizarSaldoReceptorQuery = `
            UPDATE usuarios 
            SET usu_saldo = $2 
            WHERE usu_id = $1
          `;
          await client.query(actualizarSaldoReceptorQuery, [usuarioReceptorId, nuevoSaldoReceptor]);
          console.log(`✅ Saldo incrementado para usuario ${usuarioReceptorId}: $${nuevoSaldoReceptor.toFixed(2)}`);
        }
      }
      
      // 5. Marcar código como usado
      const marcarUsadoQuery = `
        UPDATE codigos_pago
        SET cod_estado = 'USADO',
            cod_usuario_pagador_id = $2,
            cod_fecha_pago = NOW()
        WHERE cod_id = $1
        RETURNING *
      `;
      await client.query(marcarUsadoQuery, [codigoValido.cod_id, usuarioId]);
      
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
      
      // Obtener código de referencia actualizado
      const codigoReferenciaQuery = `
        SELECT tra_codigo_referencia FROM transacciones WHERE tra_id = $1
      `;
      const refResult = await client.query(codigoReferenciaQuery, [transaccionResult.rows[0].tra_id]);
      transaccionResult.rows[0].tra_codigo_referencia = refResult.rows[0].tra_codigo_referencia;
      
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

  static async obtenerDetalleTransaccion(transaccionId) {
    const query = `
      SELECT t.*,
             u.usu_nombre, u.usu_apellido, u.usu_cedula, u.usu_email,
             n.neg_nombre_comercial, n.neg_razon_social, n.neg_ruc, n.neg_logo_url,
             cp.cod_codigo
      FROM transacciones t
      INNER JOIN usuarios u ON t.tra_usuario_origen_id = u.usu_id
      INNER JOIN negocios n ON t.tra_negocio_destino_id = n.neg_id
      LEFT JOIN codigos_pago cp ON t.tra_codigo_pago_id = cp.cod_id
      WHERE t.tra_id = $1
    `;
    const result = await pool.query(query, [transaccionId]);
    return result.rows[0];
  }

  static async obtenerEstadisticasUsuario(usuarioId, fechaInicio, fechaFin) {
    const query = `
      SELECT 
        COUNT(*) as total_transacciones,
        SUM(tra_monto) as total_gastado,
        AVG(tra_monto) as promedio_gasto,
        MIN(tra_monto) as gasto_minimo,
        MAX(tra_monto) as gasto_maximo
      FROM transacciones
      WHERE tra_usuario_origen_id = $1
        AND tra_estado = 'COMPLETADO'
        AND tra_fecha_hora BETWEEN $2 AND $3
    `;
    const result = await pool.query(query, [usuarioId, fechaInicio, fechaFin]);
    return result.rows[0];
  }
}

module.exports = TransaccionService;

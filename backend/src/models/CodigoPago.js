const pool = require('../config/database');

class CodigoPago {
  static async crear(negocioId, monto, descripcion = '', usuarioGeneradorId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Generar código único
      const codigoResult = await client.query('SELECT generar_codigo_unico() as codigo');
      const codigo = codigoResult.rows[0].codigo;
      
      // Calcular fecha de expiración (3 minutos)
      const minutosExpiracion = process.env.CODIGO_EXPIRATION_MINUTES || 3;
      
      // Verificar si la tabla tiene la columna cod_usuario_generador_id
      const checkColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='codigos_pago' AND column_name='cod_usuario_generador_id'
      `;
      const columnExists = await client.query(checkColumnQuery);
      
      let query, values;
      if (columnExists.rows.length > 0 && usuarioGeneradorId) {
        query = `
          INSERT INTO codigos_pago (
            cod_codigo, cod_negocio_id, cod_monto, cod_descripcion,
            cod_fecha_expiracion, cod_usuario_generador_id
          )
          VALUES ($1, $2, $3, $4, NOW() + INTERVAL '${minutosExpiracion} minutes', $5)
          RETURNING *
        `;
        values = [codigo, negocioId, monto, descripcion, usuarioGeneradorId];
      } else {
        query = `
          INSERT INTO codigos_pago (
            cod_codigo, cod_negocio_id, cod_monto, cod_descripcion,
            cod_fecha_expiracion
          )
          VALUES ($1, $2, $3, $4, NOW() + INTERVAL '${minutosExpiracion} minutes')
          RETURNING *
        `;
        values = [codigo, negocioId, monto, descripcion];
      }
      
      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async buscarPorCodigo(codigo) {
    const query = `
      SELECT cp.*, n.neg_nombre_comercial, n.neg_razon_social, n.neg_logo_url
      FROM codigos_pago cp
      INNER JOIN negocios n ON cp.cod_negocio_id = n.neg_id
      WHERE cp.cod_codigo = $1
    `;
    const result = await pool.query(query, [codigo]);
    return result.rows[0];
  }

  static async validarCodigo(codigo) {
    await pool.query('SELECT expirar_codigos_vencidos()');
    
    const query = `
      SELECT cp.*, n.neg_nombre_comercial, n.neg_razon_social
      FROM codigos_pago cp
      INNER JOIN negocios n ON cp.cod_negocio_id = n.neg_id
      WHERE cp.cod_codigo = $1
      AND cp.cod_estado = 'ACTIVO'
      AND cp.cod_fecha_expiracion > NOW()
    `;
    
    const result = await pool.query(query, [codigo]);
    return result.rows[0];
  }

  static async marcarComoUsado(codigoId, usuarioId) {
    const query = `
      UPDATE codigos_pago
      SET cod_estado = 'USADO',
          cod_usuario_pagador_id = $2,
          cod_fecha_pago = NOW()
      WHERE cod_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [codigoId, usuarioId]);
    return result.rows[0];
  }

  static async cancelar(codigoId) {
    const query = `
      UPDATE codigos_pago
      SET cod_estado = 'CANCELADO'
      WHERE cod_id = $1
      AND cod_estado = 'ACTIVO'
      RETURNING *
    `;
    const result = await pool.query(query, [codigoId]);
    return result.rows[0];
  }

  static async obtenerPorNegocio(negocioId, limit = 50) {
    const query = `
      SELECT *
      FROM codigos_pago
      WHERE cod_negocio_id = $1
      ORDER BY cod_fecha_generacion DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [negocioId, limit]);
    return result.rows;
  }
}

module.exports = CodigoPago;

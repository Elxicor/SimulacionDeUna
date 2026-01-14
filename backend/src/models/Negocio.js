const pool = require('../config/database');

class Negocio {
  static async crear(datos) {
    const { ruc, razonSocial, nombreComercial, telefono, email, direccion, categoria, usuarioId } = datos;
    
    const query = `
      INSERT INTO negocios (
        neg_ruc, neg_razon_social, neg_nombre_comercial, neg_telefono,
        neg_email, neg_direccion, neg_categoria, neg_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      ruc, razonSocial, nombreComercial, telefono, email, direccion, categoria, usuarioId
    ]);
    
    return result.rows[0];
  }

  static async buscarPorId(id) {
    const query = 'SELECT * FROM negocios WHERE neg_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async buscarPorRuc(ruc) {
    const query = 'SELECT * FROM negocios WHERE neg_ruc = $1';
    const result = await pool.query(query, [ruc]);
    return result.rows[0];
  }

  static async buscarPorUsuario(usuarioId) {
    const query = 'SELECT * FROM negocios WHERE neg_usuario_id = $1';
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  static async actualizar(id, datos) {
    const { nombreComercial, telefono, email, direccion, logoUrl } = datos;
    
    const query = `
      UPDATE negocios
      SET neg_nombre_comercial = COALESCE($2, neg_nombre_comercial),
          neg_telefono = COALESCE($3, neg_telefono),
          neg_email = COALESCE($4, neg_email),
          neg_direccion = COALESCE($5, neg_direccion),
          neg_logo_url = COALESCE($6, neg_logo_url)
      WHERE neg_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, nombreComercial, telefono, email, direccion, logoUrl]);
    return result.rows[0];
  }

  static async obtenerTodos(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM negocios
      WHERE neg_activo = true
      ORDER BY neg_fecha_registro DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = Negocio;

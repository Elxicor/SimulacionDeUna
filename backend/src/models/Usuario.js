const pool = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  static async crear(datos) {
    const { cedula, nombre, apellido, telefono, email, password, pin } = datos;
    
    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);
    
    const query = `
      INSERT INTO usuarios (
        usu_cedula, usu_nombre, usu_apellido, usu_telefono, 
        usu_email, usu_password_hash, usu_pin_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING usu_id, usu_cedula, usu_nombre, usu_apellido, 
                usu_telefono, usu_email, usu_saldo, usu_fecha_registro
    `;
    
    const result = await pool.query(query, [
      cedula, nombre, apellido, telefono, email, passwordHash, pinHash
    ]);
    
    return result.rows[0];
  }

  static async buscarPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE usu_email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async buscarPorCedula(cedula) {
    const query = 'SELECT * FROM usuarios WHERE usu_cedula = $1';
    const result = await pool.query(query, [cedula]);
    return result.rows[0];
  }

  static async buscarPorId(id) {
    const query = `
      SELECT usu_id, usu_cedula, usu_nombre, usu_apellido, 
             usu_telefono, usu_email, usu_saldo, usu_activo,
             usu_fecha_registro, usu_ultimo_acceso
      FROM usuarios 
      WHERE usu_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verificarPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async verificarPin(pin, hash) {
    return await bcrypt.compare(pin, hash);
  }

  static async actualizarUltimoAcceso(id) {
    const query = 'UPDATE usuarios SET usu_ultimo_acceso = NOW() WHERE usu_id = $1';
    await pool.query(query, [id]);
  }

  static async obtenerSaldo(id) {
    const query = 'SELECT usu_saldo FROM usuarios WHERE usu_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0]?.usu_saldo || 0;
  }

  static async actualizarSaldo(id, nuevoSaldo, client = null) {
    const db = client || pool;
    const query = `
      UPDATE usuarios 
      SET usu_saldo = $2 
      WHERE usu_id = $1
      RETURNING usu_saldo
    `;
    const result = await db.query(query, [id, nuevoSaldo]);
    return result.rows[0];
  }
}

module.exports = Usuario;

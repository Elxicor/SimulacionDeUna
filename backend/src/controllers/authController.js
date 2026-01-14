const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

class AuthController {
  static async registrar(req, res) {
    try {
      const { cedula, nombre, apellido, telefono, email, password, pin } = req.body;
      
      // Validaciones básicas
      if (!cedula || !nombre || !apellido || !telefono || !email || !password || !pin) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }
      
      if (pin.length !== 4) {
        return res.status(400).json({
          success: false,
          message: 'El PIN debe tener 4 dígitos'
        });
      }
      
      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
      
      const cedulaExistente = await Usuario.buscarPorCedula(cedula);
      if (cedulaExistente) {
        return res.status(409).json({
          success: false,
          message: 'La cédula ya está registrada'
        });
      }
      
      // Crear usuario
      const nuevoUsuario = await Usuario.crear({
        cedula, nombre, apellido, telefono, email, password, pin
      });
      
      // Generar token
      const token = jwt.sign(
        { id: nuevoUsuario.usu_id, email: nuevoUsuario.usu_email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          usuario: nuevoUsuario,
          token
        }
      });
      
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }
      
      // Buscar usuario
      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Verificar contraseña
      const passwordValido = await Usuario.verificarPassword(password, usuario.usu_password_hash);
      if (!passwordValido) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Actualizar último acceso
      await Usuario.actualizarUltimoAcceso(usuario.usu_id);
      
      // Generar token
      const token = jwt.sign(
        { id: usuario.usu_id, email: usuario.usu_email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Remover campos sensibles
      delete usuario.usu_password_hash;
      delete usuario.usu_pin_hash;
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          usuario,
          token
        }
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión'
      });
    }
  }

  static async verificarToken(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuario.id);
      
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
      console.error('Error al verificar token:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar token'
      });
    }
  }
}

module.exports = AuthController;

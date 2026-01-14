const { body, validationResult } = require('express-validator');

// Validación para registro
const validarRegistro = [
  body('cedula')
    .isLength({ min: 10, max: 10 })
    .withMessage('La cédula debe tener 10 dígitos')
    .isNumeric()
    .withMessage('La cédula debe contener solo números'),
  
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('apellido')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  
  body('telefono')
    .isLength({ min: 10, max: 10 })
    .withMessage('El teléfono debe tener 10 dígitos')
    .matches(/^09\d{8}$/)
    .withMessage('El teléfono debe comenzar con 09'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('pin')
    .isLength({ min: 4, max: 4 })
    .withMessage('El PIN debe tener 4 dígitos')
    .isNumeric()
    .withMessage('El PIN debe contener solo números'),
];

// Validación para login
const validarLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// Validación para generar código
const validarGenerarCodigo = [
  body('negocioId')
    .isInt({ min: 1 })
    .withMessage('ID de negocio inválido'),
  
  body('monto')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
];

// Validación para pagar con código
const validarPagarCodigo = [
  body('codigo')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos')
    .isNumeric()
    .withMessage('El código debe contener solo números'),
  
  body('pin')
    .isLength({ min: 4, max: 4 })
    .withMessage('El PIN debe tener 4 dígitos')
    .isNumeric()
    .withMessage('El PIN debe contener solo números'),
];

// Middleware para manejar errores de validación
const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores.array()
    });
  }
  
  next();
};

module.exports = {
  validarRegistro,
  validarLogin,
  validarGenerarCodigo,
  validarPagarCodigo,
  manejarErroresValidacion
};

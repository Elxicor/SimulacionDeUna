// Validar cédula ecuatoriana
export const validarCedulaEcuatoriana = (cedula) => {
  if (!cedula || cedula.length !== 10) return false;
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(cedula)) return false;
  
  // Validar provincia (primeros 2 dígitos)
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  // Algoritmo de validación
  const digitoVerificador = parseInt(cedula.charAt(9));
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  
  const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  return resultado === digitoVerificador;
};

// Validar RUC ecuatoriano
export const validarRucEcuatoriano = (ruc) => {
  if (!ruc || ruc.length !== 13) return false;
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(ruc)) return false;
  
  // Los últimos 3 dígitos deben ser 001
  if (ruc.substring(10, 13) !== '001') return false;
  
  const tercerDigito = parseInt(ruc.charAt(2));
  
  // RUC persona natural (tercer dígito < 6)
  if (tercerDigito < 6) {
    return validarCedulaEcuatoriana(ruc.substring(0, 10));
  }
  
  // RUC sociedad privada (tercer dígito = 9)
  if (tercerDigito === 9) {
    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
      suma += parseInt(ruc.charAt(i)) * coeficientes[i];
    }
    
    const residuo = suma % 11;
    const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
    
    return digitoVerificador === parseInt(ruc.charAt(9));
  }
  
  // RUC sociedad pública (tercer dígito = 6)
  if (tercerDigito === 6) {
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    
    for (let i = 0; i < 8; i++) {
      suma += parseInt(ruc.charAt(i)) * coeficientes[i];
    }
    
    const residuo = suma % 11;
    const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
    
    return digitoVerificador === parseInt(ruc.charAt(8));
  }
  
  return false;
};

// Validar teléfono ecuatoriano
export const validarTelefonoEcuatoriano = (telefono) => {
  if (!telefono || telefono.length !== 10) return false;
  
  // Debe empezar con 09 y contener solo números
  return /^09\d{8}$/.test(telefono);
};

// Validar email
export const validarEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar código de 6 dígitos
export const validarCodigo = (codigo) => {
  if (!codigo || codigo.length !== 6) return false;
  
  return /^\d{6}$/.test(codigo);
};

// Validar PIN de 4 dígitos
export const validarPin = (pin) => {
  if (!pin || pin.length !== 4) return false;
  
  return /^\d{4}$/.test(pin);
};

// Validar monto
export const validarMonto = (monto) => {
  const montoNum = parseFloat(monto);
  
  if (isNaN(montoNum)) return false;
  if (montoNum <= 0) return false;
  if (montoNum > 10000) return false;
  
  return true;
};

// Formatear cédula con guiones
export const formatearCedula = (cedula) => {
  if (!cedula || cedula.length !== 10) return cedula;
  
  return `${cedula.substring(0, 2)}-${cedula.substring(2, 6)}-${cedula.substring(6, 10)}`;
};

// Formatear teléfono
export const formatearTelefono = (telefono) => {
  if (!telefono || telefono.length !== 10) return telefono;
  
  return `${telefono.substring(0, 4)}-${telefono.substring(4, 7)}-${telefono.substring(7, 10)}`;
};

// Validar contraseña segura
export const validarPasswordSegura = (password) => {
  if (!password || password.length < 6) return false;
  
  // Al menos una letra y un número
  const tieneLetra = /[a-zA-Z]/.test(password);
  const tieneNumero = /\d/.test(password);
  
  return tieneLetra && tieneNumero;
};

// Objeto con todos los validadores
const validators = {
  validarCedulaEcuatoriana,
  validarRucEcuatoriano,
  validarTelefonoEcuatoriano,
  validarEmail,
  validarCodigo,
  validarPin,
  validarMonto,
  formatearCedula,
  formatearTelefono,
  validarPasswordSegura
};

export default validators;

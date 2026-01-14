// Validar cédula ecuatoriana
const validarCedulaEcuatoriana = (cedula) => {
  if (cedula.length !== 10) return false;
  
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
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
const validarRucEcuatoriano = (ruc) => {
  if (ruc.length !== 13) return false;
  
  const tercerDigito = parseInt(ruc.charAt(2));
  
  // RUC persona natural
  if (tercerDigito < 6) {
    return validarCedulaEcuatoriana(ruc.substring(0, 10));
  }
  
  // RUC sociedad privada
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
  
  return false;
};

// Validar teléfono ecuatoriano
const validarTelefonoEcuatoriano = (telefono) => {
  return /^09\d{8}$/.test(telefono);
};

// Validar email
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

module.exports = {
  validarCedulaEcuatoriana,
  validarRucEcuatoriano,
  validarTelefonoEcuatoriano,
  validarEmail
};

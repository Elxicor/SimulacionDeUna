// Formatear monto a currency
const formatearMonto = (monto) => {
  return parseFloat(monto).toFixed(2);
};

// Generar código aleatorio
const generarCodigoAleatorio = (longitud = 6) => {
  return Math.floor(Math.random() * Math.pow(10, longitud))
    .toString()
    .padStart(longitud, '0');
};

// Calcular tiempo restante en segundos
const calcularTiempoRestante = (fechaExpiracion) => {
  const ahora = new Date();
  const expiracion = new Date(fechaExpiracion);
  const diferencia = expiracion - ahora;
  return Math.max(0, Math.floor(diferencia / 1000));
};

// Formatear fecha
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Generar código de referencia único
const generarCodigoReferencia = (prefijoTipo = 'TRX') => {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const aleatorio = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefijoTipo}${fecha}${aleatorio}`;
};

module.exports = {
  formatearMonto,
  generarCodigoAleatorio,
  calcularTiempoRestante,
  formatearFecha,
  generarCodigoReferencia
};

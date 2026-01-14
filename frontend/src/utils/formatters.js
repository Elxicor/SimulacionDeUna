export const formatearMonto = (monto) => {
  return parseFloat(monto).toFixed(2);
};

export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatearFechaCompleta = (fecha) => {
  return new Date(fecha).toLocaleString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

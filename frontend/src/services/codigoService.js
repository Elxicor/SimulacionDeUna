import api from './api';

export const codigoService = {
  async generar(negocioId, monto, descripcion) {
    const response = await api.post('/codigos/generar', {
      negocioId,
      monto,
      descripcion
    });
    return response.data;
  },

  async validar(codigo) {
    const response = await api.get(`/codigos/validar/${codigo}`);
    return response.data;
  },

  async pagar(codigo, pin) {
    const response = await api.post('/codigos/pagar', {
      codigo,
      pin
    });
    return response.data;
  },

  async cancelar(codigoId) {
    const response = await api.put(`/codigos/cancelar/${codigoId}`);
    return response.data;
  },

  async obtenerPorNegocio(negocioId, limit = 50) {
    const response = await api.get(`/codigos/negocio/${negocioId}`, {
      params: { limit }
    });
    return response.data;
  }
};

import api from './api';

export const authService = {
  async registrar(datos) {
    const response = await api.post('/auth/registrar', datos);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
    }
    return response.data;
  },

  async verificarToken() {
    const response = await api.get('/auth/verificar');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  },

  getUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

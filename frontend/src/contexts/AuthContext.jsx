import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.verificarToken();
        if (response.success) {
          setUsuario(response.data.usuario);
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setUsuario(response.data.usuario);
    }
    return response;
  };

  const registrar = async (datos) => {
    const response = await authService.registrar(datos);
    if (response.success) {
      setUsuario(response.data.usuario);
    }
    return response;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

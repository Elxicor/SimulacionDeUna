import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiCreditCard, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const { registrar } = useAuth();
  
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    pin: '',
    confirmarPin: ''
  });
  
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPin, setMostrarPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones en tiempo real
    if (name === 'cedula' && value.length > 10) return;
    if (name === 'telefono' && value.length > 10) return;
    if (name === 'pin' && value.length > 4) return;
    if (name === 'confirmarPin' && value.length > 4) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validarFormulario = () => {
    if (formData.cedula.length !== 10) {
      toast.error('La cédula debe tener 10 dígitos');
      return false;
    }
    
    if (formData.telefono.length !== 10) {
      toast.error('El teléfono debe tener 10 dígitos');
      return false;
    }
    
    if (!formData.telefono.startsWith('09')) {
      toast.error('El teléfono debe comenzar con 09');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    
    if (formData.pin.length !== 4) {
      toast.error('El PIN debe tener 4 dígitos');
      return false;
    }
    
    if (formData.pin !== formData.confirmarPin) {
      toast.error('Los PINs no coinciden');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const datos = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email,
        password: formData.password,
        pin: formData.pin
      };
      
      const response = await registrar(datos);
      
      if (response.success) {
        toast.success('¡Cuenta creada exitosamente!');
        navigate('/pago');
      }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al registrar usuario';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Crear cuenta
          </h1>
          <p className="text-gray-600">
            Completa tus datos para registrarte
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cédula */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Cédula
              </label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="1234567890"
                  disabled={loading}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Nombre
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="Juan"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Apellido
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="Pérez"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Teléfono
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="0987654321"
                  disabled={loading}
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contraseña */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Confirmar contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="confirmarPassword"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                PIN (4 dígitos)
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={mostrarPin ? 'text' : 'password'}
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  inputMode="numeric"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="••••"
                  disabled={loading}
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPin(!mostrarPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarPin ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar PIN */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Confirmar PIN
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={mostrarPin ? 'text' : 'password'}
                  name="confirmarPin"
                  value={formData.confirmarPin}
                  onChange={handleChange}
                  inputMode="numeric"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="••••"
                  disabled={loading}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition shadow-lg mt-6"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </div>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

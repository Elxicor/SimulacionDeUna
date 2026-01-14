import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { codigoService } from '../../services/codigoService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiLock, FiClock, FiCheckCircle } from 'react-icons/fi';

const ConfirmarPago = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);

  const { codigo, datosTransaccion } = location.state || {};

  useEffect(() => {
    if (!codigo || !datosTransaccion) {
      navigate('/pago');
      return;
    }

    // Contador regresivo
    if (datosTransaccion.segundosRestantes) {
      setTiempoRestante(datosTransaccion.segundosRestantes);
      
      const interval = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            toast.error('El código ha expirado');
            navigate('/pago');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [codigo, datosTransaccion, navigate]);

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const pinCompleto = pin.join('');
    if (pinCompleto.length !== 4) {
      toast.error('Ingresa tu PIN de 4 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await codigoService.pagar(codigo, pinCompleto);
      
      if (response.success) {
        toast.success('¡Pago realizado exitosamente!');
        navigate('/pago/resultado', {
          state: {
            resultado: response.data
          }
        });
      }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al procesar el pago';
      toast.error(mensaje);
      
      // Limpiar PIN en caso de error
      setPin(['', '', '', '']);
      document.getElementById('pin-0').focus();
    } finally {
      setLoading(false);
    }
  };

  const formatTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  if (!datosTransaccion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Confirmar pago
          </h1>
        </div>

        {/* Tiempo restante */}
        {tiempoRestante !== null && (
          <div className={`rounded-lg p-4 mb-6 flex items-center justify-center gap-2 ${
            tiempoRestante < 60 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <FiClock className={tiempoRestante < 60 ? 'text-red-600' : 'text-blue-600'} />
            <span className={`font-bold ${tiempoRestante < 60 ? 'text-red-700' : 'text-blue-700'}`}>
              Tiempo restante: {formatTiempo(tiempoRestante)}
            </span>
          </div>
        )}

        {/* Detalles de la transacción */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Negocio</span>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{datosTransaccion.negocio.nombre}</p>
              <p className="text-sm text-gray-500">{datosTransaccion.negocio.razonSocial}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Código</span>
              <span className="font-mono font-semibold text-gray-800">{codigo}</span>
            </div>
          </div>

          {datosTransaccion.descripcion && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Descripción</span>
                <span className="text-gray-800 text-right">{datosTransaccion.descripcion}</span>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monto a pagar</span>
              <span className="text-3xl font-bold text-primary-600">
                ${parseFloat(datosTransaccion.monto).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saldo actual</span>
              <span className="font-semibold text-gray-800">
                ${parseFloat(usuario.usu_saldo).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* PIN */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3 flex items-center gap-2">
              <FiLock />
              Ingresa tu PIN para confirmar
            </label>
            <div className="flex justify-center gap-3">
              {pin.map((digito, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digito}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || pin.join('').length !== 4}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              'Confirmar pago'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/pago')}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarPago;

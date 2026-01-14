import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { codigoService } from '../../services/codigoService';
import toast from 'react-hot-toast';
import { FiDollarSign, FiFileText, FiCopy, FiClock, FiCheckCircle } from 'react-icons/fi';
import Header from '../common/Header';

const GenerarCodigo = () => {
  const { usuario } = useAuth();
  
  const [formData, setFormData] = useState({
    negocioId: 1, // Por defecto el primer negocio
    monto: '',
    descripcion: ''
  });
  
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    if (parseFloat(formData.monto) > 10000) {
      toast.error('El monto máximo es $10,000');
      return;
    }

    setLoading(true);
    try {
      const response = await codigoService.generar(
        formData.negocioId,
        parseFloat(formData.monto),
        formData.descripcion
      );
      
      if (response.success) {
        setCodigoGenerado(response.data);
        toast.success('¡Código generado exitosamente!');
        
        // Iniciar contador regresivo
        const minutosExpiracion = response.data.minutosExpiracion || 3;
        setTiempoRestante(minutosExpiracion * 60);
        
        const interval = setInterval(() => {
          setTiempoRestante(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              toast.error('El código ha expirado');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Limpiar formulario
        setFormData({
          negocioId: formData.negocioId,
          monto: '',
          descripcion: ''
        });
      }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al generar código';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = () => {
    if (codigoGenerado?.codigo) {
      navigator.clipboard.writeText(codigoGenerado.codigo);
      toast.success('Código copiado al portapapeles');
    }
  };

  const formatTiempo = (segundos) => {
    if (segundos === null) return '--:--';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const nuevoCodigo = () => {
    setCodigoGenerado(null);
    setTiempoRestante(null);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Generar código de pago
          </h1>
          <p className="text-gray-600">
            Crea un código único para que tus clientes puedan pagar
          </p>
        </div>

        {!codigoGenerado ? (
          // Formulario para generar código
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monto */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Monto a cobrar *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  max="10000"
                  className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  placeholder="0.00"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Monto máximo: $10,000.00
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Descripción (opcional)
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-4 text-gray-400" size={20} />
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  maxLength={255}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition resize-none"
                  placeholder="Ej: Compra de productos, servicio, etc."
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.descripcion.length}/255 caracteres
              </p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <FiClock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  El código expira en 3 minutos
                </p>
                <p className="text-sm text-blue-700">
                  Una vez generado, tu cliente tendrá 3 minutos para completar el pago.
                </p>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition shadow-lg text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando código...
                </div>
              ) : (
                'Generar código'
              )}
            </button>
          </form>
        ) : (
          // Mostrar código generado
          <div className="space-y-6">
            {/* Código */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-white" size={32} />
              </div>
              
              <p className="text-gray-600 mb-2 font-medium">Código de pago</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-6xl font-bold text-gray-800 font-mono tracking-wider">
                  {codigoGenerado.codigo}
                </span>
                <button
                  onClick={copiarCodigo}
                  className="p-3 bg-white hover:bg-gray-50 rounded-lg transition shadow-md"
                  title="Copiar código"
                >
                  <FiCopy className="text-primary-600" size={24} />
                </button>
              </div>
              
              {/* Tiempo restante */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                tiempoRestante <= 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <FiClock size={20} />
                <span className="font-bold text-lg">
                  Expira en: {formatTiempo(tiempoRestante)}
                </span>
              </div>
            </div>

            {/* Detalles */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto</span>
                <span className="text-3xl font-bold text-primary-600">
                  ${parseFloat(codigoGenerado.monto).toFixed(2)}
                </span>
              </div>
              
              {codigoGenerado.descripcion && (
                <>
                  <div className="border-t border-gray-200 pt-3">
                    <span className="text-gray-600 block mb-1">Descripción</span>
                    <span className="text-gray-800">{codigoGenerado.descripcion}</span>
                  </div>
                </>
              )}
            </div>

            {/* Instrucciones */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium mb-2">
                📱 Instrucciones para tu cliente:
              </p>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                <li>Ingresar a la app DeUna</li>
                <li>Seleccionar "Pagar con código"</li>
                <li>Escribir el código: <strong>{codigoGenerado.codigo}</strong></li>
                <li>Confirmar el pago con su PIN</li>
              </ol>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={nuevoCodigo}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl transition shadow-lg"
              >
                Generar nuevo código
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded-xl transition border-2 border-gray-200"
              >
                Imprimir código
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default GenerarCodigo;

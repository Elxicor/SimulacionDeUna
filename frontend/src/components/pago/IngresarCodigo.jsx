import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { codigoService } from '../../services/codigoService';
import toast from 'react-hot-toast';
import { FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import Header from '../common/Header';

const IngresarCodigo = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      document.getElementById(`codigo-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      document.getElementById(`codigo-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCodigo = pastedData.split('');
    while (newCodigo.length < 6) newCodigo.push('');
    setCodigo(newCodigo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const codigoCompleto = codigo.join('');
    if (codigoCompleto.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await codigoService.validar(codigoCompleto);
      
      if (response.success) {
        // Navegar a confirmación con los datos del código
        navigate('/pago/confirmar', {
          state: {
            codigo: codigoCompleto,
            datosTransaccion: response.data
          }
        });
      }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al validar código';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pagar con código
          </h1>
          <p className="text-gray-600">
            Ingresa el código de 6 dígitos que te dio el negocio
          </p>
        </div>

        {/* Alerta de tiempo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-800">
            El código tiene una duración de <strong>3 minutos</strong>. Ingrésalo rápidamente.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-8">
            {codigo.map((digito, index) => (
              <input
                key={index}
                id={`codigo-${index}`}
                type="text"
                maxLength={1}
                value={digito}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || codigo.join('').length !== 6}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validando...
              </>
            ) : (
              <>
                Continuar
                <FiArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/home')}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default IngresarCodigo;

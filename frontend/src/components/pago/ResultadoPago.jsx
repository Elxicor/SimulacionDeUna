import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiHome, FiDownload } from 'react-icons/fi';

const ResultadoPago = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { resultado } = location.state || {};

  if (!resultado) {
    navigate('/pago');
    return null;
  }

  const fecha = new Date(resultado.fecha);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Icono de éxito */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <FiCheckCircle className="text-green-600" size={60} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Pago exitoso!
          </h1>
          <p className="text-gray-600">
            Tu transacción se completó correctamente
          </p>
        </div>

        {/* Monto */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-2">Pagaste</p>
          <p className="text-5xl font-bold text-green-600">
            ${parseFloat(resultado.monto).toFixed(2)}
          </p>
        </div>

        {/* Detalles */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Negocio</span>
            <span className="font-semibold text-gray-800">{resultado.negocio.nombre}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Código de referencia</span>
            <span className="font-mono text-sm font-semibold text-gray-800">
              {resultado.codigoReferencia}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Fecha y hora</span>
            <span className="text-gray-800">
              {fecha.toLocaleDateString()} {fecha.toLocaleTimeString()}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nuevo saldo</span>
              <span className="text-2xl font-bold text-gray-800">
                ${parseFloat(resultado.nuevoSaldo).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/pago')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            <FiHome size={20} />
            Volver al inicio
          </button>

          <button
            onClick={() => window.print()}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 border-2 border-gray-200"
          >
            <FiDownload size={20} />
            Descargar comprobante
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultadoPago;

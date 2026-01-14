import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiUser, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isNegocioView = location.pathname.includes('/negocio');

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💳</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">DeUna</h1>
              <p className="text-xs text-gray-500">Sistema de pagos</p>
            </div>
          </div>

          {usuario && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {usuario.usu_nombre} {usuario.usu_apellido}
                </p>
                <p className="text-sm text-gray-600">
                  Saldo: ${parseFloat(usuario.usu_saldo || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Cerrar sesión"
              >
                <FiLogOut className="text-gray-600" size={20} />
              </button>
            </div>
          )}
        </div>

        {usuario && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate('/pago')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                !isNegocioView
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiCreditCard size={20} />
              Pagar
            </button>
            <button
              onClick={() => navigate('/negocio/generar-codigo')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                isNegocioView
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiDollarSign size={20} />
              Cobrar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

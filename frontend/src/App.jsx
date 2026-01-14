import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import IngresarCodigo from './components/pago/IngresarCodigo';
import ConfirmarPago from './components/pago/ConfirmarPago';
import ResultadoPago from './components/pago/ResultadoPago';
import GenerarCodigo from './components/negocio/GenerarCodigo';

const ProtectedRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return usuario ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/negocio/generar-codigo"
            element={
              <ProtectedRoute>
                <GenerarCodigo />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pago"
            element={
              <ProtectedRoute>
                <IngresarCodigo />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pago/confirmar"
            element={
              <ProtectedRoute>
                <ConfirmarPago />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pago/resultado"
            element={
              <ProtectedRoute>
                <ResultadoPago />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/pago" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

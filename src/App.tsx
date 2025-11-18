import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { AuthProvider } from './auth/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pending from './pages/Pending';
import DashboardAdmin from './pages/DashboardAdmin';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PMCInbox from './pages/PMCInbox';
import { Home } from './pages/Home';

// ✅ Crear un componente interno que use el hook useAuth
function AppRoutes() {
  const auth = useAuth();

  // Mostrar loading solo si hay token y estamos verificando
  if (auth.loading && localStorage.getItem('access')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 🆕 Ruta HOME como principal */}
      <Route path="/" element={<Home />} />
      
      {/* 🆕 Ruta HOME alternativa */}
      <Route path="/home" element={<Home />} />

      {/* 🆕 Rutas de autenticación */}
      <Route path="/login" element={<Login auth={auth} />} />
      <Route path="/signup" element={<Signup auth={auth} />} />
      <Route path="/pending" element={<Pending auth={auth} />} />

      {/* 🆕 Properties - AHORA ES PÚBLICO */}
      <Route path="/properties" element={<Properties />} />

      {/* 🆕 Property Detail - REQUIERE LOGIN */}
      <Route 
        path="/property/:id" 
        element={
          auth.user 
            ? <PropertyDetail /> 
            : <Navigate to="/properties" state={{ authRequired: true }} />
        }
      />

      {/* Admin panel - Solo para admin autenticado */}
      <Route 
        path="/admin" 
        element={
          auth.user?.role === 'admin' 
            ? <DashboardAdmin auth={auth} /> 
            : <Navigate to="/" />
        }
      />

      {/* PMC inbox - Solo para pmc/admin autenticado */}
      <Route 
        path="/pmc" 
        element={
          auth.user && ['pmc','admin'].includes(auth.user.role)
            ? <PMCInbox />
            : <Navigate to="/" />
        }
      />

      {/* Redirecciones para usuarios autenticados */}
      <Route 
        path="/dashboard" 
        element={
          auth.user?.role === 'admin'
            ? <Navigate to="/admin" />
            : auth.user?.role === 'pmc'
            ? <Navigate to="/pmc" />
            : <Navigate to="/properties" />
        }
      />

      {/* Catch-all: redirigir a home en lugar de properties */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider> 
      <BrowserRouter>
        <AppRoutes /> 
      </BrowserRouter>
    </AuthProvider>
  );
}
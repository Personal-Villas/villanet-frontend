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
import { About } from './pages/About';
import { Advisors } from './pages/Advisors';
import { PropertyManagers } from './pages/PropertyManagers';
import { AdvisorSignup } from './pages/AdvisorSignup';

// ✅ Componente interno que usa el hook useAuth
function AppRoutes() {
  const auth = useAuth();
  const token = localStorage.getItem('access');

  // ✅ Mostrar loading SOLO si hay token Y estamos verificando
  if (auth.loading && token) {
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
      {/* ✅ Rutas públicas - accesibles sin autenticación */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/for-travel-advisors" element={<Advisors />} />
      <Route path="/for-property-managers" element={<PropertyManagers />} />
      <Route path="/advisor-signup" element={<AdvisorSignup />} />
      {/* ✅ Rutas de autenticación */}
      <Route path="/login" element={<Login auth={auth} />} />
      <Route path="/signup" element={<Signup auth={auth} />} />
      <Route path="/pending" element={<Pending auth={auth} />} />

      {/* ✅ Properties - PÚBLICO (cualquiera puede ver el listado) */}
      <Route path="/properties" element={<Properties />} />

      {/* ✅ Property Detail - REQUIERE LOGIN para ver detalles */}
      <Route 
        path="/property/:id" 
        element={
          auth.user 
            ? <PropertyDetail /> 
            : <Navigate to="/login" state={{ from: window.location.pathname, authRequired: true }} />
        }
      />

      {/* ✅ Admin panel - Solo para admin autenticado */}
      <Route 
        path="/admin" 
        element={
          auth.user?.role === 'admin' 
            ? <DashboardAdmin auth={auth} /> 
            : <Navigate to="/" />
        }
      />

      {/* ✅ PMC inbox - Solo para pmc/admin autenticado */}
      <Route 
        path="/pmc" 
        element={
          auth.user && ['pmc', 'admin'].includes(auth.user.role)
            ? <PMCInbox />
            : <Navigate to="/" />
        }
      />

      {/* ✅ Redirecciones inteligentes según rol */}
      <Route 
        path="/dashboard" 
        element={
          auth.user?.role === 'admin'
            ? <Navigate to="/admin" replace />
            : auth.user?.role === 'pmc'
            ? <Navigate to="/pmc" replace />
            : <Navigate to="/properties" replace />
        }
      />

      {/* ✅ Catch-all: redirigir a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
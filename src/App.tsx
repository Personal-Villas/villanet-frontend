import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pending from './pages/Pending';
import DashboardAdmin from './pages/DashboardAdmin';
import ProtectedRoute from './auth/ProtectedRoute';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PMCInbox from './pages/PMCInbox';

export default function App() {
  const auth = useAuth();
  if (auth.loading) return <div className="p-10">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login auth={auth} />} />
        <Route path="/signup" element={<Signup auth={auth} />} />
        <Route path="/pending" element={<Pending auth={auth} />} />

        {/* Admin panel - maneja users, properties, partners, config */}
        <Route path="/admin" element={
          auth.user?.role === 'admin' ? <DashboardAdmin auth={auth} /> : <Navigate to="/" />
        }/>

        {/* Properties: admin/ta/pmc */}
        <Route path="/properties" element={
          auth.user && ['admin','ta','pmc'].includes(auth.user.role)
            ? <Properties />
            : <Navigate to="/login" />
        }/>

        {/* Property detail: property/:id */}
        <Route path="/property/:id" element={<PropertyDetail />} />

        {/* PMC inbox: pmc/admin */}
        <Route path="/pmc" element={
          auth.user && ['pmc','admin'].includes(auth.user.role)
            ? <PMCInbox />
            : <Navigate to="/login" />
        }/>

        {/* Home: redirige a algo útil según rol */}
        <Route path="/" element={
          <ProtectedRoute user={auth.user}>
            {auth.user?.role === 'admin'
              ? <Navigate to="/admin" />
              : auth.user?.role === 'pmc'
              ? <Navigate to="/pmc" />
              : <Navigate to="/properties" />}
          </ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
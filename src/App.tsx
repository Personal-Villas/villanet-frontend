import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pending from './pages/Pending';
import AdminUsers from './pages/DashboardAdmin';
import ProtectedRoute from './auth/ProtectedRoute';
import DashboardAdmin from './pages/DashboardAdmin';

export default function App() {
  const auth = useAuth();
  if (auth.loading) return <div className="p-10">Cargando...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login auth={auth} />} />
        <Route path="/signup" element={<Signup auth={auth} />} />
        <Route path="/pending" element={<Pending auth={auth} />} />
        <Route path="/admin/users" element={
          auth.user?.role === 'admin'
            ? <AdminUsers auth={auth} />
            : <Navigate to="/" />
        }/>
        <Route path="/" element={
          <ProtectedRoute user={auth.user}>
            <DashboardAdmin auth={auth}/>
          </ProtectedRoute>
        }/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

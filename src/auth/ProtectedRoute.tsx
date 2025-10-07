import { Navigate } from 'react-router-dom';
import { User } from './useAuth';

export default function ProtectedRoute({ user, children }: { user?: User; children: JSX.Element }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'pending') return <Navigate to="/pending" replace />;
  if (user.status === 'rejected') return <Navigate to="/pending" replace />;
  return children;
}

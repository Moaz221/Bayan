import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

const AdminRoute = ({ children }) => {
  const { loading, isAuthenticated, profile, isAdmin } = useAuth();

  if (loading) {
    return <LoadingScreen text="جاري تجهيز لوحة الإدارة..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <Navigate to="/pending" replace />;
  }

  if (!isAdmin) {
    if (profile?.is_active) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export default AdminRoute;

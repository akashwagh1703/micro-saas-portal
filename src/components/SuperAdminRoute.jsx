import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function SuperAdminRoute({ children }) {
  const user = useSelector((state) => state.auth.user);

  if (!user?.is_super_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

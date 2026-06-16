import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { logout, updateUser } from '../store/authSlice';
import PageLoader from './ui/PageLoader';

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [checking, setChecking] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    api
      .get('/auth/profile')
      .then((r) => {
        if (!cancelled && r.data?.user) {
          dispatch(updateUser(r.data.user));
        }
      })
      .catch((err) => {
        if (!cancelled && err.response?.status === 401) {
          dispatch(logout());
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (checking) {
    return <PageLoader message="Verifying session…" />;
  }

  return <Outlet />;
}

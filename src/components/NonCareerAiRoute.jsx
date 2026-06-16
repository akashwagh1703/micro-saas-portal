import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

export default function NonCareerAiRoute() {
  const { isCareerAi } = useOutletContext() || {};

  if (isCareerAi) {
    return <Navigate to="/career-ai" replace />;
  }

  return <Outlet />;
}

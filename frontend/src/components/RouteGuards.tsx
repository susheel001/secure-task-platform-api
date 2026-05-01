import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const FullscreenLoader = () => (
  <div className="screen-shell">
    <div className="loader-panel">
      <div className="loader-orbit" />
      <p>Restoring your workspace...</p>
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullscreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullscreenLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

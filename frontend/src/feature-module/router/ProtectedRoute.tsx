import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: JSX.Element;
  path: string;
  role: string | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, path, role }) => {
  if (path.startsWith('/admin') && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  if (path.startsWith('/providers') && role !== 'user') {
    return <Navigate to="/home" replace />;
  }
  return element;
};

export default ProtectedRoute;

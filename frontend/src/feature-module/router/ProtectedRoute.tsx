import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Route } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement; // Expecting a single element (Route or Component)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
        setRole(decodedToken.role); // Extract role from the decoded token
      } catch (error) {
        console.error('Error decoding token', error);
        setRole(null); // Set role to null if there's an error decoding the token
      }
    }
  }, []);

  // Show a loading screen while role is being fetched
  if (role === null) {
    return <div>Loading...</div>;
  }

  const location = useLocation();

  // Check if the user has the appropriate role based on the location
  if (location.pathname.startsWith('/admin') && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  if (location.pathname.startsWith('/providers') && role !== 'user') {
    return <Navigate to="/home" replace />;
  }

  return element; // Render the element (Route) if access is allowed
};

export default ProtectedRoute;

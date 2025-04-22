import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to handle authentication and role-based access
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - The children to render if authenticated
 * @param {string[]} [props.allowedRoles] - Optional array of allowed roles for this route
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Store the current path in localStorage
    localStorage.setItem('authRedirectPath', window.location.pathname);
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - blocks access if:
 * 1. User is not logged in → redirects to login page
 * 2. User's role is not in the allowedRoles list → redirects to their own dashboard
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Still loading auth state from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRedirects = {
      'Student': '/dashboard',
      'Club Lead': '/dashboard',
      'Organizer': '/organizer',
      'Teacher': '/teacher',
      'Admin': '/admin',
    };
    const redirectPath = roleRedirects[user.role] || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

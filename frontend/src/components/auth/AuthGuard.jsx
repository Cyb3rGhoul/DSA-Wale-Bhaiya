import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthGuard = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect to the intended destination or default to chat
    const from = location.state?.from?.pathname || '/chat';
    return <Navigate to={from} replace />;
  }

  // Render children if all conditions are met
  return children;
};

// Higher-order component for protecting routes
export const withAuthGuard = (Component, options = {}) => {
  return function AuthGuardedComponent(props) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

// Specific guards for common use cases
export const ProtectedRoute = ({ children }) => (
  <AuthGuard requireAuth={true} redirectTo="/login">
    {children}
  </AuthGuard>
);

export const PublicRoute = ({ children }) => (
  <AuthGuard requireAuth={false}>
    {children}
  </AuthGuard>
);

export const GuestOnlyRoute = ({ children }) => (
  <AuthGuard requireAuth={false} redirectTo="/chat">
    {children}
  </AuthGuard>
);

export default AuthGuard;
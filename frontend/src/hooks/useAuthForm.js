import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for handling authentication forms
 * Provides common functionality for login and registration forms
 */
export const useAuthForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const { login, register, clearError } = useAuth();

  const clearFormError = useCallback(() => {
    setFormError(null);
    clearError();
  }, [clearError]);

  const handleLogin = useCallback(async (email, password) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setFormError(result.message || 'Login failed');
        return { success: false, message: result.message };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [login]);

  const handleRegister = useCallback(async (userData) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const result = await register(userData);
      
      if (!result.success) {
        setFormError(result.message || 'Registration failed');
        return { success: false, message: result.message };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [register]);

  return {
    isSubmitting,
    formError,
    clearFormError,
    handleLogin,
    handleRegister
  };
};

/**
 * Custom hook for handling authentication redirects
 */
export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();

  const getRedirectPath = useCallback((location) => {
    // If user is trying to access a protected route, save it for after login
    if (location?.state?.from?.pathname) {
      return location.state.from.pathname;
    }
    
    // Default redirect based on authentication status
    return isAuthenticated ? '/chat' : '/login';
  }, [isAuthenticated]);

  const shouldRedirect = useCallback((requireAuth, currentPath) => {
    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return { shouldRedirect: true, redirectTo: '/login' };
    }
    
    // If user is authenticated but trying to access auth pages
    if (isAuthenticated && ['/login', '/register'].includes(currentPath)) {
      return { shouldRedirect: true, redirectTo: '/chat' };
    }
    
    return { shouldRedirect: false };
  }, [isAuthenticated]);

  return {
    getRedirectPath,
    shouldRedirect
  };
};

/**
 * Custom hook for handling user sessions
 */
export const useUserSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authService } = useAuth();

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.getSessions();
      if (response.success) {
        setSessions(response.data.sessions);
      } else {
        setError(response.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const refreshSessions = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    refreshSessions
  };
};

/**
 * Custom hook for form validation helpers
 */
export const useFormValidation = () => {
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  }, []);

  const validatePassword = useCallback((password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }
    return null;
  }, []);

  const validateName = useCallback((name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return null;
  }, []);

  const validatePasswordConfirmation = useCallback((password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }, []);

  return {
    validateEmail,
    validatePassword,
    validateName,
    validatePasswordConfirmation
  };
};
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false, // Start with false, not true
  error: null,
  hasCheckedAuth: false
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_AUTH_CHECKED: 'SET_AUTH_CHECKED' // Add new action
};

// Reducer function
const authReducer = (state, action) => {
  console.log('🔄 AuthReducer - Action:', action.type, 'Payload:', action.payload);
  console.log('🔄 AuthReducer - Current State:', state);
  
  let newState;
  
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      newState = {
        ...state,
        isLoading: action.payload
      };
      break;
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      newState = {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      };
      break;
    
    case AUTH_ACTIONS.LOGOUT:
      newState = {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      };
      break;
    
    case AUTH_ACTIONS.SET_ERROR:
      newState = {
        ...state,
        error: action.payload,
        isLoading: false
      };
      break;
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      newState = {
        ...state,
        error: null
      };
      break;
    
    case AUTH_ACTIONS.UPDATE_USER:
      newState = {
        ...state,
        user: { ...state.user, ...action.payload }
      };
      break;
    
    case AUTH_ACTIONS.SET_AUTH_CHECKED:
      newState = {
        ...state,
        hasCheckedAuth: true
      };
      break;
    
    default:
      newState = state;
  }
  
  console.log('🔄 AuthReducer - New State:', newState);
  return newState;
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hasInitialized = React.useRef(false);

  console.log('🔄 AuthProvider render - State:', state);

  // Check if user is authenticated on app load
  useEffect(() => {
    // Prevent multiple executions due to React.StrictMode
    if (hasInitialized.current) {
      console.log('⏭️ Already initialized, skipping');
      return;
    }
    hasInitialized.current = true;
    
    console.log('🔍 AuthContext useEffect triggered');
    
    // Check if there's a token and verify it
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token found:', !!token);
    
    if (token) {
      console.log('✅ Token found, checking auth status');
      checkAuthStatus();
    } else {
      console.log('❌ No token, marking as checked and not authenticated');
      // No token, mark as checked and set not authenticated
      dispatch({ type: AUTH_ACTIONS.SET_AUTH_CHECKED });
    }
  }, []); // Empty dependency array

  const checkAuthStatus = async () => {
    console.log('🚀 Starting auth check...');
    
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authService.getCurrentUser();
      console.log('✅ Auth check response:', response);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.data.user }
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // If auth check fails, clear token and mark as not authenticated
      localStorage.removeItem('accessToken');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: AUTH_ACTIONS.SET_AUTH_CHECKED });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(email, password);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.data.user }
        });
        toast.success(`Welcome back, ${response.data.user.name}!`);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: errorMessage
        });
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.data.user }
        });
        toast.success(`Welcome to DSA Brother Bot, ${response.data.user.name}!`);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Registration failed';
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: errorMessage
        });
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      toast('You have been logged out successfully', { icon: 'ℹ️' });
    } catch (error) {
      toast.error('Error during logout, but you have been logged out locally');
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } catch (error) {
      // Silent error handling for logout all
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    hasCheckedAuth: state.hasCheckedAuth, // Add this missing field
    
    // Actions
    login,
    register,
    logout,
    logoutAll,
    updateUser,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import LoggingService from '../services/loggingService';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    // Check if user is already logged in (token exists)
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data
  const loadUser = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      setToken(storedToken);
      const res = await authAPI.getProfile();
      setUser(res.data.data);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError('Authentication failed. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.register(userData);
      setError(null);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      const response = await authAPI.login(formData);
      
      if (response.data.success && response.data.token) {
        // Save token first
        localStorage.setItem('token', response.data.token);
        
        // Set user data
        const userData = response.data.user;
        setUser(userData);
        
        // Log the login action after user is set
        try {
          await LoggingService.logLogin(userData.id, true);
        } catch (logError) {
          console.error('Error logging login:', logError);
          // Don't fail login if logging fails
        }
        
        return {
          success: true,
          data: userData
        };
      }
      
      return { 
        success: false, 
        message: response.data.message || 'Invalid credentials'
      };
    } catch (error) {
      // Log failed login attempt
      try {
        await LoggingService.logLogin(null, false);
      } catch (logError) {
        console.error('Error logging failed login:', logError);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      const userId = user?._id;
      if (userId) {
        try {
          await LoggingService.logLogout(userId);
        } catch (logError) {
          console.error('Error logging logout:', logError);
        }
      }
      
      // Clear user data and token
      setUser(null);
      localStorage.removeItem('token');
      
      // Clear any other session data
      localStorage.removeItem('activitySessionStart');
      localStorage.removeItem('activitySessionActive');
      localStorage.removeItem('activityManuallyPaused');
      localStorage.removeItem('activityPageHiddenTime');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        setUser,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Store token
      localStorage.setItem('token', response.token);
      
      // Decode token to get user info (simple base64 decode)
      const tokenParts = response.token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      
      const userData = {
        email: payload.sub,
        roles: payload.roles || [],
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      // Normalize error message for invalid credentials
      let errorMessage = 'Invalid email or password';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.data) {
        // Use backend error message if available
        const backendError = error.response.data;
        if (typeof backendError === 'string') {
          errorMessage = backendError;
        } else {
          errorMessage = 'Invalid email or password';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed. Please try again.',
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

    // Check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
    };

    // Google Login function
    const googleLogin = async (idToken) => {
        try {
            const response = await authAPI.googleLogin(idToken);
            
            // Store token
            localStorage.setItem('token', response.token);
            
            // Decode token to get user info (simple base64 decode)
            const tokenParts = response.token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            
            const userData = {
                email: payload.sub,
                roles: payload.roles || [],
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            
            return { success: true, data: response };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || 'Google login failed. Please try again.',
            };
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        googleLogin,
        hasRole,
        hasAnyRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token is expired
            handleLogout();
            toast.error('Your session has expired. Please log in again.');
          } else {
            // Set auth header for all future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Fetch user profile
            const response = await api.get('/auth/profile');
            setCurrentUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLogin = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', accessToken);
      
      // Set auth header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setToken(accessToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { accessToken, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', accessToken);
      
      // Set auth header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setToken(accessToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      setCurrentUser(response.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

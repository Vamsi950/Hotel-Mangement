import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const API_URL = 'http://localhost:8080/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on startup
    const storedUser = localStorage.getItem('hotel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('hotel_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(`${API_URL}/register`, { name, email, password });
      // Automate login after registration
      return await login(email, password);
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed.';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotel_user');
  };

  const forgotPassword = async (email, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email, newPassword });
      return response.data?.message || 'Password updated!';
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update password.';
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    isAdmin: user?.role === 'ADMIN'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

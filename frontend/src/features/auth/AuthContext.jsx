// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Помилка під час завантаження даних користувача", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('themeMode');
    localStorage.removeItem('themeAccent');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const currentUserData = JSON.parse(localStorage.getItem('user')) || {};
    const updatedData = { ...currentUserData, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedData));
    setUser(updatedData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      updateUser, 
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
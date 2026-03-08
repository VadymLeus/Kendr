// frontend/src/app/providers/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('themeMode');
    localStorage.removeItem('themeAccent');
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userDataRaw = localStorage.getItem('user');
        if (token && userDataRaw && userDataRaw !== 'undefined' && userDataRaw !== 'null') {
          const parsedUser = JSON.parse(userDataRaw);
          setUser(parsedUser);
        } else {
          if (token || userDataRaw) {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             localStorage.removeItem('themeMode');
             localStorage.removeItem('themeAccent');
          }
        }
      } catch (error) {
        console.error("Помилка під час ініціалізації AuthContext:", error);
        localStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    const handleUnauthorized = () => {
      logout();
    };
    
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth_unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = (userData, token) => {
    if (!userData || !token) return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
    if (!userData) return;
    try {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    } catch (e) {
        console.error("Помилка при збереженні даних користувача", e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      updateUser, 
      isAdmin: user?.role === 'admin',
      plan: user?.plan || 'FREE',
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
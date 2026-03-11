// frontend/src/app/providers/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../../shared/api/api';

export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestorePending, setIsRestorePending] = useState(false);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('themeMode');
    localStorage.removeItem('themeAccent');
    localStorage.removeItem('isRestorePending');
    setIsRestorePending(false);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userDataRaw = localStorage.getItem('user');
        const restorePendingRaw = localStorage.getItem('isRestorePending');
        if (token && userDataRaw && userDataRaw !== 'undefined' && userDataRaw !== 'null') {
          const parsedUser = JSON.parse(userDataRaw);
          setUser(parsedUser);
          if (restorePendingRaw === 'true') {
            setIsRestorePending(true);
          }
        } else {
          if (token || userDataRaw || restorePendingRaw) {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             localStorage.removeItem('themeMode');
             localStorage.removeItem('themeAccent');
             localStorage.removeItem('isRestorePending');
          }
        }
      } catch (error) {
        console.error("Помилка під час ініціалізації AuthContext:", error);
        localStorage.clear();
        setUser(null);
        setIsRestorePending(false);
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

  const login = (userData, token, requireRestore = false) => {
    if (!userData || !token) return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (requireRestore) {
        localStorage.setItem('isRestorePending', 'true');
        setIsRestorePending(true);
    } else {
        localStorage.removeItem('isRestorePending');
        setIsRestorePending(false);
    }
    
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

  const restoreAccount = async () => {
    try {
        const response = await apiClient.post('/users/me/restore');
        login(response.data.user, response.data.token, false);
        return response.data;
    } catch (error) {
        console.error("Помилка відновлення акаунту:", error);
        throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isRestorePending,
      login, 
      logout, 
      updateUser, 
      restoreAccount,
      isAdmin: user?.role === 'admin',
      plan: user?.plan || 'FREE',
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
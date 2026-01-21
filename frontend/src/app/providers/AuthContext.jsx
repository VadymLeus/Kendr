// frontend/src/app/providers/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          }
        }
      } catch (error) {
        console.error("Помилка під час ініціалізації AuthContext:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    if (!userData || !token) return;
    
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
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
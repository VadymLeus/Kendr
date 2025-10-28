// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { CartProvider } from './features/cart/CartContext.jsx';
import { FavoritesProvider } from './features/favorites/FavoritesContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

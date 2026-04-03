// frontend/src/app/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './providers/AuthContext.jsx';
import { CartProvider } from './providers/CartContext.jsx';
import { FavoritesProvider } from './providers/FavoritesContext.jsx';
import { ThemeProvider } from './providers/ThemeContext.jsx';
import { ConfirmProvider } from './providers/ConfirmContext.jsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <FavoritesProvider>
                <ConfirmProvider>
                  <DndProvider backend={HTML5Backend}>
                    <App />
                  </DndProvider>
                </ConfirmProvider>
              </FavoritesProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { CartProvider } from './features/cart/CartContext.jsx';
import { FavoritesProvider } from './features/favorites/FavoritesContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <FavoritesProvider>
                        <App />
                    </FavoritesProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
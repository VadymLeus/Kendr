// frontend/src/features/cart/CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);

    // Ключ для localStorage тепер завжди залежить від ID користувача
    // Якщо користувача немає, ключ буде 'cart_null'
    const getCartKey = () => `cart_${user?.id || null}`;

    // Завантаження кошика при зміні користувача
    useEffect(() => {
        // Якщо користувача немає, очищуємо кошик і виходимо
        if (!user) {
            setCartItems([]);
            return;
        }
        
        const cartKey = getCartKey();
        try {
            const localData = localStorage.getItem(cartKey);
            setCartItems(localData ? JSON.parse(localData) : []);
        } catch (error) {
            console.error(`Помилка парсингу кошика (${cartKey})`, error);
            setCartItems([]);
        }
    }, [user]);

    // Збереження кошика при зміні його вмісту або користувача
    useEffect(() => {
        // Зберігаємо кошик, тільки якщо користувач авторизований
        if (user) {
            const cartKey = getCartKey();
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    // Додавання товару до кошика
    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                // Якщо товар вже є, збільшуємо кількість
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                // Якщо товару немає, додаємо його з кількістю 1
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
        alert(`Товар "${product.name}" додано до кошика!`);
    };

    // Видалення товару з кошика
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    // Оновлення кількості товару
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            // Якщо кількість 0 або менше, видаляємо товар
            removeFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    // Очищення кошика
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            updateQuantity 
        }}>
            {children}
        </CartContext.Provider>
    );
};
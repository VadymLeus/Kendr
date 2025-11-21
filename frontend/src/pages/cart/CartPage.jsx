// frontend/src/pages/cart/CartPage.jsx
import React, { useContext } from 'react';
import { CartContext } from '../../providers/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    
    const handleCheckout = async () => {
        try {
            await apiClient.post('/orders/checkout', { cartItems });
            
            alert('Дякуємо за покупку! Ваше замовлення успішно оформлено.');
            clearCart();
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Під час оформлення замовлення сталася помилка.');
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const cartItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        marginBottom: '1rem',
        background: 'var(--platform-card-bg)'
    };

    const cartItemImageStyle = {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: '1px solid var(--platform-border-color)'
    };

    const cartItemDetailsStyle = {
        flex: 1
    };

    const cartItemTitleLinkStyle = {
        textDecoration: 'none',
        color: 'var(--platform-text-primary)'
    };

    const cartItemQuantityStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const quantityButtonStyle = {
        width: '30px',
        height: '30px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    const cartSummaryStyle = {
        padding: '1.5rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        background: 'var(--platform-card-bg)',
        textAlign: 'center'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '2rem' }}>Ваш кошик</h2>
            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '1.5rem' }}>У кошику поки що порожньо.</p>
                    <Link to="/catalog">
                        <button className="btn btn-primary">Перейти до каталогу</button>
                    </Link>
                </div>
            ) : (
                <>
                    <div>
                        {cartItems.map(item => (
                            <div key={item.id} style={cartItemStyle}>
                                <Link to={`/product/${item.id}`}>
                                    <img 
                                        src={item.image_url ? `${API_URL}${item.image_url}` : 'https://placehold.co/100x100'} 
                                        alt={item.name} 
                                        style={cartItemImageStyle}
                                    />
                                </Link>
                                <div style={cartItemDetailsStyle}>
                                    <Link to={`/product/${item.id}`} style={cartItemTitleLinkStyle}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--platform-text-primary)' }}>{item.name}</h4>
                                    </Link>
                                    <p style={{ margin: 0, color: 'var(--platform-text-secondary)' }}>{item.price} грн.</p>
                                </div>
                                <div style={cartItemQuantityStyle}>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                        style={quantityButtonStyle}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span style={{ 
                                        padding: '0 1rem',
                                        color: 'var(--platform-text-primary)'
                                    }}>
                                        {item.quantity}
                                    </span>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                        style={quantityButtonStyle}
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    className="btn btn-danger"
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    Видалити
                                </button>
                            </div>
                        ))}
                    </div>
                    <div style={cartSummaryStyle}>
                        <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>
                            Разом: {total.toFixed(2)} грн.
                        </h3>
                        <button 
                            onClick={handleCheckout} 
                            className="btn btn-primary"
                            style={{ marginRight: '1rem' }}
                        >
                            Оформити замовлення
                        </button>
                        <button 
                            onClick={clearCart} 
                            className="btn btn-secondary"
                        >
                            Очистити кошик
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
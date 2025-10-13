// frontend/src/features/cart/CartPage.jsx
import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    
    const handleCheckout = () => {
        alert('Дякуємо за покупку! Ваше замовлення "оформлено".');
        clearCart();
        navigate('/');
    };

    return (
        <div className="cart-container">
            <h2>Ваш кошик</h2>
            {cartItems.length === 0 ? (
                <div>
                    <p>У кошику поки що порожньо.</p>
                    <Link to="/catalog"><button>Перейти до каталогу</button></Link>
                </div>
            ) : (
                <>
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                {/* Додано посилання на зображення */}
                                <Link to={`/product/${item.id}`}>
                                    <img 
                                        src={item.image_url ? `${API_URL}${item.image_url}` : 'https://placehold.co/100x100'} 
                                        alt={item.name} 
                                        className="cart-item-image"
                                    />
                                </Link>
                                <div className="cart-item-details">
                                    {/* Додано посилання на назву */}
                                    <Link to={`/product/${item.id}`} className="cart-item-title-link">
                                        <h4>{item.name}</h4>
                                    </Link>
                                    <p>{item.price} грн.</p>
                                </div>
                                <div className="cart-item-quantity">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="cart-item-remove-btn">Видалити</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h3>Разом: {total.toFixed(2)} грн.</h3>
                        <button onClick={handleCheckout} className="checkout-btn">Оформити замовлення</button>
                        <button onClick={clearCart} className="clear-cart-btn">Очистити кошик</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
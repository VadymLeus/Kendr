// frontend/src/features/products/ProductDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import { CartContext } from '../cart/CartContext';
import { AuthContext } from '../auth/AuthContext';

const API_URL = 'http://localhost:5000';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { siteData, isSiteLoading } = useOutletContext();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/products/${productId}`);
                setProduct(response.data);
            } catch (err) {
                setError('Не вдалося завантажити інформацію про товар.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = (productToAdd) => {
        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, необхідно увійти до акаунту. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        addToCart(productToAdd);
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '3rem',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
    };

    const imageContainerStyle = {
        flex: '1 1 400px'
    };

    const infoContainerStyle = {
        flex: '1 1 400px'
    };

    const imageStyle = {
        width: '100%',
        borderRadius: '12px',
        border: '1px solid var(--site-border-color)',
        filter: product?.stock_quantity === 0 ? 'grayscale(100%)' : 'none',
        opacity: product?.stock_quantity === 0 ? 0.7 : 1
    };

    if (loading || isSiteLoading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--site-text-secondary)'
        }}>
            Завантаження товару...
        </div>
    );
    
    if (error) return (
        <div style={{ 
            color: 'var(--platform-danger)', 
            background: '#fff2f0',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '2rem'
        }}>
            {error}
        </div>
    );
    
    if (!product || !siteData) return (
        <div style={{ 
            textAlign: 'center', 
            color: 'var(--site-text-secondary)',
            padding: '2rem'
        }}>
            Товар не знайдено.
        </div>
    );

    const isOwner = user && user.id === siteData.user_id;
    const isSoldOut = product.stock_quantity === 0;
    
    return (
        <div style={containerStyle}>
            <div style={imageContainerStyle}>
                <img
                    src={(product.image_gallery && product.image_gallery.length > 0) ? `${API_URL}${product.image_gallery[0]}` : 'https://placehold.co/600x400'}
                    alt={product.name}
                    style={imageStyle}
                />
            </div>
            <div style={infoContainerStyle}>
                <h1 style={{ 
                    color: 'var(--site-text-primary)',
                    marginBottom: '1rem' 
                }}>
                    {product.name}
                </h1>
                <p style={{ 
                    fontSize: '1.1rem', 
                    color: 'var(--site-text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                }}>
                    {product.description}
                </p>
                <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    margin: '1.5rem 0',
                    color: 'var(--site-text-primary)'
                }}>
                    {product.price} грн.
                </p>
                {product.stock_quantity !== null && (
                    <p style={{ 
                        color: 'var(--site-text-secondary)',
                        marginBottom: '1rem'
                    }}>
                        На складі: {product.stock_quantity} шт.
                    </p>
                )}
                <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOwner || isSoldOut}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        opacity: isOwner || isSoldOut ? 0.6 : 1,
                        cursor: isOwner || isSoldOut ? 'not-allowed' : 'pointer',
                        background: (isOwner || isSoldOut) ? 'var(--site-text-secondary)' : 'var(--site-accent)',
                        color: (isOwner || isSoldOut) ? 'var(--site-text-primary)' : 'var(--site-accent-text)',
                        border: 'none',
                        borderRadius: '8px'
                    }}
                >
                    {isOwner ? 'Це ваш товар' : 
                     (isSoldOut ? 'Товар закінчився' : 
                     (user ? 'Додати у кошик' : 'Увійдіть, щоб купити'))}
                </button>
            </div>
        </div>
    );
};

export default ProductDetailPage;
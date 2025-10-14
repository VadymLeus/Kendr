// frontend/src/features/products/ProductDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    if (loading) return <div>Завантаження товару...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!product) return <div>Товар не знайдено.</div>;

    const isOwner = user && user.id === product.user_id;
    const isSoldOut = product.stock_quantity === 0;

    return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
                <img
                    src={product.image_url ? `${API_URL}${product.image_url}` : 'https://placehold.co/600x400'}
                    alt={product.name}
                    style={{ width: '100%', borderRadius: '8px', filter: isSoldOut ? 'grayscale(100%)' : 'none' }}
                />
            </div>
            <div style={{ flex: '1 1 400px' }}>
                <h1>{product.name}</h1>
                <p style={{ fontSize: '1.2rem', color: '#555' }}>{product.description}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1.5rem 0' }}>{product.price} грн.</p>
                <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOwner || isSoldOut}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        backgroundColor: isOwner ? '#ccc' : (isSoldOut ? '#888' : '#28a745'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isOwner || isSoldOut ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isOwner ? 'Це ваш товар' : (isSoldOut ? 'Товар закінчився' : (user ? 'Додати у кошик' : 'Увійдіть, щоб купити'))}
                </button>
            </div>
        </div>
    );
};

export default ProductDetailPage;
// frontend/src/pages/products/ProductDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import { CartContext } from '../../providers/CartContext';
import { AuthContext } from '../../providers/AuthContext';

const API_URL = 'http://localhost:5000';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [selectedOptions, setSelectedOptions] = useState({});
    const [finalPrice, setFinalPrice] = useState(0);

    const { siteData, isSiteLoading } = useOutletContext();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/products/${productId}`);
                const prod = response.data;
                
                if (typeof prod.variants === 'string') {
                    try { prod.variants = JSON.parse(prod.variants); } catch (e) {}
                }
                
                setProduct(prod);
                setFinalPrice(parseFloat(prod.price));
                
                if (prod.variants && Array.isArray(prod.variants)) {
                    const defaults = {};
                    prod.variants.forEach(v => {
                        if (v.values && v.values.length > 0) {
                            defaults[v.name] = v.values[0].label;
                        }
                    });
                    setSelectedOptions(defaults);
                }

            } catch (err) {
                setError('Не вдалося завантажити інформацію про товар.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (product) {
            let price = parseFloat(product.price);
            if (product.variants && Array.isArray(product.variants)) {
                product.variants.forEach(v => {
                    const selectedVal = selectedOptions[v.name];
                    const optionObj = v.values.find(val => val.label === selectedVal);
                    if (optionObj && optionObj.priceModifier) {
                        price += parseFloat(optionObj.priceModifier);
                    }
                });
            }
            setFinalPrice(price);
        }
    }, [selectedOptions, product]);

    const handleOptionChange = (optionName, value) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleAddToCart = () => {
        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, необхідно увійти до акаунту. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        addToCart(product, selectedOptions, finalPrice);
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

    const optionGroupStyle = { 
        marginBottom: '1.5rem' 
    };

    const optionLabelStyle = { 
        display: 'block', 
        fontWeight: '600', 
        marginBottom: '0.5rem', 
        color: 'var(--site-text-primary)' 
    };

    const selectStyle = {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid var(--site-border-color)',
        background: 'var(--site-bg)',
        color: 'var(--site-text-primary)',
        fontSize: '1rem',
        cursor: 'pointer'
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
                    {finalPrice.toFixed(2)} грн.
                </p>

                {product.variants && product.variants.map((variant, idx) => (
                    <div key={idx} style={optionGroupStyle}>
                        <label style={optionLabelStyle}>{variant.name}:</label>
                        <select 
                            style={selectStyle}
                            value={selectedOptions[variant.name] || ''}
                            onChange={(e) => handleOptionChange(variant.name, e.target.value)}
                        >
                            {variant.values.map((val, valIdx) => (
                                <option key={valIdx} value={val.label}>
                                    {val.label} {val.priceModifier !== 0 ? `(${val.priceModifier > 0 ? '+' : ''}${val.priceModifier} грн)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                {product.stock_quantity !== null && (
                    <p style={{ 
                        color: 'var(--site-text-secondary)',
                        marginBottom: '1rem'
                    }}>
                        На складі: {product.stock_quantity} шт.
                    </p>
                )}
                
                <button
                    onClick={handleAddToCart}
                    disabled={isOwner || isSoldOut}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        opacity: isOwner || isSoldOut ? 0.6 : 1,
                        cursor: isOwner || isSoldOut ? 'not-allowed' : 'pointer',
                        background: (isOwner || isSoldOut) ? 'var(--site-text-secondary)' : 'var(--site-accent)',
                        color: (isOwner || isSoldOut) ? 'var(--site-text-primary)' : 'var(--site-accent-text)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%'
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
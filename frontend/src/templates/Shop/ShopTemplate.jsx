// frontend/src/templates/Shop/ShopTemplate.jsx
import React, { useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../features/auth/AuthContext';
import { CartContext } from '../../features/cart/CartContext';

const API_URL = 'http://localhost:5000';

const ShopTemplate = ({ content, products, siteOwnerId, siteData }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const siteBg = siteData?.site_bg_color || '#f7fafc';
    const footerText = content?.footerText || `© ${new Date().getFullYear()} ${siteData?.title || 'Мій Магазин'}`;
    const productList = Array.isArray(products) ? products : [];

    const groupedProducts = useMemo(() => {
        if (!productList.length) return {};

        return productList.reduce((acc, product) => {
            if (!product || typeof product !== 'object') return acc;
            
            const categoryName = product.category_name || 'Різне';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(product);
            return acc;
        }, {});
    }, [productList]);

    const categoryNames = groupedProducts && Object.keys(groupedProducts).length > 0 
        ? Object.keys(groupedProducts).sort() 
        : [];

    const handleAddToCart = (productToAdd) => { /* ... (без змін) */ };

    const containerStyle = {
        fontFamily: "'Inter', sans-serif",
        backgroundColor: siteBg,
        minHeight: 'calc(100vh - 75px)',
        padding: '2rem 5%',
    };

    const categoryTitleStyle = {
        borderBottom: '2px solid #cbd5e0',
        paddingBottom: '0.5rem',
        marginBottom: '2rem',
        color: '#2d3748'
    };

    const productGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem'
    };

    const productCardStyle = {
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
    };

    const productImageStyle = (isSoldOut) => ({
        width: '100%',
        height: '220px',
        objectFit: 'cover',
        display: 'block',
        filter: isSoldOut ? 'grayscale(90%) opacity(70%)' : 'none',
        transition: 'transform 0.3s ease'
    });

    const productInfoStyle = {
        padding: '1rem 1.25rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    };

    const productNameStyle = {
        margin: '0 0 0.5rem 0',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1a202c'
    };

    const productPriceStyle = {
        fontWeight: 'bold',
        fontSize: '1.25rem',
        color: '#242060',
        marginTop: 'auto'
    };

    const productActionsStyle = {
        padding: '0 1.25rem 1.25rem',
        display: 'flex',
        gap: '0.75rem',
        borderTop: '1px solid #e2e8f0',
        marginTop: '1rem',
        paddingTop: '1rem'
    };

    const buttonBaseStyle = {
        flex: 1,
        padding: '0.6rem',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        fontSize: '0.9rem'
    };

    const detailsButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#f0f4ff',
        color: '#242060',
        border: '1px solid #d3dfff'
    };

    const addToCartButtonStyle = (isOwner, isSoldOut) => ({
        ...buttonBaseStyle,
        backgroundColor: isOwner ? '#e2e8f0' : (isSoldOut ? '#a0aec0' : '#242060'),
        color: isOwner ? '#718096' : 'white',
        cursor: isOwner || isSoldOut ? 'not-allowed' : 'pointer'
    });

    const footerStyle = {
        textAlign: 'center',
        padding: '2rem 0',
        borderTop: '1px solid #e2e8f0',
        marginTop: '3rem',
        color: '#718096',
        background: siteBg
    };

    return (
        <div style={containerStyle}>
            <main>
                {productList.length > 0 && categoryNames.length > 0 ? (
                    categoryNames.map(categoryName => (
                        <div key={categoryName} style={{ marginBottom: '3rem' }}>
                            <h2 style={categoryTitleStyle}>{categoryName}</h2>
                            <div style={productGridStyle}>
                                {groupedProducts[categoryName]?.map((product) => {
                                    if (!product) return null;
                                    const isOwner = user && user.id === siteOwnerId;
                                    const isSoldOut = product.stock_quantity === 0;

                                    return (
                                        <div key={product.id} style={productCardStyle}
                                            onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'} 
                                            onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'}>
                                            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <img
                                                    src={product.image_url ? `${API_URL}${product.image_url}` : 'https://placehold.co/400x300/EFEFEF/31343C?text=Фото+товару'}
                                                    alt={product.name}
                                                    style={productImageStyle(isSoldOut)}
                                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} 
                                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                            </Link>
                                            <div style={productInfoStyle}>
                                                <h3 style={productNameStyle}>{product.name}</h3>
                                                <p style={productPriceStyle}>{product.price} грн.</p>
                                            </div>
                                            <div style={productActionsStyle}>
                                                <Link to={`/product/${product.id}`} style={{ flex: 1 }}>
                                                    <button style={detailsButtonStyle}>Деталі</button>
                                                </Link>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={isOwner || isSoldOut}
                                                    style={addToCartButtonStyle(isOwner, isSoldOut)}
                                                >
                                                    {isOwner ? 'Ваш товар' : (isSoldOut ? 'Немає' : 'У кошик')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#718096' }}>У цьому магазині поки що немає товарів.</p>
                )}
            </main>
            <footer style={footerStyle}>
                <p>{footerText}</p>
            </footer>
        </div>
    );
};

export default ShopTemplate;
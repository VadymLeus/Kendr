// frontend/src/components/blocks/CatalogGridBlock.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../features/cart/CartContext';
import { AuthContext } from '../../features/auth/AuthContext';

const API_URL = 'http://localhost:5000';

const ProductCard = ({ product, siteData, isEditorPreview }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const isSoldOut = product.stock_quantity === 0;

    const cardStyleBase = {
        border: '1px solid var(--site-border-color)',
        borderRadius: '12px',
        background: 'var(--site-card-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        overflow: 'hidden'
    };

    const cardStyle = isEditorPreview
        ? { ...cardStyleBase, flexDirection: 'row', padding: '0.5rem', height: '90px', alignItems: 'center', gap: '1rem' }
        : { ...cardStyleBase, flexDirection: 'column', padding: 0 };

    const imageLinkStyle = {
        display: 'block',
        overflow: 'hidden',
        width: isEditorPreview ? '70px' : '100%',
        height: isEditorPreview ? '70px' : '200px',
        flexShrink: 0,
        borderRadius: isEditorPreview ? '8px' : 0
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: isSoldOut ? 'grayscale(100%)' : 'none',
        opacity: isSoldOut ? 0.7 : 1,
        transition: 'transform 0.3s ease',
        cursor: isEditorPreview ? 'default' : 'pointer'
    };

    const cardBodyStyle = {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: isEditorPreview ? '0.5rem' : '1.5rem',
        justifyContent: isEditorPreview ? 'center' : 'flex-start'
    };

    const stockStyle = {
        margin: '0 0 1rem 0',
        fontSize: '0.9em',
        color: isSoldOut ? 'var(--site-danger)' : 'var(--site-success)',
        flexGrow: 1
    };

    const imageUrl = (Array.isArray(product.image_gallery) && product.image_gallery.length > 0)
        ? `${API_URL}${product.image_gallery[0]}`
        : 'https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото';

    const isOwner = user && siteData && user.id === siteData.user_id;

    const ImageWrapper = isEditorPreview ? 'div' : Link;
    const imageWrapperProps = isEditorPreview
        ? { style: imageLinkStyle }
        : { to: `/product/${product.id}`, style: imageLinkStyle };

    const TitleWrapper = isEditorPreview ? 'div' : Link;
    const titleWrapperProps = isEditorPreview
        ? { style: { textDecoration: 'none', color: 'inherit', cursor: 'default' } }
        : { to: `/product/${product.id}`, style: { textDecoration: 'none', color: 'inherit' } };

    const handleAddToCart = () => {
        if (isEditorPreview) return;
        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, потрібно увійти в акаунт. Перейти до сторінки входу?")) {
                navigate('/login');
            }
            return;
        }
        addToCart(product);
    };

    return (
        <div style={cardStyle} className="product-card">
            <ImageWrapper {...imageWrapperProps}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    style={imageStyle}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x400/AAAAAA/FFFFFF?text=Фото";
                    }}
                />
            </ImageWrapper>
            <div style={cardBodyStyle}>
                <h5 style={{
                    margin: '0 0 5px 0',
                    color: 'var(--site-text-primary)',
                    fontSize: isEditorPreview ? '0.9rem' : '1.1rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    <TitleWrapper {...titleWrapperProps}>{product.name}</TitleWrapper>
                </h5>

                {!isEditorPreview ? (
                    <>
                        <p style={{
                            margin: '0 0 1rem 0',
                            fontSize: '1.2em',
                            fontWeight: 'bold',
                            color: 'var(--site-accent)'
                        }}>
                            {product.price} грн.
                        </p>
                        <small style={{ color: 'var(--site-text-secondary)', marginBottom: '10px' }}>
                            Категорія: {product.category_name || 'Не вказано'}
                        </small>
                        <p style={stockStyle}>
                            {isSoldOut ? 'Немає в наявності' : `В наявності: ${product.stock_quantity} шт.`}
                        </p>

                        <button
                            onClick={handleAddToCart}
                            disabled={isEditorPreview || isOwner || isSoldOut}
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                                opacity: (isEditorPreview || isOwner || isSoldOut) ? 0.6 : 1,
                                cursor: (isEditorPreview || isOwner || isSoldOut) ? 'not-allowed' : 'pointer',
                                background: 'var(--site-accent)',
                                color: 'var(--site-accent-text)',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                        >
                            {isEditorPreview
                                ? 'Перегляд'
                                : (isOwner
                                    ? 'Ваш товар'
                                    : (isSoldOut
                                        ? 'Немає в наявності'
                                        : 'Додати у кошик'))}
                        </button>
                    </>
                ) : (
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: 'var(--site-text-secondary)',
                        fontStyle: 'italic'
                    }}>
                        {product.price} грн.
                    </p>
                )}
            </div>
        </div>
    );
};

const CatalogGridBlock = ({ blockData, siteData, isEditorPreview }) => {
    const allProducts = siteData?.products || [];
    const selectedIds = new Set(blockData.selectedProductIds || []);
    const productsToDisplay = allProducts.filter(product => selectedIds.has(product.id));

    const gridStyle = isEditorPreview
        ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            border: '1px dashed var(--platform-border-color)',
            background: 'var(--platform-card-bg)',
            borderRadius: '8px'
        }
        : {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        };

    const containerStyle = isEditorPreview
        ? { padding: '10px', background: 'var(--platform-card-bg)' }
        : { padding: '40px 20px', background: 'var(--site-bg)' };

    if (productsToDisplay.length === 0 && !isEditorPreview) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>{blockData.title || 'Товари'}</h3>
                <p style={{ color: 'var(--site-text-secondary)' }}>Немає обраних товарів для відображення.</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '2.5rem', 
                color: isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)' 
            }}>
                {blockData.title || 'Товари'}
            </h2>

            {productsToDisplay.length === 0 && isEditorPreview && (
                <div style={{ 
                    ...gridStyle,
                    display: 'block',
                    textAlign: 'center',
                    color: 'var(--platform-text-secondary)'
                }}>
                    Немає вибраних товарів. (Налаштуйте блок, щоб додати їх)
                </div>
            )}

            {productsToDisplay.length > 0 && (
                <div style={gridStyle}>
                    {productsToDisplay.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            siteData={siteData}
                            isEditorPreview={isEditorPreview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogGridBlock;
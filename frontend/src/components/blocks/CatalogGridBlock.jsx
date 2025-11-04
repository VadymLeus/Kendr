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

    // ВИПРАВЛЕННЯ: Переміщено визначення стилів ДО їх використання
    const isSoldOut = product.stock_quantity === 0;

    const cardStyle = {
        border: '1px solid var(--site-border-color)',
        borderRadius: '12px',
        padding: '0',
        background: 'var(--site-card-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    };
    
    const imageLinkStyle = {
        display: 'block',
        width: '100%',
        height: '200px',
        overflow: 'hidden'
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
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
    };
    
    const stockStyle = {
        margin: '0 0 1rem 0',
        fontSize: '0.9em',
        color: isSoldOut ? 'var(--platform-danger)' : 'var(--platform-success)',
        flexGrow: 1
    };

    const imageUrl = (Array.isArray(product.image_gallery) && product.image_gallery.length > 0)
        ? `${API_URL}${product.image_gallery[0]}`
        : 'https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото';

    const isOwner = user && siteData && user.id === siteData.user_id;

    // Тепер 'imageLinkStyle' визначено і ця логіка спрацює
    const ImageWrapper = isEditorPreview ? 'div' : Link;
    const imageWrapperProps = isEditorPreview
        ? { style: imageLinkStyle }
        : { to: `/product/${product.id}`, style: imageLinkStyle };

    const TitleWrapper = isEditorPreview ? 'div' : Link;
    const titleWrapperProps = isEditorPreview
        ? { style: {textDecoration: 'none', color: 'inherit', cursor: 'default'} }
        : { to: `/product/${product.id}`, style: {textDecoration: 'none', color: 'inherit'} };

    const handleAddToCart = () => {
        if (isEditorPreview) return; // Блокуємо додавання в кошик у режимі прев'ю
        
        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, необхідно увійти до акаунту. Перейти на сторінку входу?")) {
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
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400/AAAAAA/FFFFFF?text=Фото" }}
                />
            </ImageWrapper>
            <div style={cardBodyStyle}>
                <h5 style={{ margin: '0 0 5px 0', color: 'var(--site-text-primary)' }}>
                    <TitleWrapper {...titleWrapperProps}>
                        {product.name}
                    </TitleWrapper>
                </h5>
                <p style={{ margin: '0 0 1rem 0', fontSize: '1.2em', fontWeight: 'bold', color: 'var(--site-accent)' }}>
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
                    {isEditorPreview ? 'Перегляд' : (isOwner ? 'Це ваш товар' : (isSoldOut ? 'Немає в наявності' : 'Додати у кошик'))}
                </button>
            </div>
        </div>
    );
};

const CatalogGridBlock = ({ blockData, siteData, isEditorPreview }) => {
    const allProducts = siteData?.products || [];
    
    const selectedIds = new Set(blockData.selectedProductIds || []);
    
    const productsToDisplay = allProducts.filter(product => selectedIds.has(product.id));

    if (productsToDisplay.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>{blockData.title || 'Товари'}</h3>
                <p style={{color: 'var(--site-text-secondary)'}}>Немає обраних товарів для відображення.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', background: 'var(--site-bg)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--site-text-primary)' }}>
                {blockData.title || 'Товари'}
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {productsToDisplay.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        siteData={siteData} 
                        isEditorPreview={isEditorPreview} 
                    />
                ))}
            </div>
        </div>
    );
};

export default CatalogGridBlock;
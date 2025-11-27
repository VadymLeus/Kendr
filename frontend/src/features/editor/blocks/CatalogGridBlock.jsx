// frontend/src/features/editor/blocks/CatalogGridBlock.jsx
import React, { useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../providers/CartContext';
import { AuthContext } from '../../../providers/AuthContext';

const API_URL = 'http://localhost:5000';

const ProductCard = ({ product, siteData, isEditorPreview }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const isSoldOut = product.stock_quantity === 0;
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
    
    const basePrice = parseFloat(product.price);
    const discountPercent = product.sale_percentage || 0;
    const hasDiscount = discountPercent > 0;
    const finalPrice = hasDiscount 
        ? Math.round(basePrice * (1 - discountPercent / 100)) 
        : basePrice;

    const cardStyleBase = {
        border: '1px solid var(--site-border-color)',
        borderRadius: '12px',
        background: 'var(--site-card-bg)',
        boxShadow: isEditorPreview ? '0 2px 8px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative'
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

    const saleBadgeStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#e53e3e',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        zIndex: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };
    
    const imageUrl = (Array.isArray(product.image_gallery) && product.image_gallery.length > 0)
        ? `${API_URL}${product.image_gallery[0]}`
        : 'https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+фото';

    const isOwner = user && siteData && user.id === siteData.user_id;
    const ImageWrapper = isEditorPreview ? 'div' : Link;
    const imageWrapperProps = isEditorPreview
        ? { style: imageLinkStyle }
        : { to: `/product/${product.id}`, style: imageLinkStyle };
    const TitleWrapper = isEditorPreview ? 'div' : Link;
    const titleWrapperProps = isEditorPreview
        ? { style: { textDecoration: 'none', color: 'inherit', cursor: 'default' } }
        : { to: `/product/${product.id}`, style: { textDecoration: 'none', color: 'inherit' } };
        
    const handleAction = () => {
        if (isEditorPreview) return;
        
        if (hasVariants) {
            navigate(`/product/${product.id}`);
            return;
        }

        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, потрібно увійти. Перейти?")) {
                navigate('/login');
            }
            return;
        }
        addToCart(product, {}, { finalPrice, originalPrice: basePrice, discount: discountPercent });
    };

    return (
        <div style={cardStyle} className="product-card">
            {!isEditorPreview && hasDiscount && !isSoldOut && (
                <div style={saleBadgeStyle}>-{discountPercent}%</div>
            )}

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
                        <div style={{ margin: '0 0 1rem 0' }}>
                            {hasDiscount ? (
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '1.2em',
                                        fontWeight: 'bold',
                                        color: '#e53e3e'
                                    }}>
                                        {finalPrice} грн.
                                    </span>
                                    <span style={{
                                        fontSize: '0.9em',
                                        textDecoration: 'line-through',
                                        color: 'var(--site-text-secondary)'
                                    }}>
                                        {basePrice} грн.
                                    </span>
                                </div>
                            ) : (
                                <p style={{
                                    margin: 0,
                                    fontSize: '1.2em',
                                    fontWeight: 'bold',
                                    color: 'var(--site-accent)'
                                }}>
                                    {basePrice} грн.
                                </p>
                            )}
                        </div>

                        <small style={{ color: 'var(--site-text-secondary)', marginBottom: '10px', display: 'block' }}>
                            Категорія: {product.category_name || 'Не вказано'}
                        </small>
                        <p style={stockStyle}>
                            {isSoldOut ? 'Немає в наявності' : `В наявності: ${product.stock_quantity} шт.`}
                        </p>

                        <button
                            onClick={handleAction}
                            disabled={isEditorPreview || isOwner || (isSoldOut && !hasVariants)}
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                                opacity: (isEditorPreview || isOwner || (isSoldOut && !hasVariants)) ? 0.6 : 1,
                                cursor: (isEditorPreview || isOwner || (isSoldOut && !hasVariants)) ? 'not-allowed' : 'pointer',
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
                                    : (hasVariants 
                                        ? 'Вибрати опції'
                                        : (isSoldOut
                                            ? 'Немає в наявності'
                                            : 'Додати у кошик')))}
                        </button>
                    </>
                ) : (
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: 'var(--site-text-secondary)',
                        fontStyle: 'italic'
                    }}>
                        {finalPrice} грн.
                    </p>
                )}
            </div>
        </div>
    );
};

const CatalogGridBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const allProducts = siteData?.products || [];
    
    const productsToDisplay = useMemo(() => {
        const { mode = 'auto', category_id = 'all', selectedProductIds = [], excludedProductIds = [] } = blockData;

        if (mode === 'manual') {
            const selectedIds = new Set(selectedProductIds);
            return allProducts.filter(product => selectedIds.has(product.id));
        } else {
            const exclusionSet = new Set(excludedProductIds || []);

            const categoryFiltered = (category_id === 'all' || !category_id)
                ? allProducts
                : allProducts.filter(product => String(product.category_id) === String(category_id));
            
            return categoryFiltered.filter(product => !exclusionSet.has(product.id));
        }
    }, [blockData, allProducts]);

    const siteBorderColor = 'var(--site-border-color)';
    const siteCardBg = 'var(--site-card-bg)';
    const siteBg = 'var(--site-bg)';
    const siteTextPrimary = 'var(--site-text-primary)';
    const siteTextSecondary = 'var(--site-text-secondary)';

    const gridStyle = isEditorPreview
        ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            border: `1px dashed ${siteBorderColor}`,
            background: siteCardBg, 
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
        ? { 
            padding: '10px', 
            background: siteCardBg,
            ...style
        }
        : { 
            padding: '40px 20px', 
            background: siteBg,
            ...style
        };

    if (productsToDisplay.length === 0 && !isEditorPreview) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                ...style 
            }}>
                <h3>{blockData.title || 'Товари'}</h3>
                <p style={{ color: siteTextSecondary }}>Немає товарів для відображення.</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '2.5rem',
                color: siteTextPrimary
            }}>
                {blockData.title || 'Товари'}
            </h2>

            {productsToDisplay.length === 0 && isEditorPreview && (
                <div style={{ 
                    ...gridStyle,
                    display: 'block',
                    textAlign: 'center',
                    color: siteTextSecondary
                }}>
                    Немає вибраних товарів або товарів у цій категорії. (Налаштуйте блок)
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
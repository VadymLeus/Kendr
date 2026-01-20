// frontend/src/modules/editor/ui/components/ProductCard.jsx
import React, { useState, useMemo, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Settings } from 'lucide-react';
import { CartContext } from '../../../../app/providers/CartContext';
import { AuthContext } from '../../../../app/providers/AuthContext';

const API_URL = 'http://localhost:5000';

const ProductCard = ({ product, isEditorPreview, siteData, fontStyles }) => {
    const cartContext = useContext(CartContext);
    const authContext = useContext(AuthContext);
    const addToCart = cartContext?.addToCart || (() => console.warn('Cart Context is missing'));
    const user = authContext?.user || null;
    const navigate = useNavigate();
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef(null);
    const images = useMemo(() => {
        if (product.image_gallery && product.image_gallery.length > 0) {
            let gallery = typeof product.image_gallery === 'string' 
                ? JSON.parse(product.image_gallery) 
                : product.image_gallery;

            return gallery.map(img => 
                img.startsWith('http') ? img : `${API_URL}${img}`
            );
        }
        return ['https://placehold.co/300?text=No+Image'];
    }, [product.image_gallery]);

    const isOwner = user && siteData && user.id === siteData.user_id;
    const hasDiscount = product.sale_percentage > 0;
    const finalPrice = product.price ? (hasDiscount 
        ? Math.round(product.price * (1 - product.sale_percentage / 100)) 
        : product.price) : 0;
    const isSoldOut = product.stock_quantity === 0;
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
    const sitePath = siteData?.site_path || product.site_path;
    const productLink = sitePath 
        ? `/site/${sitePath}/product/${product.id}` 
        : `/product/${product.id}`; 

    const handleMouseEnter = (e) => {
        if (!isEditorPreview) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }
        setIsHovered(true);

        if (isEditorPreview || images.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setActiveImgIndex(prev => (prev + 1) % images.length);
        }, 1200);
    };

    const handleMouseLeave = (e) => {
        if (!isEditorPreview) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }
        setIsHovered(false);
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setActiveImgIndex(0);
    };

    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEditorPreview) return;
        if (hasVariants) {
            navigate(productLink);
            return;
        }

        if (!user) {
            if (typeof window !== 'undefined' && window.confirm("Щоб купити, потрібно увійти. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        
        if (addToCart) {
            addToCart(product, {}, { finalPrice, originalPrice: product.price, discount: product.sale_percentage });
        }
    };

    return (
        <Link 
            to={isEditorPreview ? '#' : productLink}
            style={{
                textDecoration: 'none', 
                pointerEvents: isEditorPreview ? 'none' : 'auto', 
                color: 'inherit',
                display: 'block',
                height: '100%',
                width: '100%',
                minWidth: 0
            }}
            onClick={(e) => isEditorPreview && e.preventDefault()}
        >
            <div 
                style={{
                    border: '1px solid var(--site-border-color)',
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    background: 'var(--site-card-bg)',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    cursor: isEditorPreview ? 'default' : 'pointer',
                    boxSizing: 'border-box'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', backgroundColor: 'var(--site-bg)' }}>
                    {images.map((imgSrc, idx) => (
                        <img 
                            key={idx}
                            src={imgSrc} 
                            alt={product.name}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                objectFit: 'contain', 
                                opacity: idx === activeImgIndex ? 1 : 0,
                                transform: `scale(${idx === activeImgIndex && isHovered ? 1.05 : 1})`,
                                transition: 'opacity 0.3s ease, transform 0.5s ease',
                                filter: isSoldOut ? 'grayscale(100%)' : 'none',
                                padding: '10px', boxSizing: 'border-box'
                            }}
                        />
                    ))}

                    {images.length > 1 && !isSoldOut && (
                        <div style={{
                            position: 'absolute', bottom: '10px', left: 0, right: 0,
                            display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 2,
                            opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s'
                        }}>
                            {images.map((_, idx) => (
                                <div key={idx} style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: idx === activeImgIndex ? 'var(--site-accent)' : 'rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }} />
                            ))}
                        </div>
                    )}

                    {hasDiscount && !isSoldOut && (
                        <div style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: '#e53e3e', color: 'white',
                            padding: '2px 6px', borderRadius: '4px',
                            fontSize: '0.75rem', fontWeight: 'bold', zIndex: 3,
                        }}>
                            -{product.sale_percentage}%
                        </div>
                    )}

                    {isSoldOut && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.8)',
                            color: '#555', fontWeight: 'bold', zIndex: 3,
                            backdropFilter: 'blur(2px)'
                        }}>
                            Закінчився
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <h4 style={{
                        margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--site-text-primary)',
                        fontWeight: '600',
                        fontFamily: fontStyles?.content || 'inherit',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                    }}>
                        {product.name}
                    </h4>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                            {hasDiscount ? (
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '1.1rem' }}>{finalPrice} ₴</span>
                                    <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--site-text-secondary)' }}>
                                        {product.price} ₴
                                    </span>
                                </div>
                            ) : (
                                <span style={{ color: 'var(--site-text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{product.price} ₴</span>
                            )}
                        </div>
                        
                        <button
                            onClick={handleAction}
                            disabled={isSoldOut || (isOwner && !hasVariants)}
                            style={{
                                background: isOwner ? 'transparent' : 'var(--site-accent)',
                                color: isOwner ? 'var(--site-text-secondary)' : 'var(--site-accent-text)',
                                border: isOwner ? '1px solid var(--site-border-color)' : 'none', 
                                borderRadius: '8px',
                                width: '36px', height: '36px',
                                cursor: (isSoldOut || isOwner) ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                marginLeft: '8px'
                            }}
                        >
                            {isOwner ? (
                                <User size={18} />
                            ) : hasVariants ? (
                                <Settings size={18} />
                            ) : (
                                <ShoppingCart size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
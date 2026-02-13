// frontend/src/modules/editor/ui/components/ProductCard.jsx
import React, { useState, useMemo, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Settings } from 'lucide-react';
import { CartContext } from '../../../../app/providers/CartContext';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { BASE_URL } from '../../../../shared/config';

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
                img.startsWith('http') ? img : `${BASE_URL}${img}`
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
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (isEditorPreview || images.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setActiveImgIndex(prev => (prev + 1) % images.length);
        }, 1200);
    };

    const handleMouseLeave = () => {
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
            onClick={(e) => isEditorPreview && e.preventDefault()}
            className={`
                block h-full w-full min-w-0 no-underline text-inherit 
                ${isEditorPreview ? 'pointer-events-none' : 'pointer-events-auto'}
            `}
        >
            <div 
                className={`
                    border border-(--site-border-color) rounded-lg overflow-hidden bg-(--site-card-bg) 
                    h-full w-full flex flex-col relative transition-all duration-200 box-border
                `}
                style={{
                    transform: (!isEditorPreview && isHovered) ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: (!isEditorPreview && isHovered) ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="relative pt-[100%] overflow-hidden bg-(--site-bg)">
                    {images.map((imgSrc, idx) => (
                        <img 
                            key={idx}
                            src={imgSrc} 
                            alt={product.name}
                            className={`
                                absolute top-0 left-0 w-full h-full object-contain p-2.5 box-border transition-all duration-500 ease-in-out
                            `}
                            style={{
                                opacity: idx === activeImgIndex ? 1 : 0,
                                transform: `scale(${idx === activeImgIndex && isHovered ? 1.05 : 1})`,
                                filter: isSoldOut ? 'grayscale(100%)' : 'none',
                            }}
                        />
                    ))}
                    {images.length > 1 && !isSoldOut && (
                        <div className={`
                            absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 z-10 transition-opacity duration-200
                        `} style={{ opacity: isHovered ? 1 : 0 }}>
                            {images.map((_, idx) => (
                                <div key={idx} 
                                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                        background: idx === activeImgIndex ? 'var(--site-accent)' : 'rgba(0,0,0,0.1)'
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                    
                    {hasDiscount && !isSoldOut && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold z-10">
                            -{product.sale_percentage}%
                        </div>
                    )}

                    {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-600 font-bold z-10 backdrop-blur-sm">
                            Закінчився
                        </div>
                    )}
                </div>
                <div className="p-4 flex-1 flex flex-col min-w-0">
                    <h4 
                        className="m-0 mb-2 text-base text-(--site-text-primary) font-semibold leading-snug line-clamp-2 overflow-hidden text-ellipsi wrap-break-words"
                        style={{ fontFamily: fontStyles?.content || 'inherit' }}
                    >
                        {product.name}
                    </h4>
                    <div className="mt-auto flex justify-between items-center">
                        <div className="min-w-0 flex-1 overflow-hidden">
                            {hasDiscount ? (
                                <div className="flex flex-col">
                                    <span className="text-red-600 font-bold text-lg">{finalPrice} ₴</span>
                                    <span className="text-xs text-(--site-text-secondary) line-through">
                                        {product.price} ₴
                                    </span>
                                </div>
                            ) : (
                                <span className="text-(--site-text-primary) font-bold text-lg">{product.price} ₴</span>
                            )}
                        </div>
                        <button
                            onClick={handleAction}
                            disabled={isSoldOut || (isOwner && !hasVariants)}
                            className={`
                                w-9 h-9 flex items-center justify-center rounded-lg ml-2 shrink-0 transition-all duration-200
                                ${isSoldOut || isOwner ? 'cursor-default' : 'cursor-pointer'}
                            `}
                            style={{
                                background: isOwner ? 'transparent' : 'var(--site-accent)',
                                color: isOwner ? 'var(--site-text-secondary)' : 'var(--site-accent-text)',
                                border: isOwner ? '1px solid var(--site-border-color)' : 'none',
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
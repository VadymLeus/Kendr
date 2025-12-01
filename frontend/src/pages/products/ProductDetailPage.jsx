// frontend/src/pages/products/ProductDetailPage.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { CartContext } from '../../providers/CartContext';
import { AuthContext } from '../../providers/AuthContext';
import BlockRenderer from '../../features/editor/blocks/BlockRenderer';

const API_URL = 'http://localhost:5000';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { siteData, isSiteLoading } = useOutletContext();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedOptions, setSelectedOptions] = useState({});
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [imageScale, setImageScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    
    const imageContainerRef = useRef(null);
    
    const [priceData, setPriceData] = useState({
        finalPrice: 0,
        originalPrice: 0,
        activeDiscount: 0,
        isDiscounted: false
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/products/${productId}`);
                const prod = response.data;
                
                if (typeof prod.variants === 'string') {
                    try { prod.variants = JSON.parse(prod.variants); } catch (e) {}
                }
                if (typeof prod.image_gallery === 'string') {
                    try { prod.image_gallery = JSON.parse(prod.image_gallery); } catch (e) {}
                }
                
                setProduct(prod);
                setActiveImageIndex(0);

                if (prod.variants && Array.isArray(prod.variants)) {
                    const defaults = {};
                    prod.variants.forEach(v => {
                        if (v.values && v.values.length > 0) {
                            defaults[v.name] = v.values[0].label;
                        }
                    });
                    setSelectedOptions(defaults);
                }

                if (prod.site_id) {
                    fetchRecommendations(prod.site_id, prod.category_id, prod.id);
                }

            } catch (err) {
                setError('Не вдалося завантажити інформацію про товар.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const fetchRecommendations = async (siteId, categoryId, currentId) => {
        try {
            const res = await apiClient.get(`/products/site/${siteId}`);
            const allProducts = res.data;
            const others = allProducts.filter(p => p.id !== currentId);

            others.sort((a, b) => {
                const aIsSameCat = a.category_id === categoryId ? 1 : 0;
                const bIsSameCat = b.category_id === categoryId ? 1 : 0;
                return bIsSameCat - aIsSameCat; 
            });

            setRelatedProducts(others.slice(0, 6));
        } catch (e) {
            console.error("Error fetching related products", e);
        }
    };

    useEffect(() => {
        if (product) {
            let basePriceWithModifiers = parseFloat(product.price);
            let maxVariantDiscount = 0;

            if (product.variants && Array.isArray(product.variants)) {
                product.variants.forEach(v => {
                    const selectedVal = selectedOptions[v.name];
                    const optionObj = v.values.find(val => val.label === selectedVal);
                    
                    if (optionObj) {
                        if (optionObj.priceModifier) {
                            basePriceWithModifiers += parseFloat(optionObj.priceModifier);
                        }
                        if (optionObj.salePercentage > 0) {
                            maxVariantDiscount = Math.max(maxVariantDiscount, optionObj.salePercentage);
                        }
                    }
                });
            }

            let activeDiscount = 0;
            if (maxVariantDiscount > 0) activeDiscount = maxVariantDiscount;
            else if (product.sale_percentage > 0) activeDiscount = product.sale_percentage;
            else if (product.category_discount > 0) activeDiscount = product.category_discount;

            const finalPrice = Math.round(basePriceWithModifiers * (1 - activeDiscount / 100));

            setPriceData({
                finalPrice: finalPrice,
                originalPrice: basePriceWithModifiers,
                activeDiscount: activeDiscount,
                isDiscounted: activeDiscount > 0
            });
        }
    }, [selectedOptions, product]);

    const handleZoomIn = useCallback(() => {
        setImageScale(prev => {
            const newScale = Math.min(prev + 0.25, 5);
            if (newScale === 1) {
                setImagePosition({ x: 0, y: 0 });
            }
            return newScale;
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setImageScale(prev => {
            const newScale = Math.max(prev - 0.25, 0.5);
            if (newScale === 1) {
                setImagePosition({ x: 0, y: 0 });
            }
            return newScale;
        });
    }, []);

    const handleResetZoom = useCallback(() => {
        setImageScale(1);
        setImagePosition({ x: 0, y: 0 });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
        if (imageScale === 1) {
            setImageScale(2);
        }
    }, [imageScale]);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        if (imageScale === 2) {
            setImageScale(1);
            setImagePosition({ x: 0, y: 0 });
        }
    }, [imageScale]);

    const handleImageClick = useCallback(() => {
        if (imageScale === 1) {
            setImageScale(2);
        } else {
            handleResetZoom();
        }
    }, [imageScale, handleResetZoom]);

    const handleMouseMove = useCallback((e) => {
        if (isDragging && imageScale > 1) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            
            const maxDrag = 200;
            const limitedX = Math.max(Math.min(newX, maxDrag), -maxDrag);
            const limitedY = Math.max(Math.min(newY, maxDrag), -maxDrag);
            
            setImagePosition({
                x: limitedX,
                y: limitedY
            });
            e.preventDefault();
            return;
        }

        if (imageContainerRef.current && imageScale > 1 && !isDragging) {
            const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            const moveX = (width / 2 - x) * (imageScale - 1);
            const moveY = (height / 2 - y) * (imageScale - 1);

            const maxMove = 150;
            const limitedMoveX = Math.max(Math.min(moveX, maxMove), -maxMove);
            const limitedMoveY = Math.max(Math.min(moveY, maxMove), -maxMove);

            setImagePosition({ 
                x: limitedMoveX, 
                y: limitedMoveY 
            });
        }
    }, [isDragging, dragStart, imageScale]);

    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('.zoom-controls')) {
            return;
        }
        
        if (imageScale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - imagePosition.x,
                y: e.clientY - imagePosition.y
            });
        }
        e.preventDefault();
    }, [imageScale, imagePosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    handleResetZoom();
                    break;
                case 'Escape':
                    e.preventDefault();
                    handleResetZoom();
                    break;
                case 'ArrowLeft':
                    if (imageScale > 1) {
                        e.preventDefault();
                        setImagePosition(prev => ({ 
                            ...prev, 
                            x: Math.min(prev.x + 50, 200) 
                        }));
                    }
                    break;
                case 'ArrowRight':
                    if (imageScale > 1) {
                        e.preventDefault();
                        setImagePosition(prev => ({ 
                            ...prev, 
                            x: Math.max(prev.x - 50, -200) 
                        }));
                    }
                    break;
                case 'ArrowUp':
                    if (imageScale > 1) {
                        e.preventDefault();
                        setImagePosition(prev => ({ 
                            ...prev, 
                            y: Math.min(prev.y + 50, 200) 
                        }));
                    }
                    break;
                case 'ArrowDown':
                    if (imageScale > 1) {
                        e.preventDefault();
                        setImagePosition(prev => ({ 
                            ...prev, 
                            y: Math.max(prev.y - 50, -200) 
                        }));
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleZoomIn, handleZoomOut, handleResetZoom, imageScale]);

    const handleOptionChange = (optionName, value) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const handleAddToCart = () => {
        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, необхідно увійти. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        addToCart(product, selectedOptions, {
            finalPrice: priceData.finalPrice,
            originalPrice: priceData.originalPrice,
            discount: priceData.activeDiscount
        });
    };
    
    const isDarkMode = siteData?.site_theme_mode === 'dark';
    const imageBackgroundColor = isDarkMode ? 'var(--site-card-bg)' : '#ffffff';

    const pageWrapperStyle = {
        backgroundColor: 'var(--site-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
    };

    const mainContentContainer = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px',
        width: '100%',
        boxSizing: 'border-box',
        flex: 1
    };

    const productLayoutGrid = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start'
    };

    const galleryContainer = {
        display: 'flex',
        gap: '15px',
        flexDirection: 'row',
        height: '600px'
    };

    const thumbnailsCol = {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '80px',
        flexShrink: 0,
        overflowY: 'auto',
        paddingRight: '5px'
    };

    const thumbnailBox = (isActive) => ({
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: '6px',
        border: isActive ? '2px solid var(--site-accent)' : '1px solid var(--site-border-color)',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.6,
        transition: 'all 0.2s',
        backgroundColor: imageBackgroundColor,
        flexShrink: 0
    });

    const thumbnailImg = {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    };

    const mainImageBox = {
        flex: 1,
        border: '1px solid var(--site-border-color)',
        borderRadius: '12px',
        backgroundColor: imageBackgroundColor,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        transition: 'all 0.3s ease'
    };

    const mainImage = {
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease',
        cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
    };

    const zoomControlsStyle = {
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        display: 'flex',
        gap: '8px',
        background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '10px',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10
    };

    const zoomButtonStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        border: 'none',
        background: 'var(--site-accent)',
        color: 'var(--site-accent-text)',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
    };

    const zoomButtonDisabledStyle = {
        ...zoomButtonStyle,
        background: 'var(--site-text-secondary)',
        cursor: 'not-allowed',
        opacity: 0.4
    };

    const zoomInfoStyle = {
        position: 'absolute',
        top: '15px',
        left: '15px',
        background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        color: 'var(--site-text-primary)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        zIndex: 10
    };

    const productInfoCol = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '600px',
        gap: '25px'
    };

    const statusRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '1rem',
        flexWrap: 'wrap'
    };

    const badgeStyle = (inStock) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.9rem',
        background: inStock ? (isDarkMode ? 'rgba(56, 161, 105, 0.2)' : '#c6f6d5') : (isDarkMode ? 'rgba(229, 62, 62, 0.2)' : '#fed7d7'),
        color: inStock ? '#38a169' : '#e53e3e',
    });

    const chipButton = (isActive) => ({
        padding: '8px 16px',
        borderRadius: '4px',
        border: isActive ? '2px solid var(--site-accent)' : '1px solid var(--site-border-color)',
        background: isActive ? 'var(--site-bg)' : 'var(--site-card-bg)',
        color: 'var(--site-text-primary)',
        cursor: 'pointer',
        fontWeight: isActive ? '600' : '400',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        minWidth: '60px'
    });

    const descriptionContainerStyle = {
        gridColumn: '1 / -1',
        background: 'var(--site-card-bg)',
        border: '1px solid var(--site-border-color)',
        borderRadius: '12px',
        padding: '0',
        marginTop: '40px',
        overflow: 'hidden'
    };

    const descriptionHeaderStyle = {
        background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        borderBottom: '1px solid var(--site-border-color)',
        padding: '25px 30px',
        margin: 0
    };

    const descriptionContentStyle = {
        maxHeight: '350px',
        overflowY: 'auto',
        padding: '30px',
        lineHeight: '1.7',
        color: 'var(--site-text-secondary)',
        fontSize: '1.05rem',
        textAlign: 'left',
        whiteSpace: 'pre-wrap'
    };

    const recommendationsSection = {
        marginTop: '80px',
        borderTop: '1px solid var(--site-border-color)',
        paddingTop: '40px'
    };

    const productsGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '15px',
        marginTop: '20px'
    };

    const productCard = {
        border: '1px solid var(--site-border-color)',
        borderRadius: '8px',
        background: 'var(--site-card-bg)',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        display: 'flex',
        flexDirection: 'column'
    };

    let footerBlocks = [];
    try {
        if (siteData && siteData.footer_content) {
            footerBlocks = Array.isArray(siteData.footer_content)
                ? siteData.footer_content
                : JSON.parse(siteData.footer_content);
        }
    } catch (e) {}

    const footerStyle = {
        flexShrink: 0,
        backgroundColor: siteData?.site_theme_mode === 'dark' ? '#1a202c' : '#f7fafc',
        borderTop: `1px solid ${siteData?.site_theme_mode === 'dark' ? '#2d3748' : '#e2e8f0'}`,
        marginTop: 'auto'
    };

    if (loading || isSiteLoading) return <div style={{padding: '50px', textAlign: 'center'}}>⏳ Завантаження...</div>;
    if (error || !product) return <div style={{padding: '50px', textAlign: 'center'}}>{error || 'Товар не знайдено'}</div>;

    const isOwner = user && user.id === siteData.user_id;
    const isSoldOut = product.stock_quantity === 0;

    let galleryImages = [];
    if (product.image_gallery && product.image_gallery.length > 0) {
        galleryImages = product.image_gallery.map(img => img.startsWith('http') ? img : `${API_URL}${img}`);
    } else {
        galleryImages = ['https://placehold.co/600x600?text=No+Image'];
    }

    return (
        <div style={pageWrapperStyle}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--site-border-color);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--site-text-secondary);
                }

                .zoom-controls button:hover:not(:disabled) {
                    transform: scale(1.1);
                    boxShadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .main-image-box:hover {
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                /* Блокировка выделения текста при взаимодействии с картинкой */
                .main-image-box {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }

                @media (max-width: 1200px) {
                    .products-grid-recommendations {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                }

                @media (max-width: 900px) {
                    .product-grid-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .gallery-container {
                        height: auto !important;
                        flex-direction: column-reverse !important;
                    }
                    .thumbnails-col {
                        flex-direction: row !important;
                        width: 100% !important;
                        height: 80px !important;
                        overflow-x: auto !important;
                        overflow-y: hidden !important;
                    }
                    .main-image-box {
                        height: 400px !important;
                    }
                    .product-info-col {
                        height: auto !important;
                        justify-content: flex-start !important;
                    }
                    .products-grid-recommendations {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .zoom-controls {
                        bottom: 10px !important;
                        right: 10px !important;
                    }
                }

                @media (max-width: 600px) {
                    .products-grid-recommendations {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <div style={mainContentContainer}>
                
                <div style={productLayoutGrid} className="product-grid-layout">
                    
                    <div style={galleryContainer} className="gallery-container">
                        {galleryImages.length > 1 && (
                            <div style={thumbnailsCol} className="thumbnails-col custom-scrollbar">
                                {galleryImages.map((src, idx) => (
                                    <div 
                                        key={idx}
                                        style={thumbnailBox(activeImageIndex === idx)}
                                        onClick={() => {
                                            setActiveImageIndex(idx);
                                            handleResetZoom();
                                        }}
                                    >
                                        <img src={src} alt="thumb" style={thumbnailImg} />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div 
                            ref={imageContainerRef}
                            style={mainImageBox} 
                            className="main-image-box"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                            onMouseEnter={handleMouseEnter}
                            onClick={handleImageClick}
                        >
                            <img 
                                src={galleryImages[activeImageIndex]} 
                                alt={product.name} 
                                style={mainImage} 
                                draggable="false"
                            />
                            
                            <div style={zoomInfoStyle}>
                                {Math.round(imageScale * 100)}%
                            </div>
                            
                            <div style={zoomControlsStyle} className="zoom-controls">
                                <button
                                    onClick={handleZoomOut}
                                    disabled={imageScale <= 0.5}
                                    style={imageScale <= 0.5 ? zoomButtonDisabledStyle : zoomButtonStyle}
                                    title="Зменшити"
                                >
                                    −
                                </button>
                                <button
                                    onClick={handleResetZoom}
                                    style={zoomButtonStyle}
                                    title="Скинути масштаб"
                                >
                                    1:1
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={imageScale >= 5}
                                    style={imageScale >= 5 ? zoomButtonDisabledStyle : zoomButtonStyle}
                                    title="Збільшити"
                                >
                                    +
                                </button>
                            </div>

                            {product.sale_percentage > 0 && !isSoldOut && (
                                <div style={{
                                    position: 'absolute', 
                                    top: '10px', 
                                    right: '10px',
                                    background: '#e53e3e', 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    padding: '4px 10px', 
                                    borderRadius: '4px',
                                    zIndex: 10
                                }}>
                                    -{product.sale_percentage}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={productInfoCol} className="product-info-col">
                        <div>
                            <h1 style={{
                                fontSize: '2.2rem', 
                                margin: '0 0 15px 0', 
                                color: 'var(--site-text-primary)',
                                lineHeight: '1.2',
                                textAlign: 'left'
                            }}>
                                {product.name}
                            </h1>
                            
                            <div style={statusRowStyle}>
                                <div style={badgeStyle(!isSoldOut)}>
                                    {isSoldOut ? 'Закінчився' : 'В наявності'}
                                </div>
                                
                                {product.category_name && (
                                    <span style={{
                                        color: 'var(--site-text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{opacity: 0.5}}>|</span>
                                        <span style={{fontSize: '0.9rem'}}>📂 {product.category_name}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex', 
                            alignItems: 'flex-end', 
                            gap: '15px',
                            marginBottom: '10px'
                        }}>
                            {priceData.isDiscounted ? (
                                <>
                                    <span style={{
                                        fontSize: '2.8rem', 
                                        fontWeight: 'bold', 
                                        color: 'var(--site-text-primary)'
                                    }}>
                                        {priceData.finalPrice} ₴
                                    </span>
                                    <span style={{
                                        textDecoration: 'line-through', 
                                        color: 'var(--site-text-secondary)', 
                                        fontSize: '1.4rem', 
                                        marginBottom: '8px'
                                    }}>
                                        {priceData.originalPrice} ₴
                                    </span>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '2.8rem', 
                                    fontWeight: 'bold', 
                                    color: 'var(--site-text-primary)'
                                }}>
                                    {priceData.finalPrice} ₴
                                </span>
                            )}
                        </div>

                        {product.variants && product.variants.map((variant, idx) => (
                            <div key={idx} style={{marginBottom: '20px'}}>
                                <label style={{
                                    display:'block', 
                                    marginBottom:'10px', 
                                    fontWeight:'600', 
                                    color: 'var(--site-text-secondary)',
                                    fontSize: '1rem'
                                }}>
                                    {variant.name}:
                                </label>
                                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                    {variant.values.map((val, valIdx) => (
                                        <button
                                            key={valIdx}
                                            style={chipButton(selectedOptions[variant.name] === val.label)}
                                            onClick={() => handleOptionChange(variant.name, val.label)}
                                        >
                                            {val.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{marginTop: '20px'}}>
                            <button
                                onClick={handleAddToCart}
                                disabled={isOwner || isSoldOut}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: (isSoldOut || isOwner) ? 'var(--site-text-secondary)' : 'var(--site-accent)',
                                    color: 'var(--site-accent-text)',
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    cursor: (isOwner || isSoldOut) ? 'not-allowed' : 'pointer',
                                    opacity: (isOwner || isSoldOut) ? 0.7 : 1,
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease'
                                }}
                                title={isOwner ? "Ви не можете купувати власні товари" : ""}
                            >
                                {isOwner 
                                    ? 'Ви власник цього товару' 
                                    : (isSoldOut ? 'Немає в наявності' : 'Додати в кошик')
                                }
                            </button>
                        </div>
                    </div>
                </div>

                <div style={descriptionContainerStyle}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.3rem', 
                        color: 'var(--site-text-primary)',
                        fontWeight: '700'
                    }}>
                        <div style={descriptionHeaderStyle}>
                            Характеристики та опис
                        </div>
                    </h3>
                    <div style={descriptionContentStyle} className="custom-scrollbar">
                        {product.description || 'Опис відсутній'}
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div style={recommendationsSection}>
                        <h2 style={{
                            textAlign: 'center', 
                            marginBottom: '30px', 
                            color: 'var(--site-text-primary)',
                            fontSize: '1.8rem'
                        }}>
                            Інші товари
                        </h2>
                        <div style={productsGrid} className="products-grid-recommendations">
                            {relatedProducts.map(relProd => {
                                const relImg = (relProd.image_gallery && relProd.image_gallery.length > 0) 
                                    ? (typeof relProd.image_gallery === 'string' ? JSON.parse(relProd.image_gallery)[0] : relProd.image_gallery[0]) 
                                    : null;
                                const fullRelImg = relImg ? (relImg.startsWith('http') ? relImg : `${API_URL}${relImg}`) : 'https://placehold.co/300';

                                return (
                                    <Link to={`/product/${relProd.id}`} key={relProd.id} style={productCard}>
                                        <div style={{
                                            height: '200px', 
                                            width: '100%', 
                                            background: imageBackgroundColor,
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            borderBottom: '1px solid var(--site-border-color)',
                                            padding: '15px',
                                            boxSizing: 'border-box'
                                        }}>
                                            <img 
                                                src={fullRelImg} 
                                                alt={relProd.name} 
                                                style={{
                                                    maxWidth: '100%', 
                                                    maxHeight: '100%', 
                                                    objectFit: 'contain'
                                                }} 
                                            />
                                        </div>
                                        <div style={{padding: '15px', flex: 1}}>
                                            <h4 style={{
                                                margin: '0 0 10px 0', 
                                                fontSize: '0.95rem', 
                                                color: 'var(--site-text-primary)', 
                                                lineHeight: '1.3',
                                                height: '2.6em',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {relProd.name}
                                            </h4>
                                            <div style={{
                                                fontWeight: 'bold', 
                                                color: 'var(--site-text-primary)',
                                                fontSize: '1.1rem'
                                            }}>
                                                {relProd.price} ₴
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {footerBlocks.length > 0 && (
                <footer style={footerStyle}>
                    <BlockRenderer blocks={footerBlocks} siteData={siteData} />
                    <div style={{
                        textAlign: 'center', 
                        padding: '1.5rem', 
                        opacity: 0.5, 
                        fontSize: '0.8rem', 
                        color: 'var(--site-text-primary)'
                    }}>
                        Powered by Kendr
                    </div>
                </footer>
            )}
        </div>
    );
};

export default ProductDetailPage;
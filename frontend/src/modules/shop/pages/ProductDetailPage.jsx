// frontend/src/modules/shop/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../../common/services/api';
import { CartContext } from '../../../app/providers/CartContext';
import { AuthContext } from '../../../app/providers/AuthContext';
import BlockRenderer from '../../../modules/site-editor/core/BlockRenderer';
import styles from './ProductDetailPage.module.css';

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

    const isDarkMode = siteData?.site_theme_mode === 'dark';
    const isOwner = user && user.id === siteData?.user_id;
    const isSoldOut = product?.stock_quantity === 0;
    const imageBackgroundColor = isDarkMode ? 'var(--site-card-bg)' : '#ffffff';

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

    let footerBlocks = [];
    try {
        if (siteData && siteData.footer_content) {
            footerBlocks = Array.isArray(siteData.footer_content)
                ? siteData.footer_content
                : JSON.parse(siteData.footer_content);
        }
    } catch (e) {}

    if (loading || isSiteLoading) return <div className={styles.loadingContainer}>⏳ Завантаження...</div>;
    if (error || !product) return <div className={styles.errorContainer}>{error || 'Товар не знайдено'}</div>;

    let galleryImages = [];
    if (product.image_gallery && product.image_gallery.length > 0) {
        galleryImages = product.image_gallery.map(img => img.startsWith('http') ? img : `${API_URL}${img}`);
    } else {
        galleryImages = ['https://placehold.co/600x600?text=No+Image'];
    }

    const faviconUrl = siteData?.favicon_url 
        ? (siteData.favicon_url.startsWith('http') ? siteData.favicon_url : `${API_URL}${siteData.favicon_url}`) 
        : '/icon-light.webp';
    const siteTitle = siteData?.site_title_seo || siteData?.title || 'Kendr Store';
    const pageTitle = `${product.name} | ${siteTitle}`;

    const getMainImageStyle = () => ({
        transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease',
    });

    const getButtonStyle = () => ({
        '--image-bg': imageBackgroundColor,
        '--zoom-controls-bg': isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        '--zoom-controls-border': isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        '--zoom-info-bg': isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        '--zoom-info-border': isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        '--badge-instock-bg': isDarkMode ? 'rgba(56, 161, 105, 0.2)' : '#c6f6d5',
        '--badge-outofstock-bg': isDarkMode ? 'rgba(229, 62, 62, 0.2)' : '#fed7d7',
        '--description-header-bg': isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        '--footer-bg': isDarkMode ? '#1a202c' : '#f7fafc',
        '--footer-border': isDarkMode ? '#2d3748' : '#e2e8f0',
    });

    const mainImageBoxClass = `
        ${styles.mainImageBox} 
        ${imageScale > 1 ? styles.draggable : styles.zoomable}
        ${isDragging ? styles.dragging : ''}
    `;

    return (
        <div className={styles.pageWrapper} style={getButtonStyle()}>
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="icon" type="image/webp" href={faviconUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:image" content={galleryImages[0]} />
                <meta property="og:description" content={product.description?.substring(0, 150) || product.name} />
            </Helmet>

            <div className={styles.mainContent}>
                <div className={`${styles.productGrid} product-grid-layout`}>
                    <div className={`${styles.galleryContainer} gallery-container`}>
                        {galleryImages.length > 1 && (
                            <div className={`${styles.thumbnailsCol} custom-scrollbar`}>
                                {galleryImages.map((src, idx) => (
                                    <div 
                                        key={idx}
                                        className={`${styles.thumbnailBox} ${activeImageIndex === idx ? styles.active : ''}`}
                                        onClick={() => {
                                            setActiveImageIndex(idx);
                                            handleResetZoom();
                                        }}
                                    >
                                        <img src={src} alt="thumb" className={styles.thumbnailImg} />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div 
                            ref={imageContainerRef}
                            className={mainImageBoxClass}
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
                                className={styles.mainImage}
                                style={getMainImageStyle()}
                                draggable="false"
                            />
                            
                            <div className={styles.zoomInfo}>
                                {Math.round(imageScale * 100)}%
                            </div>
                            
                            <div className={`${styles.zoomControls} zoom-controls`}>
                                <button
                                    onClick={handleZoomOut}
                                    disabled={imageScale <= 0.5}
                                    className={styles.zoomButton}
                                    title="Зменшити"
                                >
                                    −
                                </button>
                                <button
                                    onClick={handleResetZoom}
                                    className={styles.zoomButton}
                                    title="Скинути масштаб"
                                >
                                    1:1
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={imageScale >= 5}
                                    className={styles.zoomButton}
                                    title="Збільшити"
                                >
                                    +
                                </button>
                            </div>

                            {product.sale_percentage > 0 && !isSoldOut && (
                                <div className={styles.saleBadge}>
                                    -{product.sale_percentage}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`${styles.productInfoCol} product-info-col`}>
                        <div>
                            <h1 className={styles.productTitle}>
                                {product.name}
                            </h1>
                            
                            <div className={styles.statusRow}>
                                <div className={`${styles.badge} ${isSoldOut ? styles.outOfStock : styles.inStock}`}>
                                    {isSoldOut ? 'Закінчився' : 'В наявності'}
                                </div>
                                
                                {product.category_name && (
                                    <span className={styles.categoryTag}>
                                        <span className={styles.categoryName}>📂 {product.category_name}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.priceContainer}>
                            {priceData.isDiscounted ? (
                                <>
                                    <span className={styles.finalPrice}>
                                        {priceData.finalPrice} ₴
                                    </span>
                                    <span className={styles.originalPrice}>
                                        {priceData.originalPrice} ₴
                                    </span>
                                </>
                            ) : (
                                <span className={styles.finalPrice}>
                                    {priceData.finalPrice} ₴
                                </span>
                            )}
                        </div>

                        {product.variants && product.variants.map((variant, idx) => (
                            <div key={idx} className={styles.variantContainer}>
                                <label className={styles.variantLabel}>
                                    {variant.name}:
                                </label>
                                <div className={styles.variantOptions}>
                                    {variant.values.map((val, valIdx) => (
                                        <button
                                            key={valIdx}
                                            className={`${styles.chipButton} ${selectedOptions[variant.name] === val.label ? styles.active : ''}`}
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
                                className={`${styles.addToCartButton} ${(isOwner || isSoldOut) ? styles.disabled : styles.available}`}
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

                <div className={styles.descriptionContainer}>
                    <div className={styles.descriptionHeader}>
                        Характеристики та опис
                    </div>
                    <div className={`${styles.descriptionContent} custom-scrollbar`}>
                        {product.description || 'Опис відсутній'}
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className={styles.recommendationsSection}>
                        <h2 style={{
                            textAlign: 'center', 
                            marginBottom: '30px', 
                            color: 'var(--site-text-primary)',
                            fontSize: '1.8rem'
                        }}>
                            Інші товари
                        </h2>
                        <div className={`${styles.productsGrid} products-grid-recommendations`}>
                            {relatedProducts.map(relProd => {
                                const relImg = (relProd.image_gallery && relProd.image_gallery.length > 0) 
                                    ? (typeof relProd.image_gallery === 'string' ? JSON.parse(relProd.image_gallery)[0] : relProd.image_gallery[0]) 
                                    : null;
                                const fullRelImg = relImg ? (relImg.startsWith('http') ? relImg : `${API_URL}${relImg}`) : 'https://placehold.co/300';

                                return (
                                    <Link to={`/product/${relProd.id}`} key={relProd.id} className={styles.productCard}>
                                        <div className={styles.productImageContainer}>
                                            <img 
                                                src={fullRelImg} 
                                                alt={relProd.name} 
                                                className={styles.productCardImage}
                                            />
                                        </div>
                                        <div className={styles.productCardContent}>
                                            <h4 className={styles.productCardTitle}>
                                                {relProd.name}
                                            </h4>
                                            <div className={styles.productCardPrice}>
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
                <footer className={styles.footer}>
                    <BlockRenderer blocks={footerBlocks} siteData={siteData} />
                    <div className={styles.footerText}>
                        Powered by Kendr
                    </div>
                </footer>
            )}
        </div>
    );
};

export default ProductDetailPage;
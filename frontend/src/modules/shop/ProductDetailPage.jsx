// frontend/src/modules/shop/ProductDetailPage.jsx
import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../shared/api/api';
import { CartContext } from '../../app/providers/CartContext';
import { AuthContext } from '../../app/providers/AuthContext';
import BlockRenderer from '../editor/core/BlockRenderer';
import ProductCard from '../editor/ui/components/ProductCard'; 
import MaintenancePage from '../../pages/MaintenancePage'; 
import NotFoundPage from '../../pages/NotFoundPage';
import CookieBanner from '../renderer/components/CookieBanner';
import styles from './ProductDetailPage.module.css';
import { BASE_URL } from '../../shared/config';
import { Folder, Grid, Tag, ShoppingBag, Package, Star, Heart, Home, Gift, Truck, Zap, Camera, Music, Smartphone, Coffee, Briefcase, MapPin, Image as ImageIcon, Video, User } from 'lucide-react';

const ICON_MAP = {
    folder: Folder, grid: Grid, tag: Tag, bag: ShoppingBag,
    box: Package, star: Star, heart: Heart, home: Home,
    gift: Gift, truck: Truck, zap: Zap, camera: Camera,
    music: Music, phone: Smartphone, coffee: Coffee, briefcase: Briefcase,
    map: MapPin, image: ImageIcon, video: Video, user: User
};

const safeParseFloat = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
};

const getGlobalBlocks = (content, blockType) => {
    if (!content) return [];
    let parsed = content;
    if (typeof content === 'string') {
        try { parsed = JSON.parse(content); } catch (e) { return []; }
    }
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        return parsed;
    }
    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
        return [{ block_id: `sys-${blockType}`, type: blockType, data: parsed }];
    }
    return [];
};

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const outletContext = useOutletContext() || {};
    const { siteData = null, isSiteLoading = false } = outletContext;
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [imageScale, setImageScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const imageContainerRef = useRef(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [priceData, setPriceData] = useState({
        finalPrice: 0, originalPrice: 0, activeDiscount: 0, isDiscounted: false
    });
    const isDarkMode = siteData?.site_theme_mode === 'dark';
    const isOwner = user && siteData && user.id === siteData.user_id;
    const isStaff = user && (user.role === 'admin' || user.role === 'moderator');
    const isSiteHidden = siteData && siteData.status === 'maintenance' && !isOwner;
    const isSoldOut = product ? product.stock_quantity === 0 : false;
    const headerBlocks = useMemo(() => getGlobalBlocks(siteData?.header_content, 'global-header'), [siteData?.header_content]);
    const footerBlocks = useMemo(() => getGlobalBlocks(siteData?.footer_content, 'global-footer'), [siteData?.footer_content]);
    const currencyMap = { 'UAH': '₴', 'USD': '$', 'EUR': '€' };
    const siteCurrency = siteData?.currency || 'UAH';
    const currencySymbol = currencyMap[siteCurrency] || '₴';
    useEffect(() => {
        if (isSiteHidden) {
            setLoading(false);
            return;
        }
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setIsNotFound(false);
                setIsRestricted(false);
                if (!productId) throw new Error("No ID");
                const response = await apiClient.get(`/products/${productId}`);
                const prod = response.data;
                if (!prod || Object.keys(prod).length === 0) throw new Error("Empty product");
                ['variants', 'image_gallery'].forEach(key => {
                    if (prod[key] && typeof prod[key] === 'string') {
                        try { prod[key] = JSON.parse(prod[key]); } catch (e) { prod[key] = null; }
                    }
                });
                setProduct(prod);
                setActiveImageIndex(0);
                if (Array.isArray(prod.variants) && prod.variants.length > 0) {
                    const defaults = {};
                    prod.variants.forEach(v => {
                        if (v?.name && v.values?.[0]) defaults[v.name] = v.values[0].label;
                    });
                    setSelectedOptions(defaults);
                }
                
                const primaryCategoryId = (prod.categories && prod.categories.length > 0) ? prod.categories[0].id : null;
                if (prod.site_id) fetchRecommendations(prod.site_id, primaryCategoryId, prod.id);
            } catch (err) {
                console.error("Product load error:", err);
                if (err.response && (err.response.status === 403 || err.response.data?.code === 'SITE_MAINTENANCE_MODE' || err.response.data?.code === 'SITE_DRAFT_MODE')) {
                    setIsRestricted(true);
                } else {
                    setIsNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        };
        if (!isSiteLoading) fetchProduct();
    }, [productId, isSiteHidden, isSiteLoading]);

    const fetchRecommendations = async (siteId, categoryId, currentId) => {
        try {
            const res = await apiClient.get(`/products/site/${siteId}`);
            if (Array.isArray(res.data)) {
                const others = res.data
                    .filter(p => p.id !== currentId)
                    .sort((a, b) => {
                        const aHasCat = a.category_ids?.includes(String(categoryId)) ? 1 : 0;
                        const bHasCat = b.category_ids?.includes(String(categoryId)) ? 1 : 0;
                        return bHasCat - aHasCat;
                    })
                    .slice(0, 6);
                setRelatedProducts(others);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!product) return;
        let basePrice = safeParseFloat(product.price);
        let maxVariantDiscount = 0;
        if (Array.isArray(product.variants)) {
            product.variants.forEach(v => {
                if (!v) return;
                const selectedVal = selectedOptions[v.name];
                const optionObj = v.values?.find(val => val.label === selectedVal);
                if (optionObj) {
                    if (optionObj.priceModifier) basePrice += safeParseFloat(optionObj.priceModifier);
                    if (optionObj.salePercentage > 0) maxVariantDiscount = Math.max(maxVariantDiscount, safeParseFloat(optionObj.salePercentage));
                }
            });
        }
        const prodSale = safeParseFloat(product.sale_percentage);
        let maxCategoryDiscount = 0;
        if (product.categories && product.categories.length > 0) {
             maxCategoryDiscount = Math.max(...product.categories.map(c => safeParseFloat(c.discount_percentage)));
        }
        let activeDiscount = maxVariantDiscount || prodSale || maxCategoryDiscount || 0;
        const finalPrice = Math.round(basePrice * (1 - activeDiscount / 100));
        setPriceData({
            finalPrice, originalPrice: basePrice, activeDiscount, isDiscounted: activeDiscount > 0
        });
    }, [selectedOptions, product]);

    const handleZoom = useCallback((direction) => {
        setImageScale(prev => {
            let newScale = direction === 'in' ? Math.min(prev + 0.25, 5) : Math.max(prev - 0.25, 0.5);
            if (direction === 'reset') newScale = 1;
            if (newScale === 1) setImagePosition({ x: 0, y: 0 });
            return newScale;
        });
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (isDragging && imageScale > 1) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            const maxDrag = 200;
            setImagePosition({
                x: Math.max(Math.min(newX, maxDrag), -maxDrag),
                y: Math.max(Math.min(newY, maxDrag), -maxDrag)
            });
            e.preventDefault();
            return;
        }
        if (imageContainerRef.current && imageScale > 1 && !isDragging) {
            const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            const factor = imageScale - 1;
            const maxMove = 150;
            setImagePosition({ 
                x: Math.max(Math.min((width / 2 - x) * factor, maxMove), -maxMove), 
                y: Math.max(Math.min((height / 2 - y) * factor, maxMove), -maxMove) 
            });
        }
    }, [isDragging, dragStart, imageScale]);

    const handleAddToCart = () => {
        if (isStaff) return;
        if (!user) {
            if (window.confirm("Щоб додати товар до кошика, необхідно увійти. Перейти на сторінку входу?")) navigate('/login');
            return;
        }
        const productForCart = {
            ...product,
            site_path: siteData?.site_path,
            site_name: siteData?.title,
            currency: siteCurrency
        };
        addToCart(productForCart, selectedOptions, {
            finalPrice: priceData.finalPrice, originalPrice: priceData.originalPrice, discount: priceData.activeDiscount
        });
    };

    if (loading || isSiteLoading) return <div className={styles.loadingContainer}>⏳ Завантаження...</div>;
    if (isSiteHidden || isRestricted) {
        return (
            <MaintenancePage 
                logoUrl={siteData?.logo_url} 
                siteName={siteData?.title || 'Site'} 
                themeSettings={siteData?.theme_settings} 
            />
        );
    }
    if (isNotFound || !product || Object.keys(product).length === 0) return <NotFoundPage />;
    const galleryImages = (product.image_gallery && Array.isArray(product.image_gallery) && product.image_gallery.length > 0)
        ? product.image_gallery.map(img => img.startsWith('http') ? img : `${BASE_URL}${img}`)
        : ['https://placehold.co/600x600?text=No+Image'];
    const faviconUrl = siteData?.favicon_url?.startsWith('http') ? siteData.favicon_url : `${BASE_URL}${siteData?.favicon_url || '/icon-light.webp'}`;
    const pageTitle = `${product.name || 'Товар'} | ${siteData?.site_title_seo || siteData?.title || 'Kendr Store'}`;
    const dynamicStyles = {
        '--zoom-controls-bg': isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        '--zoom-controls-border': isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        '--zoom-info-bg': isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        '--badge-instock-bg': 'color-mix(in srgb, var(--site-accent), transparent 85%)',
        '--badge-outofstock-bg': 'color-mix(in srgb, var(--platform-danger), transparent 90%)',
        '--footer-bg': 'var(--site-bg)',
        '--footer-border': 'var(--site-border-color)',
        color: 'var(--site-text-primary)',
    };

    return (
        <div 
            className={`${styles.pageWrapper} site-theme-context`} 
            style={dynamicStyles}
            data-site-mode={siteData?.site_theme_mode || 'light'}
            data-site-accent={siteData?.site_theme_accent || 'orange'}
        >
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="icon" type="image/webp" href={faviconUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:image" content={galleryImages[0]} />
            </Helmet>
            {headerBlocks.length > 0 && (
                <div 
                    className="w-full shrink-0 z-50 relative"
                    style={{ 
                        position: headerBlocks[0].data?.is_sticky ? 'sticky' : 'relative', 
                        top: headerBlocks[0].data?.is_sticky ? 0 : 'auto', 
                        zIndex: 9999 
                    }}
                >
                    <BlockRenderer 
                        blocks={headerBlocks} 
                        siteData={siteData} 
                        isEditorPreview={false} 
                    />
                </div>
            )}
            <div className={styles.mainContent}>
                <div className={styles.productGrid}>
                    <div className={styles.galleryContainer}>
                        {galleryImages.length > 1 && (
                            <div className={`${styles.thumbnailsCol} custom-scrollbar`}>
                                {galleryImages.map((src, idx) => (
                                    <div 
                                        key={idx}
                                        className={`${styles.thumbnailBox} ${activeImageIndex === idx ? styles.active : ''}`}
                                        onClick={() => { setActiveImageIndex(idx); handleZoom('reset'); }}
                                    >
                                        <img src={src} alt="thumb" className={styles.thumbnailImg} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div 
                            ref={imageContainerRef}
                            className={`${styles.mainImageBox} ${imageScale > 1 ? (isDragging ? styles.dragging : styles.draggable) : styles.zoomable}`}
                            onMouseDown={(e) => { if (imageScale > 1) { setIsDragging(true); setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y }); } e.preventDefault(); }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => { setIsHovering(false); if(imageScale > 1) handleZoom('reset'); }}
                            onMouseEnter={() => { setIsHovering(true); if(imageScale === 1) handleZoom('in'); }}
                            onClick={() => imageScale === 1 ? handleZoom('in') : handleZoom('reset')}
                        >
                            <img 
                                src={galleryImages[activeImageIndex]} 
                                alt={product.name || 'Product'} 
                                className={styles.mainImage}
                                style={{ transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)` }}
                                draggable="false"
                            />
                            <div className={styles.zoomInfo}>{Math.round(imageScale * 100)}%</div>
                            <div className={`${styles.zoomControls} zoom-controls`}>
                                <button onClick={(e) => { e.stopPropagation(); handleZoom('out'); }} disabled={imageScale <= 0.5} className={styles.zoomButton}>−</button>
                                <button onClick={(e) => { e.stopPropagation(); handleZoom('reset'); }} className={styles.zoomButton}>1:1</button>
                                <button onClick={(e) => { e.stopPropagation(); handleZoom('in'); }} disabled={imageScale >= 5} className={styles.zoomButton}>+</button>
                            </div>
                            {product.sale_percentage > 0 && !isSoldOut && (
                                <div className={styles.saleBadge}>-{product.sale_percentage}%</div>
                            )}
                        </div>
                    </div>
                    <div className={styles.productInfoCol}>
                        <div>
                            <h1 className={styles.productTitle}>{product.name || 'Товар'}</h1>
                            <div className={styles.statusRow}>
                                <div 
                                    className={`${styles.badge} ${isSoldOut ? styles.outOfStock : styles.inStock}`}
                                    style={!isSoldOut ? { color: 'var(--site-accent)' } : undefined}
                                >
                                    {isSoldOut ? 'Закінчився' : 'В наявності'}
                                </div>
                                {product.categories && product.categories.length > 0 && product.categories.map(c => {
                                    const CatIcon = ICON_MAP[c.icon] || Folder;
                                    return (
                                        <div key={c.id} className={styles.categoryTag}>
                                            <CatIcon size={16} style={{color: 'var(--site-accent)'}} />
                                            <span>{c.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={styles.priceContainer}>
                            {priceData.isDiscounted ? (
                                <>
                                    <span className={styles.finalPrice}>{priceData.finalPrice} {currencySymbol}</span>
                                    <span className={styles.originalPrice}>{priceData.originalPrice} {currencySymbol}</span>
                                </>
                            ) : (
                                <span className={styles.finalPrice}>{priceData.finalPrice} {currencySymbol}</span>
                            )}
                        </div>
                        {product.variants?.map((variant, idx) => (
                            <div key={idx} className={styles.variantContainer}>
                                <label className={styles.variantLabel}>{variant.name}:</label>
                                <div className={styles.variantOptions}>
                                    {variant.values.map((val, valIdx) => (
                                        <button
                                            key={valIdx}
                                            className={`${styles.chipButton} ${selectedOptions[variant.name] === val.label ? styles.active : ''}`}
                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [variant.name]: val.label }))}
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
                                disabled={isOwner || isSoldOut || isStaff}
                                className={`${styles.addToCartButton} ${(isOwner || isSoldOut || isStaff) ? styles.disabled : styles.available}`}
                            >
                                {isStaff ? 'Купівля недоступна для персоналу' : isOwner ? 'Ви власник цього товару' : (isSoldOut ? 'Немає в наявності' : 'Додати в кошик')}
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.descriptionContainer}>
                    <div className={styles.descriptionHeader}>Характеристики та опис</div>
                    <div className={`${styles.descriptionContent} custom-scrollbar`}>
                        {product.description || 'Опис відсутній'}
                    </div>
                </div>
                {relatedProducts.length > 0 && (
                    <div className={styles.recommendationsSection}>
                        <h2 className={styles.recommendationsTitle}>Інші товари</h2>
                        <div className={styles.productsGrid}>
                            {relatedProducts.map(relProd => (
                                <div key={relProd.id} style={{ height: '100%', minWidth: 0 }}>
                                    <ProductCard product={relProd} isEditorPreview={false} siteData={siteData} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {footerBlocks.length > 0 && (
                <div className="w-full shrink-0">
                    <BlockRenderer 
                        blocks={footerBlocks} 
                        siteData={siteData} 
                        isEditorPreview={false} 
                    />
                </div>
            )}
            <CookieBanner 
                enabled={siteData?.cookie_banner_enabled} 
                text={siteData?.cookie_banner_text} 
                siteId={siteData?.id} 
            />
        </div>
    );
};

export default ProductDetailPage;
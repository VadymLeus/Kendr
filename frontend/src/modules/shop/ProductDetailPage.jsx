// frontend/src/modules/shop/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../shared/api/api';
import { CartContext } from '../../app/providers/CartContext';
import { AuthContext } from '../../app/providers/AuthContext';
import BlockRenderer from '../editor/core/BlockRenderer';
import { Folder } from 'lucide-react';
import ProductCard from '../editor/ui/components/ProductCard'; 
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
    const isOwner = user && user.id === siteData?.user_id;
    const isSoldOut = product?.stock_quantity === 0;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/products/${productId}`);
                const prod = response.data;
                ['variants', 'image_gallery'].forEach(key => {
                    if (typeof prod[key] === 'string') {
                        try { prod[key] = JSON.parse(prod[key]); } catch (e) {}
                    }
                });
                
                setProduct(prod);
                setActiveImageIndex(0);

                if (prod.variants?.length) {
                    const defaults = {};
                    prod.variants.forEach(v => {
                        if (v.values?.[0]) defaults[v.name] = v.values[0].label;
                    });
                    setSelectedOptions(defaults);
                }

                if (prod.site_id) fetchRecommendations(prod.site_id, prod.category_id, prod.id);

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
            const others = res.data
                .filter(p => p.id !== currentId)
                .sort((a, b) => (b.category_id === categoryId ? 1 : 0) - (a.category_id === categoryId ? 1 : 0))
                .slice(0, 6);
            setRelatedProducts(others);
        } catch (e) {
            console.error("Error fetching related products", e);
        }
    };

    useEffect(() => {
        if (!product) return;

        let basePrice = parseFloat(product.price);
        let maxVariantDiscount = 0;

        if (product.variants?.length) {
            product.variants.forEach(v => {
                const selectedVal = selectedOptions[v.name];
                const optionObj = v.values.find(val => val.label === selectedVal);
                
                if (optionObj) {
                    if (optionObj.priceModifier) basePrice += parseFloat(optionObj.priceModifier);
                    if (optionObj.salePercentage > 0) maxVariantDiscount = Math.max(maxVariantDiscount, optionObj.salePercentage);
                }
            });
        }

        let activeDiscount = maxVariantDiscount || product.sale_percentage || product.category_discount || 0;
        const finalPrice = Math.round(basePrice * (1 - activeDiscount / 100));

        setPriceData({
            finalPrice,
            originalPrice: basePrice,
            activeDiscount,
            isDiscounted: activeDiscount > 0
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

    if (loading || isSiteLoading) return <div className={styles.loadingContainer}>⏳ Завантаження...</div>;
    if (error || !product) return <div className={styles.errorContainer}>{error || 'Товар не знайдено'}</div>;

    const galleryImages = product.image_gallery?.length > 0 
        ? product.image_gallery.map(img => img.startsWith('http') ? img : `${API_URL}${img}`)
        : ['https://placehold.co/600x600?text=No+Image'];
    const faviconUrl = siteData?.favicon_url?.startsWith('http') ? siteData.favicon_url : `${API_URL}${siteData?.favicon_url || '/icon-light.webp'}`;
    const pageTitle = `${product.name} | ${siteData?.site_title_seo || siteData?.title || 'Kendr Store'}`;
    const dynamicStyles = {
        '--zoom-controls-bg': isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        '--zoom-controls-border': isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        '--zoom-info-bg': isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        '--badge-instock-bg': isDarkMode ? 'rgba(56, 161, 105, 0.2)' : '#c6f6d5',
        '--badge-outofstock-bg': isDarkMode ? 'rgba(229, 62, 62, 0.2)' : '#fed7d7',
        '--footer-bg': isDarkMode ? '#1a202c' : '#f7fafc',
        '--footer-border': isDarkMode ? '#2d3748' : '#e2e8f0',
    };

    return (
        <div className={styles.pageWrapper} style={dynamicStyles}>
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="icon" type="image/webp" href={faviconUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:image" content={galleryImages[0]} />
            </Helmet>

            <div className={styles.mainContent}>
                <div className={styles.productGrid}>
                    <div className={styles.galleryContainer}>
                        {galleryImages.length > 1 && (
                            <div className={styles.thumbnailsCol}>
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
                                alt={product.name} 
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
                            <h1 className={styles.productTitle}>{product.name}</h1>
                            <div className={styles.statusRow}>
                                <div className={`${styles.badge} ${isSoldOut ? styles.outOfStock : styles.inStock}`}>
                                    {isSoldOut ? 'Закінчився' : 'В наявності'}
                                </div>
                                {product.category_name && (
                                    <div className={styles.categoryTag}>
                                        <Folder size={18} style={{color: 'var(--site-accent)'}} />
                                        <span>{product.category_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.priceContainer}>
                            {priceData.isDiscounted ? (
                                <>
                                    <span className={styles.finalPrice}>{priceData.finalPrice} ₴</span>
                                    <span className={styles.originalPrice}>{priceData.originalPrice} ₴</span>
                                </>
                            ) : (
                                <span className={styles.finalPrice}>{priceData.finalPrice} ₴</span>
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
                                disabled={isOwner || isSoldOut}
                                className={`${styles.addToCartButton} ${(isOwner || isSoldOut) ? styles.disabled : styles.available}`}
                            >
                                {isOwner ? 'Ви власник цього товару' : (isSoldOut ? 'Немає в наявності' : 'Додати в кошик')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.descriptionContainer}>
                    <div className={styles.descriptionHeader}>Характеристики та опис</div>
                    <div className={styles.descriptionContent}>
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

            {siteData?.footer_content && (
                <footer className={styles.footer}>
                    <BlockRenderer 
                        blocks={Array.isArray(siteData.footer_content) ? siteData.footer_content : JSON.parse(siteData.footer_content)} 
                        siteData={siteData} 
                    />
                    <div className={styles.footerText}>Powered by Kendr</div>
                </footer>
            )}
        </div>
    );
};

export default ProductDetailPage;
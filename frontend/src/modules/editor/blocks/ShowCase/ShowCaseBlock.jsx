// frontend/src/modules/site-editor/blocks/ShowCase/ShowCaseBlock.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import apiClient from '../../api';
import { Link } from 'react-router-dom';
import { IconShoppingBag } from '../../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';
const ProductCard = ({ product, isEditorPreview, siteData }) => {
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
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

    const handleMouseEnter = () => {
        if (isEditorPreview || images.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveImgIndex(prev => (prev + 1) % images.length);
                setIsTransitioning(false);
            }, 300);
        }, 1500);
    };

    const handleMouseLeave = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveImgIndex(0);
            setIsTransitioning(false);
        }, 300);
    };

    const hasDiscount = product.sale_percentage > 0;
    const finalPrice = hasDiscount 
        ? Math.round(product.price * (1 - product.sale_percentage / 100)) 
        : product.price;

    return (
        <div style={{
            border: '1px solid var(--site-border-color)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'var(--site-card-bg)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            position: 'relative'
        }}
        onMouseEnter={(e) => {
            handleMouseEnter();
            if(!isEditorPreview) e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
            handleMouseLeave();
            if(!isEditorPreview) e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
            <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', backgroundColor: 'var(--site-bg)' }}>
                {images.map((imgSrc, idx) => (
                    <img 
                        key={idx}
                        src={imgSrc} 
                        alt={product.name}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            objectFit: 'contain', padding: '10px', boxSizing: 'border-box',
                            opacity: idx === activeImgIndex ? 1 : 0,
                            transform: `scale(${idx === activeImgIndex ? 1 : 1.05})`,
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                            zIndex: 1
                        }}
                    />
                ))}
                {images.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: '10px', left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 2
                    }}>
                        {images.map((_, idx) => (
                            <div key={idx} style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: idx === activeImgIndex ? 'var(--site-accent)' : 'rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease'
                            }} />
                        ))}
                    </div>
                )}
                {hasDiscount && (
                    <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: '#e53e3e', color: 'white',
                        padding: '2px 6px', borderRadius: '4px',
                        fontSize: '0.75rem', fontWeight: 'bold', zIndex: 3
                    }}>
                        -{product.sale_percentage}%
                    </div>
                )}
            </div>
            
            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{
                    margin: '0 0 4px 0', fontSize: '0.95rem', 
                    color: 'var(--site-text-primary)',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    {product.name}
                </h4>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    {hasDiscount ? (
                        <>
                            <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>{finalPrice} ₴</span>
                            <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--site-text-secondary)' }}>{product.price} ₴</span>
                        </>
                    ) : (
                        <span style={{ color: 'var(--site-text-primary)', fontWeight: 'bold' }}>{product.price} ₴</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShowCaseBlock = ({ blockData, siteData, isEditorPreview }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const columns = blockData.columns || 4;
    const gap = blockData.gap || 20;
    const sourceType = blockData.source_type || 'category';
    const title = blockData.title || '';
    const alignment = blockData.alignment || 'center'; 

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let params = {};
                if (sourceType === 'manual') {
                    if (blockData.selected_product_ids?.length > 0) {
                        params.ids = blockData.selected_product_ids.join(',');
                    } else {
                        setProducts([]);
                        setLoading(false);
                        return;
                    }
                } else {
                    params.category = blockData.category_id || 'all';
                    params.limit = blockData.limit || 8;
                    if (siteData?.id) params.siteId = siteData.id;
                }
                const res = await apiClient.get('/products', { params });
                setProducts(res.data);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (siteData?.id) fetchProducts();
    }, [blockData, siteData?.id, sourceType]);

    const containerStyle = {
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: isEditorPreview ? 'var(--site-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none'
    };

    const gridStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        margin: `0 -${gap/2}px`,
        rowGap: `${gap}px`,
        justifyContent: alignment 
    };

    const itemStyle = {
        padding: `0 ${gap/2}px`,
        width: `calc(100% / ${columns})`,
        boxSizing: 'border-box'
    };

    return (
        <div style={containerStyle}>
            {title && (
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--site-text-primary)' }}>
                    {title}
                </h2>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--site-text-secondary)' }}>
                    Завантаження товарів...
                </div>
            ) : products.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '40px', 
                    color: 'var(--site-text-secondary)', 
                    border: '1px dashed var(--site-border-color)', borderRadius: '12px',
                    backgroundColor: 'var(--site-card-bg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--site-text-secondary)'
                    }}>
                        <IconShoppingBag size={32} />
                    </div>
                    <div>
                        <strong>Товарів не знайдено</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Перевірте налаштування категорії або додайте товари.</p>
                    </div>
                </div>
            ) : (
                <div style={gridStyle}>
                    {products.map(product => (
                        <div key={product.id} style={itemStyle} className="product-col">
                            <Link 
                                to={`/product/${product.id}`} 
                                style={{ textDecoration: 'none', height: '100%', display: 'block', pointerEvents: isEditorPreview ? 'none' : 'auto' }}
                            >
                                <ProductCard 
                                    product={product} 
                                    isEditorPreview={isEditorPreview} 
                                    siteData={siteData} 
                                />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            
            <style>{`
                @media (max-width: 1024px) {
                    .product-col { width: calc(100% / ${Math.min(3, columns)}) !important; }
                }
                @media (max-width: 768px) {
                    .product-col { width: calc(100% / 2) !important; }
                }
                @media (max-width: 480px) {
                    .product-col { width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

export default ShowCaseBlock;
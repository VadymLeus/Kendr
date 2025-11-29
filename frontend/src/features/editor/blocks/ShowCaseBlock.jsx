// frontend/src/features/editor/blocks/ShowCaseBlock.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const ProductCard = ({ product, isEditorPreview }) => {
    const imgUrl = product.image_gallery?.[0] ? `${API_URL}${product.image_gallery[0]}` : 'https://placehold.co/300';
    
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
            flexDirection: 'column'
        }}>
            <div style={{position: 'relative', paddingTop: '100%', overflow: 'hidden'}}>
                <img 
                    src={imgUrl} 
                    alt={product.name}
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%', objectFit: 'cover'
                    }}
                />
                {hasDiscount && (
                    <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: '#e53e3e', color: 'white',
                        padding: '4px 8px', borderRadius: '4px',
                        fontSize: '0.8rem', fontWeight: 'bold'
                    }}>
                        -{product.sale_percentage}%
                    </div>
                )}
            </div>
            <div style={{padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                <h4 style={{
                    margin: '0 0 8px 0', 
                    fontSize: '1rem', 
                    color: 'var(--site-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                    {product.name}
                </h4>
                <div style={{marginTop: 'auto'}}>
                    {hasDiscount ? (
                        <div style={{display: 'flex', alignItems: 'baseline', gap: '8px'}}>
                            <span style={{color: '#e53e3e', fontWeight: 'bold'}}>{finalPrice} ₴</span>
                            <span style={{textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--site-text-secondary)'}}>
                                {product.price} ₴
                            </span>
                        </div>
                    ) : (
                        <span style={{color: 'var(--site-text-primary)', fontWeight: 'bold'}}>
                            {product.price} ₴
                        </span>
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
    const sourceType = blockData.source_type || 'category';
    const title = blockData.title || '';

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

        if (siteData?.id) {
            fetchProducts();
        }
    }, [blockData, siteData?.id]);

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
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px'
    };

    const itemWidth = `calc((100% - ${(columns - 1) * 20}px) / ${columns})`;

    return (
        <div style={containerStyle}>
            {title && (
                <h2 style={{
                    textAlign: 'center', 
                    marginBottom: '20px', 
                    color: 'var(--site-text-primary)'
                }}>
                    {title}
                </h2>
            )}

            {loading ? (
                <div style={{textAlign: 'center', padding: '20px', color: 'var(--site-text-secondary)'}}>
                    Завантаження товарів...
                </div>
            ) : products.length === 0 ? (
                <div style={{textAlign: 'center', padding: '20px', color: 'var(--site-text-secondary)', border: '1px dashed #ccc', borderRadius: '8px'}}>
                    Товарів не знайдено (налаштуйте блок)
                </div>
            ) : (
                <div style={gridStyle}>
                    {products.map(product => (
                        <div key={product.id} style={{ width: itemWidth, minWidth: '200px', flexGrow: 0, flexShrink: 0 }}>
                            <Link 
                                to={`/product/${product.id}`} 
                                style={{textDecoration: 'none', pointerEvents: isEditorPreview ? 'none' : 'auto'}}
                            >
                                <ProductCard product={product} isEditorPreview={isEditorPreview} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Адаптивність для мобільних */}
            <style>{`
                @media (max-width: 768px) {
                    .product-card-wrapper {
                        width: calc(50% - 10px) !important; 
                    }
                }
                @media (max-width: 480px) {
                    .product-card-wrapper {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShowCaseBlock;
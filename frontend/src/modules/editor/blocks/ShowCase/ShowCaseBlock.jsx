// frontend/src/modules/editor/blocks/ShowCase/ShowCaseBlock.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../shared/api/api';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import ProductCard from '../../ui/components/ProductCard';
import { ShoppingBag } from 'lucide-react';

const ShowCaseBlock = ({ blockData, siteData, isEditorPreview }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        columns = 4,
        source_type = 'category',
        title = '',
        alignment = 'center',
        height = 'auto', 
        titleFontFamily,
        styles = {} 
    } = blockData;

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily
    }, siteData);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let params = {};
                if (source_type === 'manual') {
                    if (blockData.selected_product_ids?.length > 0) {
                        params.ids = blockData.selected_product_ids.join(',');
                    } else {
                        setProducts([]);
                        setLoading(false);
                        return;
                    }
                } else {
                    if (blockData.category_id > 0) {
                        params.category = blockData.category_id;
                    }
                    params.limit = 20;
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
    }, [blockData.selected_product_ids, blockData.category_id, source_type, siteData?.id]);

    const heightMap = {
        small: '300px',
        medium: '500px',
        large: '700px',
        full: 'calc(100vh - 80px)',
        auto: 'auto'
    };
    const currentHeight = heightMap[height] || 'auto';
    const isFixedHeight = currentHeight !== 'auto';

    const uniqueClass = `showcase-${blockData.id || 'preview'}`;

    const containerStyle = {
        padding: '40px 20px', 
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: isEditorPreview ? 'var(--site-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        minHeight: currentHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isFixedHeight ? 'center' : 'flex-start',
        ...styles 
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, 
        gap: '24px',
        width: '100%',
        justifyContent: alignment === 'center' ? 'center' : (alignment === 'right' ? 'end' : 'start')
    };

    return (
        <div style={containerStyle} className={uniqueClass}>
            <RenderFonts />
            <style>{`.${uniqueClass} { ${Object.entries(cssVariables).map(([k,v]) => `${k}:${v}`).join(';')} }`}</style>
            
            <style>{`
                @media (max-width: 1024px) {
                    .${uniqueClass} .showcase-grid {
                        grid-template-columns: repeat(${Math.min(3, columns)}, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 768px) {
                    .${uniqueClass} .showcase-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 480px) {
                    .${uniqueClass} .showcase-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                }
            `}</style>

            {title && (
                <h2 style={{ 
                    textAlign: alignment, 
                    marginBottom: '32px', 
                    color: 'var(--site-text-primary)',
                    fontFamily: fontStyles.title,
                    fontSize: '2rem',
                    lineHeight: '1.2'
                }}>
                    {title}
                </h2>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--site-text-secondary)' }}>
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
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <strong>Товарів не знайдено</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Перевірте налаштування категорії або додайте товари.</p>
                    </div>
                </div>
            ) : (
                <div style={gridStyle} className="showcase-grid">
                    {products.map(product => (
                        <div key={product.id} style={{ height: '100%' }}>
                            <ProductCard 
                                product={product} 
                                isEditorPreview={isEditorPreview} 
                                siteData={siteData}
                                fontStyles={fontStyles}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShowCaseBlock;
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

    const heightClasses = {
        small: 'min-h-[300px]',
        medium: 'min-h-[500px]',
        large: 'min-h-[700px]',
        full: 'min-h-[calc(100vh-80px)]',
        auto: 'min-h-auto'
    };
    const currentHeightClass = heightClasses[height] || 'min-h-auto';
    const isFixedHeight = height !== 'auto';
    const uniqueClass = `showcase-${blockData.id || 'preview'}`;
    const alignmentClasses = {
        center: 'justify-center',
        right: 'justify-end',
        start: 'justify-start'
    };

    const containerAlignmentClass = isFixedHeight ? 'justify-center' : 'justify-start';
    return (
        <div 
            style={{ 
                ...styles,
                backgroundColor: isEditorPreview ? 'var(--site-bg)' : 'transparent',
            }} 
            className={`
                py-10 px-5 max-w-300 mx-auto flex flex-col w-full
                ${currentHeightClass}
                ${containerAlignmentClass}
                ${isEditorPreview ? 'border border-dashed border-(--site-border-color)' : ''}
                ${uniqueClass}
            `}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${Object.entries(cssVariables).map(([k,v]) => `${k}:${v}`).join(';')} }`}</style>
            {title && (
                <h2 
                    className={`mb-8 text-(--site-text-primary) text-[2rem] leading-[1.2]`}
                    style={{ 
                        textAlign: alignment, 
                        fontFamily: fontStyles.title,
                    }}
                >
                    {title}
                </h2>
            )}

            {loading ? (
                <div className="text-center p-10 text-(--site-text-secondary)">
                    Завантаження товарів...
                </div>
            ) : products.length === 0 ? (
                <div className="text-center p-10 text-(--site-text-secondary) border border-dashed border-(--site-border-color) rounded-xl bg-(--site-card-bg) flex flex-col items-center gap-4">
                    <div className="w-15 h-15 rounded-full bg-black/5 flex items-center justify-center text-(--site-text-secondary)">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <strong>Товарів не знайдено</strong>
                        <p className="m-0 mt-1 text-sm">Перевірте налаштування категорії або додайте товари.</p>
                    </div>
                </div>
            ) : (
                <div 
                    className={`grid gap-6 w-full ${alignmentClasses[alignment] || 'justify-center'}`}
                    style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
                    }}
                >
                    <style>{`
                        @media (max-width: 1024px) {
                            .${uniqueClass} .grid {
                                grid-template-columns: repeat(${Math.min(3, columns)}, minmax(0, 1fr)) !important;
                            }
                        }
                        @media (max-width: 768px) {
                            .${uniqueClass} .grid {
                                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                            }
                        }
                        @media (max-width: 480px) {
                            .${uniqueClass} .grid {
                                grid-template-columns: minmax(0, 1fr) !important;
                            }
                        }
                    `}</style>
                    {products.map(product => (
                        <div key={product.id} className="h-full">
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
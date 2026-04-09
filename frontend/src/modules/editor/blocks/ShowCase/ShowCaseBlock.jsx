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
                const enrichedProducts = res.data.map(p => ({
                    ...p,
                    site_path: siteData?.site_path,
                    site_name: siteData?.title
                }));
                setProducts(enrichedProducts);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (siteData?.id || source_type === 'manual') fetchProducts();
    }, [blockData.selected_product_ids, blockData.category_id, source_type, siteData?.id, siteData?.site_path, siteData?.title]);

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
    if (products.length === 0 && !loading && isEditorPreview) {
        return (
            <div 
                className={`
                    flex flex-col items-center justify-center gap-3 text-center p-12 
                    bg-(--site-card-bg) w-full
                    ${currentHeightClass === 'min-h-auto' ? 'min-h-75' : currentHeightClass}
                `}
                style={styles}
            >
                <div className="text-(--site-accent) opacity-70">
                     <ShoppingBag size={48} />
                </div>
                 <h4 className="text-(--site-text-primary) m-0 font-medium text-lg">Вітрина товарів</h4>
                <p className="text-(--site-text-secondary) m-0">
                     Товарів не знайдено. Перевірте налаштування категорії або додайте товари вручну.
                </p>
            </div>
        );
    }

    return (
        <div 
            style={{ 
                ...styles,
                backgroundColor: 'var(--site-bg)',
            }} 
            className={`
                py-10 max-w-300 mx-auto flex flex-col w-full
                ${currentHeightClass}
                ${containerAlignmentClass}
                ${uniqueClass}
            `}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${Object.entries(cssVariables).map(([k,v]) => `${k}:${v}`).join(';')} }`}</style>
            <div className="px-5 w-full">
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
        </div>
    );
};

export default ShowCaseBlock;
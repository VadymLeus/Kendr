// frontend/src/modules/editor/blocks/Catalog/CatalogBlock.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../../shared/api/api';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { Input } from '../../../../shared/ui/elements/Input'; 
import ProductCard from '../../ui/components/ProductCard';
import { Search, X, ArrowUpAZ, ArrowDownAZ, ShoppingBag } from 'lucide-react';

const CatalogBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const [products, setProducts] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchQuery: "",
        selectedCategoryId: "all",
        sortBy: "name",
        sortOrder: "asc"
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const { 
        title, source_type = 'all', root_category_id, 
        show_search = true, show_category_filter = true, show_sorting = true,
        items_per_page = 12, columns = 3,
        titleFontFamily,
        height = 'auto',
        styles = {} 
    } = blockData;

    const heightMap = {
        small: '300px',
        medium: '500px',
        large: '700px',
        full: 'calc(100vh - 80px)',
        auto: 'auto'
    };
    const currentHeight = heightMap[height] || 'auto';
    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily
    }, siteData);
    const safeItemsPerPage = (parseInt(items_per_page, 10) > 0 && parseInt(items_per_page, 10) <= 100) ? parseInt(items_per_page, 10) : 12;
    const safeColumns = (parseInt(columns, 10) >= 1 && parseInt(columns, 10) <= 6) ? parseInt(columns, 10) : 3;
    useEffect(() => {
        const fetchData = async () => {
            if (!siteData?.id) return;
            setLoading(true);
            try {
                const catRes = await apiClient.get(`/categories/site/${siteData.id}`);
                setAvailableCategories(catRes.data);
                let params = { siteId: siteData.id, limit: 1000 }; 
                if (source_type === 'category' && root_category_id) {
                    params.category = root_category_id;
                }
                const prodRes = await apiClient.get('/products', { params });
                setProducts(prodRes.data);
            } catch (error) {
                console.error("Error loading catalog data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [siteData?.id, source_type, root_category_id]);

    const toggleSortOrder = () => {
        setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
        setCurrentPage(1);
    };

    const handleSortFieldChange = (val) => {
        setFilters(prev => ({ ...prev, sortBy: val, sortOrder: 'asc' }));
        setCurrentPage(1);
    };

    const handleClearAll = () => {
        setFilters({
            searchQuery: "",
            selectedCategoryId: "all",
            sortBy: "name",
            sortOrder: "asc"
        });
        setCurrentPage(1);
    };

    const processedProducts = useMemo(() => {
        let result = [...products];
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
            );
        }

        if (filters.selectedCategoryId !== 'all') {
            result = result.filter(p => String(p.category_id) === String(filters.selectedCategoryId));
        }

        result.sort((a, b) => {
            let aValue, bValue;
            if (filters.sortBy === 'name') {
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            } else if (filters.sortBy === 'price') {
                aValue = parseFloat(a.price) || 0;
                bValue = parseFloat(b.price) || 0;
            }
            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [products, filters]);

    const totalPages = Math.ceil(processedProducts.length / safeItemsPerPage);
    const paginatedProducts = processedProducts.slice((currentPage - 1) * safeItemsPerPage, currentPage * safeItemsPerPage);
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const blockEl = document.getElementById(`catalog-${blockData.block_id || 'preview'}`);
            if(blockEl && !isEditorPreview) blockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const uniqueClass = `catalog-block-${blockData.block_id || 'preview'}`;
    const showFilters = show_search || show_category_filter || show_sorting;
    const filterBtnClass = "h-9.5 min-w-9.5 px-3 bg-(--site-card-bg) border border-(--site-border-color) rounded-lg text-(--site-text-primary) cursor-pointer flex items-center justify-center gap-2 text-sm transition-all duration-200 hover:border-(--site-accent)";
    return (
        <div 
            id={`catalog-${blockData.block_id || 'preview'}`} 
            className={`
                py-15 px-5 max-w-7xl mx-auto flex flex-col justify-start
                ${isEditorPreview ? 'bg-(--site-bg) border border-dashed border-(--site-border-color)' : 'bg-transparent border-none'}
                ${uniqueClass}
            `}
            style={{
                minHeight: currentHeight,
                ...styles,
                ...style
            }}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${Object.entries(cssVariables).map(([k,v]) => `${k}:${v}`).join(';')} }`}</style>
            
            <style>{`
                .${uniqueClass} .catalog-grid {
                    display: grid;
                    grid-template-columns: repeat(${safeColumns}, minmax(0, 1fr));
                    gap: 24px;
                    margin-bottom: 3rem;
                    width: 100%;
                }
                @media (max-width: 1024px) { 
                    .${uniqueClass} .catalog-grid { grid-template-columns: repeat(${Math.min(3, safeColumns)}, minmax(0, 1fr)) !important; } 
                }
                @media (max-width: 768px) { 
                    .${uniqueClass} .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } 
                }
                @media (max-width: 480px) { 
                    .${uniqueClass} .catalog-grid { grid-template-columns: minmax(0, 1fr) !important; } 
                }
            `}</style>
            {title && (
                <h2 
                    className="text-center mb-8 text-(--site-text-primary) text-[2rem] leading-tight"
                    style={{ fontFamily: fontStyles.title }}
                >
                    {title}
                </h2>
            )}

            {showFilters && (
                <div className="z-10 mb-8 bg-(--site-card-bg) p-3 rounded-xl border border-(--site-border-color) shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        {show_search && (
                            <div className="flex-auto min-w-50">
                                <Input 
                                    placeholder="Пошук..." 
                                    value={filters.searchQuery} 
                                    onChange={(e) => {
                                        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                                        setCurrentPage(1);
                                    }}
                                    leftIcon={<Search size={18} />}
                                    wrapperStyle={{ marginBottom: 0 }}
                                    style={{ height: '38px', background: 'var(--site-bg)', border: '1px solid var(--site-border-color)' }} 
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap shrink-0 ml-auto">
                            {show_category_filter && availableCategories.length > 0 && (
                                <div className="relative w-45">
                                    <select
                                        className="appearance-none h-9.5 pl-3 pr-7.5 bg-(--site-card-bg) border border-(--site-border-color) rounded-lg text-(--site-text-primary) text-sm w-full cursor-pointer outline-none focus:border-(--site-accent)"
                                        value={filters.selectedCategoryId}
                                        onChange={(e) => {
                                            setFilters(prev => ({ ...prev, selectedCategoryId: e.target.value }));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="all">Всі категорії</option>
                                        {availableCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] text-(--site-text-secondary) pointer-events-none">▼</div>
                                </div>
                            )}

                            {show_sorting && (
                                <>
                                    <div className="relative w-37.5">
                                        <select
                                            className="appearance-none h-9.5 pl-3 pr-7.5 bg-(--site-card-bg) border border-(--site-border-color) rounded-lg text-(--site-text-primary) text-sm w-full cursor-pointer outline-none focus:border-(--site-accent)"
                                            value={filters.sortBy}
                                            onChange={(e) => handleSortFieldChange(e.target.value)}
                                        >
                                            <option value="name">За назвою</option>
                                            <option value="price">За ціною</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] text-(--site-text-secondary) pointer-events-none">▼</div>
                                    </div>

                                    <button 
                                        onClick={toggleSortOrder}
                                        className={`${filterBtnClass} p-0! w-9.5!`}
                                        title={filters.sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                                    >
                                        {filters.sortOrder === 'asc' ? <ArrowUpAZ size={18}/> : <ArrowDownAZ size={18}/>}
                                    </button>
                                </>
                            )}

                            <button 
                                onClick={handleClearAll}
                                className={`${filterBtnClass} p-0! w-9.5! border-[#e53e3e] text-[#e53e3e] hover:bg-[#e53e3e10] hover:border-[#e53e3e]`}
                                title="Очистити фільтри"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center p-15 text-(--site-text-secondary)">
                    <div className="animate-spin inline-block mb-2.5">⏳</div>
                    <div>Завантаження каталогу...</div>
                </div>
            ) : paginatedProducts.length === 0 ? (
                <div className="text-center py-20 px-5 text-(--site-text-secondary) border border-dashed border-(--site-border-color) rounded-xl bg-(--site-card-bg)">
                    <ShoppingBag size={48} className="opacity-20 mb-4 mx-auto" />
                    <p className="text-lg mb-0">Товарів не знайдено</p>
                    {(filters.searchQuery || filters.selectedCategoryId !== 'all') && (
                        <button 
                            onClick={handleClearAll}
                            className="mt-2.5 bg-transparent border-none text-(--site-accent) underline cursor-pointer text-sm"
                        >
                            Очистити пошук
                        </button>
                    )}
                </div>
            ) : (
                <div className="catalog-grid">
                    {paginatedProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            isEditorPreview={isEditorPreview}
                            siteData={siteData}
                            fontStyles={fontStyles}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`
                            ${filterBtnClass} px-4
                            ${currentPage === 1 ? 'opacity-50 cursor-not-allowed hover:border-(--site-border-color)' : ''}
                        `}
                    >
                        Назад
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        const isActive = currentPage === page;
                        const showEllipsis = totalPages > 7 && ((page > 2 && page < currentPage - 1) || (page > currentPage + 1 && page < totalPages - 1));
                        
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`
                                        ${filterBtnClass} p-0! w-9.5!
                                        ${isActive 
                                            ? 'border-(--site-accent) bg-(--site-accent) text-(--site-accent-text) hover:border-(--site-accent)' 
                                            : 'bg-(--site-card-bg) hover:border-(--site-accent)'
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            );
                        } else if (showEllipsis) {
                            if (page === currentPage - 2 || page === currentPage + 2) {
                                return <span key={page} className="p-2 text-(--site-text-secondary)">...</span>;
                            }
                        }
                        return null;
                    })}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`
                            ${filterBtnClass} px-4
                            ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed hover:border-(--site-border-color)' : ''}
                        `}
                    >
                        Далі
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatalogBlock;
// frontend/src/modules/editor/blocks/Catalog/CatalogBlock.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../../shared/api/api';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import ProductCard from '../../ui/components/ProductCard';
import { Search, X, ArrowUp, ArrowDown, ShoppingBag } from 'lucide-react';

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
    const heightClasses = {
        small: 'min-h-[300px]',
        medium: 'min-h-[400px] @3xl:min-h-[500px]',
        large: 'min-h-[500px] @3xl:min-h-[700px]',
        full: 'min-h-[calc(100vh-60px)]',
        auto: 'min-h-auto'
    };
    const currentHeightClass = heightClasses[height] || heightClasses.auto;
    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily
    }, siteData);
    const safeItemsPerPage = (parseInt(items_per_page, 10) > 0 && parseInt(items_per_page, 10) <= 100) ? parseInt(items_per_page, 10) : 12;
    const safeColumns = (parseInt(columns, 10) >= 1 && parseInt(columns, 10) <= 6) ? parseInt(columns, 10) : 3;
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 @2xl:grid-cols-2',
        3: 'grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3',
        4: 'grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4',
        5: 'grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5',
        6: 'grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-6'
    };

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
                const enrichedProducts = prodRes.data.map(p => ({
                    ...p,
                    category_ids: Array.isArray(p.categories) ? p.categories.map(c => c.id.toString()) : []
                }));
                setProducts(enrichedProducts);
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
            result = result.filter(p => p.category_ids && p.category_ids.includes(String(filters.selectedCategoryId)));
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
    const paginationBtnClass = "h-[40px] min-w-[40px] px-4 rounded-lg cursor-pointer flex items-center justify-center gap-2 text-sm transition-all duration-200 hover:opacity-80 border-none";
    const categoryOptions = useMemo(() => [
        { label: "Всі категорії", value: "all" },
        ...availableCategories.map(cat => ({ label: cat.name, value: cat.id }))
    ], [availableCategories]);
    const sortOptions = [
        { label: "За назвою", value: "name" },
        { label: "За ціною", value: "price" }
    ];
    const selectThemeOverrides = {
        '--platform-bg': 'var(--site-bg, transparent)',
        '--platform-card-bg': 'var(--site-card-bg, #ffffff)',
        '--platform-border-color': 'color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
        '--platform-text-primary': 'var(--site-text-primary)',
        '--platform-text-secondary': 'color-mix(in srgb, var(--site-text-primary) 60%, transparent)',
        '--platform-accent': 'var(--site-accent)',
        '--platform-hover-bg': 'color-mix(in srgb, var(--site-text-primary) 5%, transparent)',
    };

    const selectStyle = { 
        height: '100%', 
        margin: 0,
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        backgroundColor: 'var(--site-card-bg, var(--site-bg, transparent))',
        border: '1px solid color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
        color: 'var(--site-text-primary)',
        fontFamily: 'inherit',
        ...selectThemeOverrides
    };

    const selectDropdownStyle = {
        ...selectThemeOverrides,
        backgroundColor: 'var(--site-card-bg, var(--site-bg, #ffffff))', 
        fontFamily: 'var(--site-font-body, inherit)'
    };

    return (
        <div 
            id={`catalog-${blockData.block_id || 'preview'}`} 
            className={`
                py-8 @3xl:py-10 w-full flex flex-col justify-start
                ${currentHeightClass}
                ${uniqueClass}
            `}
            style={{
                backgroundColor: 'var(--site-bg, transparent)',
                fontFamily: 'var(--site-font-body, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)',
                color: 'var(--site-text-primary, inherit)',
                ...styles,
                ...style
            }}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${Object.entries(cssVariables).map(([k,v]) => `${k}:${v}`).join(';')} }`}</style>
            <style>{`
                .${uniqueClass} input, .${uniqueClass} select, .${uniqueClass} button {
                    font-family: inherit;
                }
                .${uniqueClass} input::placeholder {
                    color: color-mix(in srgb, var(--site-text-primary) 50%, transparent);
                }
            `}</style>
            <div className="max-w-300 mx-auto px-5 w-full flex flex-col h-full">
                {title && (
                    <h2 
                        className="text-center mb-10 text-[2rem] leading-tight"
                        style={{ fontFamily: fontStyles.title, color: 'var(--site-text-primary)' }}
                    >
                        {title}
                    </h2>
                )}
                {showFilters && (
                    <div 
                        className="z-10 mb-10 w-full flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border shrink-0"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--site-text-primary) 2%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--site-text-primary) 8%, transparent)'
                        }}
                    >
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                            {show_search && (
                                <div className="flex-1 w-full h-10 min-w-50">
                                    <div 
                                        className="w-full h-full relative flex items-center rounded-lg px-3 transition-colors border"
                                        style={{
                                            backgroundColor: 'var(--site-card-bg, var(--site-bg, transparent))',
                                            borderColor: 'color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
                                        }}
                                    >
                                        <Search size={18} style={{ color: 'color-mix(in srgb, var(--site-text-primary) 50%, transparent)' }} className="shrink-0 mr-2" />
                                        <input 
                                            type="text"
                                            placeholder="Пошук товарів..." 
                                            value={filters.searchQuery} 
                                            onChange={(e) => {
                                                setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                                                setCurrentPage(1);
                                            }}
                                            className="w-full h-full bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                                            style={{ fontFamily: 'inherit', color: 'var(--site-text-primary)' }}
                                        />
                                        {filters.searchQuery && (
                                            <X 
                                                size={16} 
                                                onClick={() => { setFilters(prev => ({ ...prev, searchQuery: '' })); setCurrentPage(1); }}
                                                className="cursor-pointer transition-colors shrink-0 ml-2 hover:opacity-70"
                                                style={{ color: 'color-mix(in srgb, var(--site-text-primary) 50%, transparent)' }} 
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {(show_category_filter || show_sorting) && (
                                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 h-10">
                                    {show_category_filter && availableCategories.length > 0 && (
                                        <div className="flex-1 sm:flex-none sm:w-48 h-full">
                                            <CustomSelect
                                                name="categoryFilter"
                                                value={filters.selectedCategoryId}
                                                options={categoryOptions}
                                                onChange={(e) => {
                                                    setFilters(prev => ({ ...prev, selectedCategoryId: e.target.value }));
                                                    setCurrentPage(1);
                                                }}
                                                style={selectStyle} 
                                                dropdownStyle={selectDropdownStyle} 
                                            />
                                        </div>
                                    )}
                                    {show_sorting && (
                                        <>
                                            <div className="flex-1 sm:flex-none sm:w-48 h-full">
                                                <CustomSelect
                                                    name="sortBy"
                                                    value={filters.sortBy}
                                                    options={sortOptions}
                                                    onChange={(e) => handleSortFieldChange(e.target.value)}
                                                    style={selectStyle}
                                                    dropdownStyle={selectDropdownStyle}
                                                />
                                            </div>
                                            <button 
                                                onClick={toggleSortOrder}
                                                className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border transition-colors shadow-sm cursor-pointer hover:opacity-80"
                                                title={filters.sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                                                style={{
                                                    backgroundColor: 'var(--site-card-bg, var(--site-bg, transparent))',
                                                    borderColor: 'color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
                                                    color: 'color-mix(in srgb, var(--site-text-primary) 70%, transparent)'
                                                }}
                                            >
                                                {filters.sortOrder === 'asc' ? <ArrowUp size={20} strokeWidth={2.5}/> : <ArrowDown size={20} strokeWidth={2.5}/>}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="text-center py-20 flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--site-text-secondary)' }}>
                        <div className="w-8 h-8 border-4 border-(--site-accent) border-t-transparent rounded-full animate-spin mb-4"></div>
                        <div style={{ fontFamily: 'inherit' }}>Завантаження каталогу...</div>
                    </div>
                ) : paginatedProducts.length === 0 ? (
                    <div 
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 @3xl:p-14 w-full mx-auto rounded-2xl border-2 border-dashed"
                        style={{ 
                            borderColor: 'color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
                            backgroundColor: 'color-mix(in srgb, var(--site-text-primary) 2%, transparent)'
                        }}
                    >
                        <div 
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--site-accent) 10%, transparent)' }}
                        >
                            <ShoppingBag size={36} style={{ color: 'var(--site-accent)' }} strokeWidth={1.5} />
                        </div>
                        <h4 className="m-0 mb-2 font-medium text-xl" style={{ fontFamily: 'inherit', color: 'var(--site-text-primary)' }}>
                            {products.length === 0 ? "Каталог товарів" : "Товарів не знайдено"}
                        </h4>
                        <p className="m-0 max-w-md text-base leading-relaxed" style={{ fontFamily: 'inherit', color: 'color-mix(in srgb, var(--site-text-primary) 60%, transparent)' }}>
                            {products.length === 0 
                                ? "Тут будуть відображатись ваші товари." 
                                : "За вибраними фільтрами немає результатів. Спробуйте змінити критерії пошуку."}
                        </p>
                        {(filters.searchQuery || filters.selectedCategoryId !== 'all') && (
                            <button 
                                onClick={handleClearAll}
                                className="mt-6 h-10 px-6 rounded-lg cursor-pointer font-medium transition-all hover:opacity-80 border-none"
                                style={{ 
                                    backgroundColor: 'var(--site-accent)', 
                                    color: 'var(--site-accent-text, #fff)',
                                    fontFamily: 'inherit' 
                                }}
                            >
                                Скинути фільтри
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={`grid gap-6 mb-12 w-full ${gridCols[safeColumns] || gridCols[3]}`}>
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
                    <div className="flex justify-center gap-2 mt-auto pt-8">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`
                                ${paginationBtnClass} px-5 font-medium
                                ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            style={{
                                backgroundColor: 'var(--site-card-bg, var(--site-bg, transparent))',
                                border: '1px solid color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
                                color: 'var(--site-text-primary)',
                            }}
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
                                            ${paginationBtnClass} p-0! w-10! font-medium
                                        `}
                                        style={
                                            isActive 
                                            ? { backgroundColor: 'var(--site-accent)', color: 'var(--site-accent-text, #fff)', border: 'none' }
                                            : {
                                                backgroundColor: 'var(--site-card-bg, var(--site-bg, transparent))',
                                                border: '1px solid color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
                                                color: 'var(--site-text-primary)',
                                            }
                                        }
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (showEllipsis) {
                                if (page === currentPage - 2 || page === currentPage + 2) {
                                    return <span key={page} className="px-2 py-2 font-medium" style={{ fontFamily: 'inherit', color: 'color-mix(in srgb, var(--site-text-primary) 60%, transparent)' }}>...</span>;
                                }
                            }
                            return null;
                        })}
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`
                                ${paginationBtnClass} px-5 font-medium
                                ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            style={{
                                backgroundColor: 'var(--site-card-bg, var(--site-bg, transparent))',
                                border: '1px solid color-mix(in srgb, var(--site-text-primary) 15%, transparent)',
                                color: 'var(--site-text-primary)',
                            }}
                        >
                            Далі
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default React.memo(CatalogBlock);
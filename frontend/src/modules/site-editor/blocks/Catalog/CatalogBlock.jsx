// frontend/src/modules/site-editor/blocks/Catalog/CatalogBlock.jsx
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../../common/services/api';
import { CartContext } from '../../../../app/providers/CartContext';
import { AuthContext } from '../../../../app/providers/AuthContext';

const API_URL = 'http://localhost:5000';

const ProductCard = ({ product, isEditorPreview, siteData }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const intervalRef = useRef(null);

    const images = useMemo(() => {
        if (product.image_gallery && product.image_gallery.length > 0) {
            return product.image_gallery.map(img => 
                img.startsWith('http') ? img : `${API_URL}${img}`
            );
        }
        return ['https://placehold.co/300'];
    }, [product.image_gallery]);

    const isOwner = user && siteData && user.id === siteData.user_id;

    const hasDiscount = product.sale_percentage > 0;
    const finalPrice = product.price ? (hasDiscount 
        ? Math.round(product.price * (1 - product.sale_percentage / 100)) 
        : product.price) : 0;

    const isSoldOut = product.stock_quantity === 0;
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;

    const handleMouseEnter = () => {
        if (isEditorPreview || images.length <= 1) return;
        
        intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveImgIndex(prev => (prev + 1) % images.length);
                setIsTransitioning(false);
            }, 300);
        }, 2000);
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

    const handleAction = (e) => {
        e.preventDefault();
        if (isEditorPreview) return;
        
        if (hasVariants) {
            navigate(`/product/${product.id}`);
            return;
        }

        if (!user) {
            if (confirm("Щоб купити, потрібно увійти. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        
        addToCart(product, {}, { finalPrice, originalPrice: product.price, discount: product.sale_percentage });
    };

    return (
        <Link 
            to={`/product/${product.id}`} 
            style={{textDecoration: 'none', pointerEvents: isEditorPreview ? 'none' : 'auto', color: 'inherit'}}
        >
            <div style={{
                border: '1px solid var(--site-border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--site-card-bg)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                position: 'relative'
            }}
            onMouseEnter={(e) => {
                if(!isEditorPreview) e.currentTarget.style.transform = 'translateY(-4px)';
                handleMouseEnter();
            }}
            onMouseLeave={(e) => {
                if(!isEditorPreview) e.currentTarget.style.transform = 'translateY(0)';
                handleMouseLeave();
            }}
            >
                <div style={{
                    position: 'relative', 
                    paddingTop: '100%', 
                    overflow: 'hidden',
                    backgroundColor: 'var(--site-card-bg)'
                }}>
                    
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}>
                        {images.map((imgSrc, idx) => (
                            <img 
                                key={idx}
                                src={imgSrc} 
                                alt={product.name}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: idx === activeImgIndex ? 1 : 0,
                                    transform: `scale(${idx === activeImgIndex ? 1 : 1.02})`,
                                    transition: 'all 0.5s ease-in-out',
                                    transitionProperty: 'opacity, transform',
                                    willChange: 'opacity, transform',
                                    filter: isSoldOut ? 'grayscale(100%)' : 'none'
                                }}
                            />
                        ))}
                    </div>

                    {images.length > 1 && !isSoldOut && (
                        <div style={{
                            position: 'absolute', 
                            bottom: '10px', 
                            left: 0, 
                            right: 0,
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '4px', 
                            zIndex: 2
                        }}>
                            {images.map((_, idx) => (
                                <div key={idx} style={{
                                    width: '6px', 
                                    height: '6px', 
                                    borderRadius: '50%',
                                    background: idx === activeImgIndex ? 'var(--site-accent)' : 'rgba(255,255,255,0.6)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    transition: 'all 0.3s ease',
                                    transform: idx === activeImgIndex ? 'scale(1.2)' : 'scale(1)'
                                }} />
                            ))}
                        </div>
                    )}

                    {hasDiscount && !isSoldOut && (
                        <div style={{
                            position: 'absolute', 
                            top: '8px', 
                            right: '8px',
                            background: '#e53e3e', 
                            color: 'white',
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.8rem', 
                            fontWeight: 'bold', 
                            zIndex: 3,
                            transition: 'transform 0.2s ease'
                        }}>
                            -{product.sale_percentage}%
                        </div>
                    )}

                    {isSoldOut && (
                        <div style={{
                            position: 'absolute', 
                            inset: 0,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.6)',
                            color: '#555', 
                            fontWeight: 'bold', 
                            zIndex: 3
                        }}>
                            Закінчився
                        </div>
                    )}
                </div>
                
                <div style={{
                    padding: '1rem', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column'
                }}>
                    <h4 style={{
                        margin: '0 0 8px 0', 
                        fontSize: '1rem', 
                        color: 'var(--site-text-primary)',
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap'
                    }}>
                        {product.name}
                    </h4>
                    
                    <div style={{
                        marginTop: 'auto', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                    }}>
                        <div>
                            {hasDiscount ? (
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <span style={{
                                        color: '#e53e3e', 
                                        fontWeight: 'bold'
                                    }}>
                                        {finalPrice} ₴
                                    </span>
                                    <span style={{
                                        textDecoration: 'line-through', 
                                        fontSize: '0.8rem', 
                                        color: 'var(--site-text-secondary)'
                                    }}>
                                        {product.price} ₴
                                    </span>
                                </div>
                            ) : (
                                <span style={{
                                    color: 'var(--site-text-primary)', 
                                    fontWeight: 'bold'
                                }}>
                                    {product.price} ₴
                                </span>
                            )}
                        </div>
                        
                        <button
                            onClick={handleAction}
                            disabled={isSoldOut || (isOwner && !hasVariants)}
                            title={isOwner ? "Ви власник цього товару" : ""}
                            style={{
                                background: isOwner ? 'var(--site-text-secondary)' : 'var(--site-accent)',
                                color: 'var(--site-accent-text)',
                                border: 'none',
                                borderRadius: '4px',
                                width: '32px',
                                height: '32px',
                                cursor: (isSoldOut || isOwner) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                opacity: (isSoldOut || isOwner) ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isOwner ? '👤' : (hasVariants ? '⚙️' : '+')}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

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
        title, 
        source_type = 'all', 
        root_category_id, 
        show_search = true, 
        show_category_filter = true, 
        show_sorting = true,
        items_per_page, 
        columns
    } = blockData;

    const safeItemsPerPage = (parseInt(items_per_page, 10) > 0 && parseInt(items_per_page, 10) <= 100) 
        ? parseInt(items_per_page, 10) 
        : 12;

    const safeColumns = (parseInt(columns, 10) >= 1 && parseInt(columns, 10) <= 6) 
        ? parseInt(columns, 10) 
        : 3;

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

    const getSortIcon = (field) => {
        if (filters.sortBy !== field) return '⇵';
        return filters.sortOrder === 'asc' ? '↑' : '↓';
    };

    const toggleSort = (field) => {
        if (filters.sortBy === field) {
            setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
        } else {
            setFilters(prev => ({ ...prev, sortBy: field, sortOrder: 'asc' }));
        }
        setCurrentPage(1);
    };

    const processedProducts = useMemo(() => {
        let result = [...products];

        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(q) || 
                (p.description && p.description.toLowerCase().includes(q))
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
                const aIsCyrillic = /[а-яіїєґ]/.test(aValue);
                const bIsCyrillic = /[а-яіїєґ]/.test(bValue);
                
                if (aIsCyrillic && !bIsCyrillic) return 1;
                if (!aIsCyrillic && bIsCyrillic) return -1;
            } else if (filters.sortBy === 'price') {
                aValue = a.price || 0;
                bValue = b.price || 0;
            }
            
            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [products, filters]);

    const totalPages = Math.ceil(processedProducts.length / safeItemsPerPage);
    const paginatedProducts = processedProducts.slice(
        (currentPage - 1) * safeItemsPerPage,
        currentPage * safeItemsPerPage
    );

    const handleSearch = (val) => {
        setFilters(prev => ({ ...prev, searchQuery: val }));
        setCurrentPage(1);
    };

    const handleCategoryChange = (val) => {
        setFilters(prev => ({ ...prev, selectedCategoryId: val }));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const blockEl = document.getElementById(`catalog-${blockData.block_id || 'preview'}`);
            if(blockEl && !isEditorPreview) blockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const containerStyle = {
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: isEditorPreview ? 'var(--site-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        ...style
    };

    const filtersRowStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '2rem'
    };

    const searchContainerStyle = {
        position: 'relative',
        flex: '2 1 200px',
        minWidth: '200px'
    };

    const selectWrapperStyle = {
        flex: '1 1 150px',
        minWidth: '150px'
    };

    const inputStyle = {
        padding: '10px 40px 10px 12px', 
        borderRadius: '8px', 
        border: '1px solid var(--site-border-color)',
        background: 'var(--site-card-bg)', 
        color: 'var(--site-text-primary)', 
        fontSize: '0.9rem', 
        width: '100%',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    };

    const clearButtonStyle = {
        position: 'absolute', 
        right: '8px', 
        top: '50%', 
        transform: 'translateY(-50%)',
        background: 'none', 
        border: 'none', 
        color: 'var(--site-text-secondary)',
        cursor: 'pointer', 
        fontSize: '1.2rem', 
        padding: '4px',
        borderRadius: '4px', 
        transition: 'color 0.2s'
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'menulist',
        paddingRight: '12px'
    };

    const sortButtonsContainerStyle = {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        flex: '0 0 auto',
        marginLeft: 'auto'
    };

    const sortButtonStyle = (isActive) => ({
        padding: '8px 12px', 
        borderRadius: '6px', 
        border: `1px solid ${isActive ? 'var(--site-accent)' : 'var(--site-border-color)'}`,
        background: isActive ? 'rgba(var(--site-accent-rgb), 0.1)' : 'var(--site-card-bg)',
        color: isActive ? 'var(--site-accent)' : 'var(--site-text-primary)',
        cursor: 'pointer', 
        fontSize: '0.85rem',
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
    });

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${safeColumns}, 1fr)`,
        gap: '20px',
        marginBottom: '2rem',
    };

    const uniqueClass = `catalog-block-${blockData.block_id || 'preview'}`;

    const paginationStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '2rem'
    };

    const pageBtnStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        border: isActive ? 'none' : '1px solid var(--site-border-color)',
        background: isActive ? 'var(--site-accent)' : 'var(--site-card-bg)',
        color: isActive ? 'var(--site-accent-text)' : 'var(--site-text-primary)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: isActive ? 'bold' : 'normal'
    });

    return (
        <div style={containerStyle} id={`catalog-${blockData.block_id || 'preview'}`}>
            <style>{`
                @media (max-width: 768px) {
                    .${uniqueClass} {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 480px) {
                    .${uniqueClass} {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {title && (
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--site-text-primary)' }}>
                    {title}
                </h2>
            )}

            {(show_search || show_category_filter || show_sorting) && (
                <div style={filtersRowStyle}>
                    {show_search && (
                        <div style={searchContainerStyle}>
                            <input 
                                type="text" 
                                placeholder="🔍 Пошук товарів..." 
                                value={filters.searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                style={inputStyle}
                            />
                            {filters.searchQuery && (
                                <button 
                                    onClick={() => handleSearch('')}
                                    style={clearButtonStyle}
                                    title="Очистити пошук"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )}
                    
                    {show_category_filter && (
                        <div style={selectWrapperStyle}>
                            <select 
                                value={filters.selectedCategoryId}
                                onChange={e => handleCategoryChange(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="all">Всі категорії</option>
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {show_sorting && (
                        <div style={sortButtonsContainerStyle}>
                            <button 
                                onClick={() => toggleSort('name')}
                                style={sortButtonStyle(filters.sortBy === 'name')}
                            >
                                A-Z {getSortIcon('name')}
                            </button>
                            <button 
                                onClick={() => toggleSort('price')}
                                style={sortButtonStyle(filters.sortBy === 'price')}
                            >
                                Ціна {getSortIcon('price')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div style={{textAlign: 'center', padding: '40px', color: 'var(--site-text-secondary)'}}>
                    Завантаження каталогу...
                </div>
            ) : paginatedProducts.length === 0 ? (
                <div style={{
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    color: 'var(--site-text-secondary)',
                    border: '1px dashed var(--site-border-color)',
                    borderRadius: '8px'
                }}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>😔</div>
                    <p>Товарів не знайдено</p>
                    {filters.searchQuery && (
                        <button 
                            onClick={() => handleSearch('')}
                            style={{
                                marginTop: '10px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--site-accent)',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                        >
                            Очистити пошук
                        </button>
                    )}
                </div>
            ) : (
                <div className={uniqueClass} style={gridStyle}>
                    {paginatedProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            isEditorPreview={isEditorPreview}
                            siteData={siteData}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div style={paginationStyle}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{...pageBtnStyle(false), opacity: currentPage === 1 ? 0.5 : 1}}
                    >
                        &lt;
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        const showEllipsis = totalPages > 7 && 
                            ((page > 2 && page < currentPage - 1) || (page > currentPage + 1 && page < totalPages - 1));
                        
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={pageBtnStyle(currentPage === page)}
                                >
                                    {page}
                                </button>
                            );
                        } else if (showEllipsis) {
                            if (page === currentPage - 2 || page === currentPage + 2) {
                                return <span key={page} style={{padding: '0.5rem', color: 'var(--site-text-secondary)'}}>...</span>;
                            }
                        }
                        return null;
                    })}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{...pageBtnStyle(false), opacity: currentPage === totalPages ? 0.5 : 1}}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatalogBlock;
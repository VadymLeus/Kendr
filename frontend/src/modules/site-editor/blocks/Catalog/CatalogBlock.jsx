// frontend/src/modules/site-editor/blocks/Catalog/CatalogBlock.jsx
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../../common/services/api';
import { CartContext } from '../../../../app/providers/CartContext';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { Input } from '../../../../common/components/ui/Input'; 
import { 
    IconSearch, IconClear, IconSortAsc, IconSortDesc, 
    IconShoppingBag, IconUser, IconSettings
} from '../../../../common/components/ui/Icons';

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
            let gallery = typeof product.image_gallery === 'string' 
                ? JSON.parse(product.image_gallery) 
                : product.image_gallery;

            return gallery.map(img => 
                img.startsWith('http') ? img : `${API_URL}${img}`
            );
        }
        return ['https://placehold.co/300?text=No+Image'];
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

    const handleAction = (e) => {
        e.preventDefault();
        if (isEditorPreview) return;
        
        if (hasVariants) {
            navigate(`/product/${product.id}`);
            return;
        }

        if (!user) {
            if (window.confirm("Щоб купити, потрібно увійти. Перейти на сторінку входу?")) {
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
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--site-card-bg)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
            }}
            onMouseEnter={(e) => {
                if(!isEditorPreview) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }
                handleMouseEnter();
            }}
            onMouseLeave={(e) => {
                if(!isEditorPreview) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }
                handleMouseLeave();
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
                                objectFit: 'contain', 
                                opacity: idx === activeImgIndex ? 1 : 0,
                                transform: `scale(${idx === activeImgIndex ? 1 : 1.05})`,
                                transition: 'all 0.5s ease-in-out',
                                filter: isSoldOut ? 'grayscale(100%)' : 'none',
                                padding: '12px', boxSizing: 'border-box'
                            }}
                        />
                    ))}

                    {images.length > 1 && !isSoldOut && (
                        <div style={{
                            position: 'absolute', bottom: '10px', left: 0, right: 0,
                            display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 2
                        }}>
                            {images.map((_, idx) => (
                                <div key={idx} style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: idx === activeImgIndex ? 'var(--site-accent)' : 'rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    transform: idx === activeImgIndex ? 'scale(1.2)' : 'scale(1)'
                                }} />
                            ))}
                        </div>
                    )}

                    {hasDiscount && !isSoldOut && (
                        <div style={{
                            position: 'absolute', top: '10px', right: '10px',
                            background: '#e53e3e', color: 'white',
                            padding: '4px 8px', borderRadius: '6px',
                            fontSize: '0.75rem', fontWeight: 'bold', zIndex: 3,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            -{product.sale_percentage}%
                        </div>
                    )}

                    {isSoldOut && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.8)',
                            color: '#555', fontWeight: 'bold', zIndex: 3,
                            backdropFilter: 'blur(2px)'
                        }}>
                            Закінчився
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{
                        margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--site-text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600'
                    }}>
                        {product.name}
                    </h4>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            {hasDiscount ? (
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '1.1rem' }}>{finalPrice} ₴</span>
                                    <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--site-text-secondary)' }}>
                                        {product.price} ₴
                                    </span>
                                </div>
                            ) : (
                                <span style={{ color: 'var(--site-text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{product.price} ₴</span>
                            )}
                        </div>
                        
                        <button
                            onClick={handleAction}
                            disabled={isSoldOut || (isOwner && !hasVariants)}
                            style={{
                                background: isOwner ? 'var(--site-text-secondary)' : 'var(--site-accent)',
                                color: 'var(--site-accent-text)',
                                border: 'none', borderRadius: '8px',
                                width: '36px', height: '36px',
                                cursor: (isSoldOut || isOwner) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', opacity: (isSoldOut || isOwner) ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                                boxShadow: isOwner ? 'none' : '0 4px 10px rgba(var(--site-accent-rgb), 0.3)'
                            }}
                        >
                            {isOwner ? (
                                <IconUser size={20} />
                            ) : hasVariants ? (
                                <IconSettings size={20} />
                            ) : (
                                '+'
                            )}
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
        title, source_type = 'all', root_category_id, 
        show_search = true, show_category_filter = true, show_sorting = true,
        items_per_page, columns
    } = blockData;

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

    const containerStyle = {
        padding: '60px 20px',
        maxWidth: '1280px',
        margin: '0 auto',
        backgroundColor: isEditorPreview ? 'var(--site-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        ...style
    };

    const uniqueClass = `catalog-block-${blockData.block_id || 'preview'}`;
    const showFilters = show_search || show_category_filter || show_sorting;

    const filterBtnStyle = {
        height: '38px', minWidth: '38px', padding: '0 12px',
        background: 'var(--site-card-bg)', border: '1px solid var(--site-border-color)',
        borderRadius: '8px', color: 'var(--site-text-primary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        fontSize: '0.9rem', transition: 'all 0.2s'
    };
    
    const iconBtnStyle = { ...filterBtnStyle, padding: 0, width: '38px' };

    return (
        <div style={containerStyle} id={`catalog-${blockData.block_id || 'preview'}`}>
            <style>{`
                @media (max-width: 1024px) { .${uniqueClass} { grid-template-columns: repeat(${Math.min(3, safeColumns)}, 1fr) !important; } }
                @media (max-width: 768px) { .${uniqueClass} { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 480px) { .${uniqueClass} { grid-template-columns: 1fr !important; } }
                
                .catalog-select-wrapper { position: relative; }
                .catalog-select-wrapper::after {
                    content: '▼'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                    font-size: 0.6rem; color: var(--site-text-secondary); pointer-events: none;
                }
                .catalog-select {
                    appearance: none; -webkit-appearance: none;
                    height: 38px; padding: 0 30px 0 12px;
                    background: var(--site-card-bg); border: 1px solid var(--site-border-color);
                    border-radius: 8px; color: var(--site-text-primary);
                    font-size: 0.9rem; width: 100%; cursor: pointer; outline: none;
                }
                .catalog-select:focus { border-color: var(--site-accent); }
            `}</style>

            {title && (
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--site-text-primary)', fontSize: '2rem' }}>
                    {title}
                </h2>
            )}

            {showFilters && (
                <div style={{
                    zIndex: 10, marginBottom: '2rem',
                    background: 'var(--site-card-bg)',
                    padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--site-border-color)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        
                        {show_search && (
                            <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                                <Input 
                                    placeholder="Пошук..." 
                                    value={filters.searchQuery} 
                                    onChange={(e) => {
                                        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                                        setCurrentPage(1);
                                    }}
                                    leftIcon={<IconSearch size={18} />}
                                    wrapperStyle={{ marginBottom: 0 }}
                                    style={{ height: '38px', background: 'var(--site-bg)', border: '1px solid var(--site-border-color)' }} 
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0, marginLeft: 'auto' }}>
                            
                            {show_category_filter && availableCategories.length > 0 && (
                                <div className="catalog-select-wrapper" style={{ width: '180px' }}>
                                    <select 
                                        className="catalog-select"
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
                                </div>
                            )}

                            {show_sorting && (
                                <>
                                    <div className="catalog-select-wrapper" style={{ width: '150px' }}>
                                        <select 
                                            className="catalog-select"
                                            value={filters.sortBy}
                                            onChange={(e) => handleSortFieldChange(e.target.value)}
                                        >
                                            <option value="name">За назвою</option>
                                            <option value="price">За ціною</option>
                                        </select>
                                    </div>

                                    <button 
                                        onClick={toggleSortOrder} 
                                        style={iconBtnStyle}
                                        title={filters.sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--site-accent)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--site-border-color)'}
                                    >
                                        {filters.sortOrder === 'asc' ? <IconSortAsc size={18}/> : <IconSortDesc size={18}/>}
                                    </button>
                                </>
                            )}

                            <button 
                                onClick={handleClearAll} 
                                style={{ ...iconBtnStyle, borderColor: '#e53e3e', color: '#e53e3e' }}
                                title="Очистити фільтри"
                                onMouseEnter={e => e.currentTarget.style.background = '#e53e3e10'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <IconClear size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{textAlign: 'center', padding: '60px', color: 'var(--site-text-secondary)'}}>
                    <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>⏳</div>
                    <div>Завантаження каталогу...</div>
                </div>
            ) : paginatedProducts.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px 20px', color: 'var(--site-text-secondary)',
                    border: '1px dashed var(--site-border-color)', borderRadius: '12px',
                    backgroundColor: 'var(--site-card-bg)'
                }}>
                    <IconShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem' }}>Товарів не знайдено</p>
                    {(filters.searchQuery || filters.selectedCategoryId !== 'all') && (
                        <button 
                            onClick={handleClearAll}
                            style={{
                                marginTop: '10px', background: 'transparent', border: 'none',
                                color: 'var(--site-accent)', textDecoration: 'underline', cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Очистити пошук
                        </button>
                    )}
                </div>
            ) : (
                <div className={uniqueClass} style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${safeColumns}, 1fr)`,
                    gap: '24px',
                    marginBottom: '3rem',
                }}>
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            ...filterBtnStyle, padding: '0 16px',
                            opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
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
                                    style={{
                                        ...iconBtnStyle,
                                        borderColor: isActive ? 'var(--site-accent)' : 'var(--site-border-color)',
                                        background: isActive ? 'var(--site-accent)' : 'var(--site-card-bg)',
                                        color: isActive ? 'var(--site-accent-text)' : 'var(--site-text-primary)',
                                    }}
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
                        style={{
                            ...filterBtnStyle, padding: '0 16px',
                            opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Далі
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatalogBlock;
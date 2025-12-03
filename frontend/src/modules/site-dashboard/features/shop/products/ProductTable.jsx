// frontend/src/modules/site-dashboard/features/shop/products/ProductTable.jsx
import React, { memo, useCallback } from 'react';
import { useConfirm } from '../../../../../common/hooks/useConfirm';

const STATIC_STYLES = {
    input: {
        width: '100%', 
        padding: '10px 12px', 
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)', 
        color: 'var(--platform-text-primary)',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
    },
    dangerButton: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid var(--platform-border-color)',
        color: '#e53e3e',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 2
    },
    tile: (isActive) => ({
        background: 'var(--platform-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        minHeight: '280px',
        border: isActive ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        boxShadow: isActive ? '0 4px 12px rgba(var(--platform-accent-rgb), 0.2)' : '0 2px 5px rgba(0,0,0,0.05)'
    }),
    badge: (isStock) => ({
        position: 'absolute',
        top: '8px',
        left: '8px',
        background: isStock ? 'rgba(255, 255, 255, 0.95)' : '#fff5f5',
        color: isStock ? '#2f855a' : '#c53030',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
    }),
    saleBadge: {
        position: 'absolute',
        top: '8px',
        right: '45px',
        background: '#fff5f5',
        color: '#e53e3e',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
    }
};

const ProductTable = memo(({ 
    products, 
    categories, 
    filteredProducts, 
    loading, 
    filters, 
    setFilters, 
    onEdit, 
    onDelete,
    API_URL
}) => {
    const { confirm } = useConfirm();

    const handleDelete = useCallback(async (e, id) => {
        e.stopPropagation();
        if (await confirm({ 
            title: "Видалити товар?", 
            message: "Цю дію неможливо скасувати.", 
            type: 'danger',
            confirmLabel: "Видалити"
        })) {
            onDelete(id);
        }
    }, [confirm, onDelete]);

    const handleMouseOver = useCallback((element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    }, []);

    const handleMouseOut = useCallback((element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    }, []);

    const handleSearchChange = useCallback((e) => {
        setFilters(prev => ({...prev, search: e.target.value}));
    }, [setFilters]);

    const handleCategoryChange = useCallback((e) => {
        setFilters(prev => ({...prev, category: e.target.value}));
    }, [setFilters]);

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Завантаження...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px', 
                flexWrap: 'wrap', 
                gap: '10px'
            }}>
                <div style={{display: 'flex', gap: '10px', flex: 1, minWidth: '200px'}}>
                    <input 
                        placeholder="🔍 Пошук товару..." 
                        style={{...STATIC_STYLES.input, marginBottom: 0, width: '100%'}}
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                    <select 
                        style={{...STATIC_STYLES.input, marginBottom: 0, maxWidth: '180px'}}
                        value={filters.category}
                        onChange={handleCategoryChange}
                    >
                        <option value="all">Всі категорії</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                
                <div style={{
                    fontWeight: 'bold', 
                    color: 'var(--platform-text-primary)', 
                    whiteSpace: 'nowrap', 
                    marginLeft: '10px'
                }}>
                    Всього товарів: <span style={{color: 'var(--platform-accent)', fontSize: '1.1rem'}}>{products.length}</span>
                </div>
            </div>

            <div className="custom-scrollbar" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: '16px',
                overflowY: 'auto', 
                padding: '4px',
                alignContent: 'start',
                height: '100%'
            }}>
                {filteredProducts.map(product => (
                    <div 
                        key={product.id}
                        style={STATIC_STYLES.tile(false)}
                        onClick={() => onEdit(product)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                            e.currentTarget.style.borderColor = 'var(--platform-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                            e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                        }}
                    >
                        <div style={STATIC_STYLES.badge(product.stock_quantity > 0)}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} шт.` : 'Немає'}
                        </div>

                        {product.sale_percentage > 0 && (
                            <div style={STATIC_STYLES.saleBadge}>
                                -{product.sale_percentage}%
                            </div>
                        )}

                        <button 
                            onClick={(e) => handleDelete(e, product.id)}
                            style={STATIC_STYLES.dangerButton}
                            title="Видалити"
                            onMouseOver={(e) => handleMouseOver(e.currentTarget, {
                                background: '#fff5f5',
                                borderColor: '#fc8181',
                                color: '#c53030',
                                transform: 'scale(1.1)',
                                boxShadow: '0 2px 5px rgba(229, 62, 62, 0.2)'
                            })}
                            onMouseLeave={(e) => handleMouseOut(e.currentTarget, STATIC_STYLES.dangerButton)}
                        >
                            ×
                        </button>

                        <img 
                            src={product.image_gallery?.[0] ? `${API_URL}${product.image_gallery[0]}` : 'https://placehold.co/300x200?text=No+Image'} 
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '160px',
                                minHeight: '160px',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                backgroundColor: '#f0f2f5',
                                borderBottom: '1px solid var(--platform-border-color)',
                                display: 'block'
                            }}
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/300x200?text=No+Image" 
                            }}
                        />

                        <div style={{
                            padding: '14px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '10px'
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '600', 
                                    marginBottom: '6px', 
                                    lineHeight: '1.3', 
                                    fontSize: '0.95rem', 
                                    color: 'var(--platform-text-primary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {product.name}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem', 
                                    color: 'var(--platform-text-secondary)', 
                                    marginBottom: '8px'
                                }}>
                                    {categories.find(c => c.id === product.category_id)?.name || 'Без категорії'}
                                </div>
                                
                                {product.variants && product.variants.length > 0 && (
                                    <div style={{
                                        fontSize: '0.7rem', 
                                        background: 'var(--platform-card-bg)', 
                                        border: '1px solid var(--platform-border-color)', 
                                        display: 'inline-block', 
                                        padding: '2px 8px', 
                                        borderRadius: '6px', 
                                        color: 'var(--platform-text-primary)'
                                    }}>
                                        🎨 {product.variants.length} опцій
                                    </div>
                                )}
                            </div>
                            <div style={{
                                marginTop: 'auto', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center'
                            }}>
                                {product.sale_percentage > 0 ? (
                                    <>
                                        <span style={{textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--platform-text-secondary)', marginRight: '6px'}}>
                                            {product.price} ₴
                                        </span>
                                        <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#e53e3e'}}>
                                            {Math.round(product.price * (1 - product.sale_percentage / 100))} ₴
                                        </span>
                                    </>
                                ) : (
                                    <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--platform-accent)'}}>
                                        {product.price} ₴
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredProducts.length === 0 && (
                    <div style={{
                        gridColumn: '1/-1', 
                        textAlign: 'center', 
                        color: 'var(--platform-text-secondary)', 
                        marginTop: '40px',
                        padding: '40px'
                    }}>
                        <div style={{fontSize: '3rem', marginBottom: '10px', opacity: 0.5}}>📦</div>
                        {products.length === 0 ? 'Список порожній' : 'Товарів не знайдено'}
                    </div>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.filteredProducts === nextProps.filteredProducts &&
           prevProps.loading === nextProps.loading &&
           prevProps.filters === nextProps.filters &&
           prevProps.categories === nextProps.categories &&
           prevProps.products === nextProps.products;
});

export { ProductTable };
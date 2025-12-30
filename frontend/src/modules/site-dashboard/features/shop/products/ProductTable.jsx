// frontend/src/modules/site-dashboard/features/shop/products/ProductTable.jsx
import React, { memo, useCallback } from 'react';
import { useConfirm } from '../../../../../common/hooks/useConfirm';
import { Input } from '../../../../../common/components/ui/Input';
import { Button } from '../../../../../common/components/ui/Button';
import CustomSelect from '../../../../../common/components/ui/CustomSelect';
import { IconSearch, IconPlus, IconTrash, IconShop, IconCheckCircle, IconImage } from '../../../../../common/components/ui/Icons';

const ProductTable = memo(({ 
    filteredProducts, 
    products, 
    categories, 
    loading, 
    filters, 
    setFilters, 
    onSelect, 
    onCreate,
    onDelete,
    API_URL,
    selectedId,
    style
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

    const categoryOptions = [
        { value: 'all', label: 'Всі категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

    if (loading) return <div style={{padding: 40, textAlign: 'center', color: 'var(--platform-text-secondary)'}}>Завантаження...</div>;

    const styles = {
        container: {
            background: 'var(--platform-card-bg)',
            borderRadius: '16px', 
            border: '1px solid var(--platform-border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            ...style
        },
        toolbar: {
            padding: '16px 20px',
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            background: 'var(--platform-bg)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            padding: '20px',
            overflowY: 'auto',
            alignContent: 'start'
        },
        card: (isSelected) => ({
            background: isSelected ? 'var(--platform-card-bg)' : 'var(--platform-bg)',
            borderRadius: '12px',
            border: isSelected ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isSelected ? '0 4px 12px rgba(var(--platform-accent-rgb), 0.15)' : 'none',
            transform: isSelected ? 'translateY(-2px)' : 'none'
        }),
        imageWrapper: {
            height: '140px',
            background: '#f1f5f9',
            position: 'relative',
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--platform-text-secondary)'
        },
        image: { width: '100%', height: '100%', objectFit: 'cover' },
        cardContent: { padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
        priceTag: { fontWeight: '700', fontSize: '1rem', color: 'var(--platform-text-primary)' },
        salePrice: { color: '#ef4444', marginRight: '8px' },
        oldPrice: { textDecoration: 'line-through', color: 'var(--platform-text-secondary)', fontSize: '0.85rem', fontWeight: 'normal' },
        badge: {
            position: 'absolute', top: '8px', left: '8px', padding: '4px 8px', borderRadius: '6px',
            fontSize: '0.7rem', fontWeight: '600', background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 2
        },
        selectedOverlay: {
            position: 'absolute', top: '8px', right: '8px', color: 'var(--platform-accent)',
            background: 'white', borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 5
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.toolbar}>
                <div style={{display: 'flex', gap: '12px', flex: 1, alignItems: 'center'}}>
                    <Input 
                        leftIcon={<IconSearch size={16}/>}
                        placeholder="Пошук товару..." 
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        style={{margin: 0, width: '100%', maxWidth: '300px'}}
                        wrapperStyle={{margin: 0, width: '100%', maxWidth: '300px'}}
                    />
                    <div style={{width: '200px'}}>
                        <CustomSelect 
                            value={filters.category.toString()}
                            onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                            options={categoryOptions}
                            placeholder="Категорія"
                        />
                    </div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <span style={{fontSize: '0.9rem', color: 'var(--platform-text-secondary)', fontWeight: '500'}}>
                        Всього: <b style={{color: 'var(--platform-text-primary)'}}>{filteredProducts.length}</b>
                    </span>
                    <Button onClick={onCreate} icon={<IconPlus size={18}/>}>
                        Додати
                    </Button>
                </div>
            </div>

            <div className="custom-scrollbar" style={styles.grid}>
                {filteredProducts.map(product => {
                    const hasSale = product.sale_percentage > 0;
                    const finalPrice = hasSale ? Math.round(product.price * (1 - product.sale_percentage / 100)) : product.price;
                    const isSelected = selectedId === product.id;

                    return (
                        <div 
                            key={product.id}
                            style={styles.card(isSelected)}
                            onClick={() => onSelect(product)}
                            className="product-card"
                        >
                            <div style={styles.imageWrapper}>
                                {product.image_gallery?.[0] ? (
                                    <img 
                                        src={`${API_URL}${product.image_gallery[0]}`} 
                                        alt={product.name} 
                                        style={styles.image}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.style.display = 'none'; 
                                            e.target.parentElement.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                        }}
                                    />
                                ) : (
                                    <IconImage size={32} style={{opacity: 0.3}} />
                                )}
                                
                                {hasSale && (
                                    <div style={{...styles.badge, right: '8px', left: 'auto', color: '#ef4444'}}>
                                        -{product.sale_percentage}%
                                    </div>
                                )}
                                <div style={{...styles.badge, color: product.stock_quantity > 0 ? '#10b981' : '#ef4444'}}>
                                    {product.stock_quantity > 0 ? `${product.stock_quantity} шт.` : 'Немає'}
                                </div>

                                {isSelected && (
                                    <div style={styles.selectedOverlay}>
                                        <IconCheckCircle size={18} />
                                    </div>
                                )}
                            </div>

                            <div style={styles.cardContent}>
                                <div style={{fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.3', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                    {product.name}
                                </div>
                                
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}>
                                    <div style={styles.priceTag}>
                                        {hasSale ? (
                                            <>
                                                <span style={styles.salePrice}>{finalPrice} ₴</span>
                                                <span style={styles.oldPrice}>{product.price} ₴</span>
                                            </>
                                        ) : (
                                            <span>{product.price} ₴</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(e, product.id)}
                                        className="delete-btn"
                                        title="Видалити"
                                    >
                                        <IconTrash size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredProducts.length === 0 && (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--platform-text-secondary)'}}>
                        <div style={{marginBottom: '16px', opacity: 0.5, display: 'flex', justifyContent: 'center'}}>
                            <IconShop size={48}/>
                        </div>
                        {products.length === 0 ? 'Список товарів порожній. Створіть перший!' : 'Нічого не знайдено за фільтрами.'}
                    </div>
                )}
            </div>
            
            <style>{`
                .product-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                    border-color: var(--platform-accent) !important;
                }
                .delete-btn {
                    width: 28px; height: 28px;
                    border-radius: 6px;
                    border: 1px solid #fee2e2;
                    background: #fff;
                    color: #ef4444;
                    display: flex; alignItems: 'center'; justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s;
                }
                .product-card:hover .delete-btn { opacity: 1; }
                .delete-btn:hover { background: #ef4444; color: #fff; }
            `}</style>
        </div>
    );
});

export { ProductTable };
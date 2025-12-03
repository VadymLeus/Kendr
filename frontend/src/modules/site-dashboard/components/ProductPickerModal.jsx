// frontend/src/modules/site-dashboard/components/ProductPickerModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

const ProductPickerModal = ({ isOpen, onClose, onSave, initialSelectedIds = [], siteId }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && siteId) {
            setLoading(true);
            Promise.all([
                apiClient.get(`/products/site/${siteId}`),
                apiClient.get(`/categories/site/${siteId}`)
            ])
            .then(([productsRes, categoriesRes]) => {
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            })
            .catch(err => toast.error('Помилка завантаження даних'))
            .finally(() => setLoading(false));
            
            setSelectedIds(new Set(initialSelectedIds));
        }
    }, [isOpen, siteId, initialSelectedIds]);

    const toggleProduct = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            if (newSelected.size >= 20) {
                toast.error('Максимум 20 товарів');
                return;
            }
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSave = () => {
        onSave(Array.from(selectedIds));
        onClose();
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const selectAllFiltered = () => {
        const newSelected = new Set(selectedIds);
        let addedCount = 0;
        const limit = 20;

        if (newSelected.size >= limit) {
            toast.warning('Ліміт у 20 товарів вже досягнуто');
            return;
        }

        for (const p of filteredProducts) {
            if (!newSelected.has(p.id)) {
                if (newSelected.size < limit) {
                    newSelected.add(p.id);
                    addedCount++;
                } else {
                    toast.warning(`Додано ${addedCount} товарів. Досягнуто ліміт 20.`);
                    break;
                }
            }
        }
        
        if (addedCount > 0) {
            setSelectedIds(newSelected);
            toast.success(`Додано ${addedCount} товарів`);
        } else if (newSelected.size < limit) {
            toast.info('Всі доступні товари вже обрані');
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return '⇵';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category_id == selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'name') {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            const aIsCyrillic = /[а-яіїєґ]/.test(aValue);
            const bIsCyrillic = /[а-яіїєґ]/.test(bValue);
            
            if (aIsCyrillic && !bIsCyrillic) return 1;
            if (!aIsCyrillic && bIsCyrillic) return -1;
        } else if (sortBy === 'price') {
            aValue = a.price || 0;
            bValue = b.price || 0;
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
    };

    const modalStyle = {
        background: 'var(--platform-card-bg)', 
        width: '900px', maxWidth: '95%', maxHeight: '90vh',
        borderRadius: '12px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--platform-border-color)',
        overflow: 'hidden'
    };

    const headerStyle = {
        padding: '1.5rem', borderBottom: '1px solid var(--platform-border-color)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        background: 'var(--platform-bg)'
    };

    const filtersRowStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
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
        padding: '10px 40px 10px 12px', borderRadius: '8px', 
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)', color: 'var(--platform-text-primary)', 
        fontSize: '0.9rem', width: '100%',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    };

    const clearButtonStyle = {
        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: 'var(--platform-text-secondary)',
        cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
        borderRadius: '4px', transition: 'color 0.2s'
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
        padding: '8px 12px', borderRadius: '6px', 
        border: `1px solid ${isActive ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
        background: isActive ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-card-bg)',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-primary)',
        cursor: 'pointer', fontSize: '0.85rem',
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
    });

    const listStyle = {
        flex: 1, overflowY: 'auto', padding: '1rem'
    };

    const footerStyle = {
        padding: '1.25rem 1.5rem', borderTop: '1px solid var(--platform-border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--platform-bg)',
        flexWrap: 'wrap',
        gap: '10px'
    };

    const itemStyle = (isSelected) => ({
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px', borderRadius: '8px', marginBottom: '8px',
        border: isSelected ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        background: isSelected ? 'rgba(var(--platform-accent-rgb), 0.08)' : 'var(--platform-card-bg)',
        cursor: 'pointer', transition: 'all 0.2s ease',
        transform: isSelected ? 'translateX(2px)' : 'none'
    });

    const checkboxStyle = {
        width: '18px', height: '18px', borderRadius: '4px',
        border: '2px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
    };

    const checkedStyle = {
        ...checkboxStyle,
        borderColor: 'var(--platform-accent)',
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)'
    };

    const buttonStyle = {
        padding: '10px 20px', borderRadius: '8px', 
        border: 'none', cursor: 'pointer',
        fontSize: '0.9rem', fontWeight: '500',
        transition: 'all 0.2s'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-accent)', 
        color: 'var(--platform-accent-text)'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-card-bg)', 
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)'
    };

    const closeHeaderBtnStyle = {
        background: 'rgba(229, 62, 62, 0.1)', 
        border: '1px solid rgba(229, 62, 62, 0.2)', 
        fontSize: '1.2rem',
        cursor: 'pointer', 
        color: '#e53e3e',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        lineHeight: 1
    };

    const selectAllButtonStyle = {
        ...secondaryButtonStyle,
        fontSize: '0.85rem',
        padding: '8px 12px',
        color: 'var(--platform-accent)',
        borderColor: 'var(--platform-accent)',
        background: 'var(--platform-card-bg)',
        transition: 'all 0.2s ease'
    };

    const selectAllButtonHoverStyle = {
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };

    const clearSelectionButtonStyle = {
        ...secondaryButtonStyle,
        color: '#f56565',
        borderColor: '#f56565',
        fontSize: '0.85rem',
        padding: '8px 12px',
        background: 'var(--platform-card-bg)',
        transition: 'all 0.2s ease'
    };

    const clearSelectionButtonHoverStyle = {
        background: '#f56565',
        color: 'white',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(245, 101, 101, 0.2)'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                            <h3 style={{margin: 0, color: 'var(--platform-text-primary)', fontSize: '1.25rem'}}>
                                Вибір товарів
                            </h3>
                            <p style={{margin: '4px 0 0 0', color: 'var(--platform-text-secondary)', fontSize: '0.9rem'}}>
                                Оберіть товари для відображення у вітрині (макс. 20)
                            </p>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            style={closeHeaderBtnStyle}
                            onMouseEnter={e => {
                                e.target.style.background = '#e53e3e';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = 'rgba(229, 62, 62, 0.1)';
                                e.target.style.color = '#e53e3e';
                            }}
                            title="Закрити"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div style={filtersRowStyle}>
                        <div style={searchContainerStyle}>
                            <input 
                                type="text" 
                                placeholder="🔍 Пошук товарів..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--platform-accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--platform-border-color)'}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={clearSearch}
                                    style={clearButtonStyle}
                                    title="Очистити пошук"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        
                        <div style={selectWrapperStyle}>
                            <select 
                                value={selectedCategory} 
                                onChange={e => setSelectedCategory(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="all">Всі категорії</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={sortButtonsContainerStyle}>
                            <button 
                                onClick={() => toggleSort('name')}
                                style={sortButtonStyle(sortBy === 'name')}
                            >
                                A-Z {getSortIcon('name')}
                            </button>
                            <button 
                                onClick={() => toggleSort('price')}
                                style={sortButtonStyle(sortBy === 'price')}
                            >
                                Ціна {getSortIcon('price')}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={listStyle} className="custom-scrollbar">
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--platform-text-secondary)'}}>
                            Завантаження товарів...
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--platform-text-secondary)'}}>
                            {searchTerm || selectedCategory !== 'all' ? 'Товарів за вашим запитом не знайдено' : 'Товарів не знайдено'}
                        </div>
                    ) : (
                        sortedProducts.map(product => {
                            const isSelected = selectedIds.has(product.id);
                            const imgUrl = product.image_gallery?.[0] ? `${API_URL}${product.image_gallery[0]}` : 'https://placehold.co/50x50/EFEFEF/31343C?text=📷';
                            const category = categories.find(c => c.id === product.category_id);
                            
                            return (
                                <div 
                                    key={product.id} 
                                    style={itemStyle(isSelected)} 
                                    onClick={() => toggleProduct(product.id)}
                                >
                                    <div style={isSelected ? checkedStyle : checkboxStyle}>
                                        {isSelected && '✓'}
                                    </div>
                                    <img 
                                        src={imgUrl} 
                                        alt="" 
                                        style={{
                                            width: '48px', 
                                            height: '48px', 
                                            objectFit: 'cover', 
                                            borderRadius: '6px',
                                            border: '1px solid var(--platform-border-color)'
                                        }} 
                                    />
                                    <div style={{flex: 1}}>
                                        <div style={{
                                            fontWeight: '500', 
                                            color: 'var(--platform-text-primary)',
                                            marginBottom: '4px'
                                        }}>
                                            {product.name}
                                        </div>
                                        <div style={{
                                            display: 'flex', 
                                            gap: '1rem', 
                                            fontSize: '0.85rem', 
                                            color: 'var(--platform-text-secondary)',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{fontWeight: '500'}}>{product.price} грн</span>
                                            {category && (
                                                <span style={{
                                                    background: 'var(--platform-bg)',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--platform-border-color)',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    📁 {category.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={footerStyle}>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
                        <span style={{color: 'var(--platform-text-secondary)', fontSize: '0.9rem', marginRight: '8px'}}>
                            Обрано: <strong style={{color: 'var(--platform-text-primary)'}}>{selectedIds.size}</strong> / 20
                        </span>
                        
                        <button 
                            onClick={selectAllFiltered}
                            style={selectAllButtonStyle}
                            onMouseEnter={e => {
                                Object.assign(e.target.style, selectAllButtonHoverStyle);
                            }}
                            onMouseLeave={e => {
                                Object.assign(e.target.style, selectAllButtonStyle);
                            }}
                            title="Додати всі відфільтровані товари до вибору"
                        >
                            + Всі ({sortedProducts.length})
                        </button>

                        {selectedIds.size > 0 && (
                            <button 
                                onClick={clearSelection}
                                style={clearSelectionButtonStyle}
                                onMouseEnter={e => {
                                    Object.assign(e.target.style, clearSelectionButtonHoverStyle);
                                }}
                                onMouseLeave={e => {
                                    Object.assign(e.target.style, clearSelectionButtonStyle);
                                }}
                            >
                                × Очистити
                            </button>
                        )}
                    </div>
                    <div style={{display: 'flex', gap: '12px'}}>
                        <button 
                            onClick={onClose} 
                            style={secondaryButtonStyle}
                        >
                            Скасувати
                        </button>
                        <button 
                            onClick={handleSave} 
                            style={primaryButtonStyle}
                        >
                            Зберегти ({selectedIds.size})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPickerModal;
// frontend/src/components/editor/settings/CatalogSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const CatalogSettings = ({ data, onChange, siteData }) => {
    
    const allProducts = siteData?.products || [];
    const [searchTerm, setSearchTerm] = useState(''); // Пошук для ручного режиму
    const [excludeSearchTerm, setExcludeSearchTerm] = useState(''); // Пошук для режиму виключення
    
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all'); // Локальний стан для фільтра в ручному режимі
    
    // Переконаємося, що дані блоку мають всі нові поля
    const blockData = {
        mode: 'auto',
        category_id: 'all',
        selectedProductIds: [],
        excludedProductIds: [], // Нове поле
        ...data 
    };

    useEffect(() => {
        if (siteData?.id) {
            apiClient.get(`/categories/site/${siteData.id}`)
                .then(res => setCategories(res.data))
                .catch(err => console.error("Не вдалося завантажити категорії", err));
        }
    }, [siteData?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...blockData, [name]: value });
    };

    // Обробник для РУЧНОГО ВИБОРУ
    const handleProductToggle = (productId) => {
        const currentIds = new Set(blockData.selectedProductIds || []);
        if (currentIds.has(productId)) {
            currentIds.delete(productId);
        } else {
            currentIds.add(productId);
        }
        onChange({ ...blockData, selectedProductIds: Array.from(currentIds) });
    };
    
    // Обробник для СПИСКУ ВИКЛЮЧЕНЬ (в Авто-режимі)
    const handleExcludeToggle = (productId) => {
        const currentIds = new Set(blockData.excludedProductIds || []);
        if (currentIds.has(productId)) {
            currentIds.delete(productId);
        } else {
            currentIds.add(productId);
        }
        onChange({ ...blockData, excludedProductIds: Array.from(currentIds) });
    };


    const formGroupStyle = { marginBottom: '1.5rem' };
    const labelStyle = { 
        display: 'block', 
        marginBottom: '0.5rem', 
        color: 'var(--platform-text-primary)', 
        fontWeight: '500' 
    };
    const inputStyle = { 
        width: '100%', 
        padding: '0.75rem', 
        border: '1px solid var(--platform-border-color)', 
        borderRadius: '4px', 
        fontSize: '1rem', 
        background: 'var(--platform-card-bg)', 
        color: 'var(--platform-text-primary)',
        boxSizing: 'border-box'
    };
    const radioGroupStyle = {
        display: 'flex',
        gap: '0.5rem',
        background: 'var(--platform-bg)',
        padding: '0.5rem',
        borderRadius: '6px',
        border: '1px solid var(--platform-border-color)',
        alignItems: 'center' // [FIX 1] Додано для вирівнювання
    };
    const radioLabelStyle = (isActive) => ({
        flex: 1,
        textAlign: 'center',
        padding: '0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        background: isActive ? 'var(--platform-accent)' : 'transparent',
        color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
        fontWeight: isActive ? '600' : 'normal',
        transition: 'all 0.2s ease',
        display: 'flex', // [FIX 1] Додано для вирівнювання
        alignItems: 'center', // [FIX 1] Додано для вирівнювання
        justifyContent: 'center' // [FIX 1] Додано для вирівнювання
    });

    const productsContainerStyle = { 
        maxHeight: '300px', 
        overflowY: 'auto', 
        border: '1px solid var(--platform-border-color)', 
        borderRadius: '8px', 
        padding: '1rem', 
        background: 'var(--platform-bg)' 
    };
    const productItemStyle = { 
        display: 'block', 
        padding: '0.75rem 0', 
        cursor: 'pointer', 
        borderBottom: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)'
    };
    const checkboxStyle = { 
        marginRight: '10px', 
        cursor: 'pointer' 
    };

    // Фільтр для ручного вибору
    const filteredProducts = React.useMemo(() => 
        allProducts.filter(product => {
            const matchesCategory = selectedCategory === 'all' || 
                                    String(product.category_id) === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        }), 
        [allProducts, searchTerm, selectedCategory]
    );
    
    // Фільтр для списку виключень (показує тільки товари з обраної категорії)
    const excludeFilteredProducts = React.useMemo(() => 
        allProducts.filter(product => {
            const matchesCategory = blockData.category_id === 'all' || 
                                    String(product.category_id) === blockData.category_id;
            const matchesSearch = product.name.toLowerCase().includes(excludeSearchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        }), 
        [allProducts, excludeSearchTerm, blockData.category_id]
    );

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок розділу:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={blockData.title || 'Популярні товари'} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                    placeholder="Введіть заголовок розділу"
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Джерело даних:</label>
                <div style={radioGroupStyle}>
                    <label style={radioLabelStyle(blockData.mode === 'auto')}>
                        <input
                            type="radio"
                            name="mode"
                            value="auto"
                            checked={blockData.mode === 'auto'}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                        />
                        Автоматично
                    </label>
                    <label style={radioLabelStyle(blockData.mode === 'manual')}>
                        <input
                            type="radio"
                            name="mode"
                            value="manual"
                            checked={blockData.mode === 'manual'}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                        />
                        Ручний вибір
                    </label>
                </div>
            </div>

            <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            {/* --- УМОВНА ПАНЕЛЬ: АВТОМАТИЧНО --- */}
            {blockData.mode === 'auto' && (
                <div>
                    <h4 style={{color: 'var(--platform-text-primary)', marginTop: 0}}>Налаштування Авто-режиму</h4>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Показувати товари з категорії:</label>
                        <select
                            name="category_id"
                            value={blockData.category_id || 'all'}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="all">Всі категорії</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* [FIX 2] Новий блок для виключень */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Приховані товари ({blockData.excludedProductIds?.length || 0} приховано):</label>
                        <input
                            type="text"
                            name="excludeSearch"
                            value={excludeSearchTerm}
                            onChange={(e) => setExcludeSearchTerm(e.target.value)}
                            style={{...inputStyle, marginBottom: '0.5rem'}}
                            placeholder="Пошук товару для приховання..."
                        />
                        <div style={productsContainerStyle}>
                            {excludeFilteredProducts.length > 0 ? (
                                excludeFilteredProducts.map(product => (
                                    <label key={product.id} style={productItemStyle}>
                                        <input
                                            type="checkbox"
                                            checked={(blockData.excludedProductIds || []).includes(product.id)}
                                            onChange={() => handleExcludeToggle(product.id)}
                                            style={checkboxStyle}
                                        />
                                        {product.name} ({product.price} грн)
                                    </label>
                                ))
                            ) : (
                                <p style={{ color: 'var(--platform-text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                                    {allProducts.length === 0 ? 'Товари відсутні' : 'Товари не знайдено'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- УМОВНА ПАНЕЛЬ: РУЧНИЙ ВИБІР --- */}
            {blockData.mode === 'manual' && (
                <div>
                    <h4 style={{color: 'var(--platform-text-primary)', marginTop: 0}}>Налаштування Ручного режиму</h4>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Фільтр (для зручності пошуку):</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="all">Всі категорії</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Пошук товару:</label>
                        <input
                            type="text"
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={inputStyle}
                            placeholder="Введіть назву товару..."
                        />
                    </div>
                    
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Оберіть товари для відображення ({blockData.selectedProductIds?.length || 0} обрано):</label>
                        <div style={productsContainerStyle}>
                            {allProducts.length > 0 ? (
                                filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <label key={product.id} style={productItemStyle}>
                                            <input
                                                type="checkbox"
                                                checked={(blockData.selectedProductIds || []).includes(product.id)}
                                                onChange={() => handleProductToggle(product.id)}
                                                style={checkboxStyle}
                                            />
                                            {product.name} ({product.price} грн)
                                        </label>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--platform-text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                                        Товари за вашим запитом не знайдено.
                                    </p>
                                )
                            ) : (
                                <p style={{ color: 'var(--platform-text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                                    До цього сайту ще не додано жодного товару.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogSettings;
// frontend/src/components/editor/settings/CatalogSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const CatalogSettings = ({ data, onChange, siteData }) => {
    
    const allProducts = siteData?.products || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    useEffect(() => {
        if (siteData?.id) {
            apiClient.get(`/categories/site/${siteData.id}`)
                .then(res => setCategories(res.data))
                .catch(err => console.error("Не вдалося завантажити категорії", err));
        }
    }, [siteData?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const handleProductToggle = (productId) => {
        const currentIds = new Set(data.selectedProductIds || []);
        if (currentIds.has(productId)) {
            currentIds.delete(productId);
        } else {
            currentIds.add(productId);
        }
        onChange({ ...data, selectedProductIds: Array.from(currentIds) });
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

    const filteredProducts = React.useMemo(() => 
        allProducts.filter(product => {
            const matchesCategory = selectedCategory === 'all' || 
                                    String(product.category_id) === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesCategory && matchesSearch;
        }), 
        [allProducts, searchTerm, selectedCategory]
    );

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок розділу:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні товари'} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                    placeholder="Введіть заголовок розділу"
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Фільтр за категорією:</label>
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
                <label style={labelStyle}>Оберіть товари для відображення ({data.selectedProductIds?.length || 0} обрано):</label>
                <div style={productsContainerStyle}>
                    {allProducts.length > 0 ? (
                        filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <label key={product.id} style={productItemStyle}>
                                    <input
                                        type="checkbox"
                                        checked={(data.selectedProductIds || []).includes(product.id)}
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

            <p style={{ color: 'var(--platform-text-secondary)', marginTop: '15px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                Щоб додати, редагувати або видалити самі товари, перейдіть на вкладку
                <strong style={{color: 'var(--platform-text-primary)'}}> "Товари та категорії" </strong> 
                в меню керування сайтом.
            </p>
        </div>
    );
};

export default CatalogSettings;
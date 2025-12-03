// frontend/src/modules/site-editor/blocks/Catalog/CatalogSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../common/services/api';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500', fontSize: '0.9rem' 
};
const inputStyle = { 
    width: '100%', padding: '0.7rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '0.9rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box'
};
const checkboxRowStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem', cursor: 'pointer',
    color: 'var(--platform-text-primary)', fontSize: '0.9rem'
};

const CatalogSettings = ({ data, onChange, siteData }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (siteData?.id) {
            apiClient.get(`/categories/site/${siteData.id}`)
                .then(res => setCategories(res.data))
                .catch(console.error);
        }
    }, [siteData?.id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newValue = value;

        if (type === 'number' || name === 'columns') {
            const num = parseInt(value, 10);
            newValue = isNaN(num) || value.trim() === '' ? '' : num;
        } else if (type === 'checkbox') {
            newValue = checked;
        }

        onChange({ 
            ...data, 
            [name]: newValue 
        });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок блоку:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || ''} 
                    onChange={handleChange} 
                    placeholder="Напр. Наш Каталог"
                    style={inputStyle}
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Джерело товарів:</label>
                <select 
                    name="source_type" 
                    value={data.source_type || 'all'} 
                    onChange={handleChange} 
                    style={inputStyle}
                >
                    <option value="all">Весь магазин (Всі товари)</option>
                    <option value="category">З конкретної категорії</option>
                </select>
                
                {data.source_type === 'category' && (
                    <div style={{ marginTop: '10px' }}>
                        <label style={{...labelStyle, fontSize: '0.8rem'}}>Оберіть кореневу категорію:</label>
                        <select 
                            name="root_category_id" 
                            value={data.root_category_id || ''} 
                            onChange={handleChange} 
                            style={inputStyle}
                        >
                            <option value="">-- Оберіть категорію --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            <div style={formGroupStyle}>
                <label style={labelStyle}>Інструменти для клієнта:</label>
                <label style={checkboxRowStyle}>
                    <input 
                        type="checkbox" 
                        name="show_search" 
                        checked={data.show_search !== false} 
                        onChange={handleChange} 
                    />
                    Показувати рядок пошуку
                </label>
                <label style={checkboxRowStyle}>
                    <input 
                        type="checkbox" 
                        name="show_category_filter" 
                        checked={data.show_category_filter !== false} 
                        onChange={handleChange} 
                    />
                    Показувати фільтр категорій
                </label>
                <label style={checkboxRowStyle}>
                    <input 
                        type="checkbox" 
                        name="show_sorting" 
                        checked={data.show_sorting !== false} 
                        onChange={handleChange} 
                    />
                    Показувати сортування
                </label>
            </div>

            <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            <div style={formGroupStyle}>
                <label style={labelStyle}>Налаштування відображення:</label>
                
                <div style={{marginBottom: '1rem'}}>
                    <label style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)', display: 'block', marginBottom: '4px'}}>
                        Товарів на одній сторінці (4-100):
                    </label>
                    <input 
                        type="number" 
                        name="items_per_page" 
                        min="4" max="100" 
                        value={data.items_per_page === 0 ? '' : data.items_per_page || ''} 
                        onChange={handleChange} 
                        placeholder="12 (за замовчуванням)"
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)', display: 'block', marginBottom: '4px'}}>
                        Кількість колонок (Desktop): {data.columns || 3}
                    </label>
                    <input 
                        type="range" 
                        name="columns" 
                        min="1" max="6" 
                        value={data.columns || 3} 
                        onChange={handleChange} 
                        style={{width: '100%', cursor: 'pointer'}}
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--platform-text-secondary)'}}>
                        <span>1</span><span>6</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogSettings;
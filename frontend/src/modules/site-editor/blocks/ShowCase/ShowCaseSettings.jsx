// frontend/src/modules/site-editor/blocks/ShowCase/ShowCaseSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../common/services/api';
import ProductPickerModal from '../../../site-dashboard/components/ProductPickerModal';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500' 
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '1rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box'
};

const ShowCaseSettings = ({ data, onChange, siteData }) => {
    const [categories, setCategories] = useState([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    useEffect(() => {
        if (siteData?.id) {
            apiClient.get(`/categories/site/${siteData.id}`)
                .then(res => setCategories(res.data))
                .catch(console.error);
        }
    }, [siteData?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const handleProductsSelected = (ids) => {
        onChange({ ...data, selected_product_ids: ids });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок вітрини:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || ''} 
                    onChange={handleChange} 
                    placeholder="Напр. Хіти продажів"
                    style={inputStyle}
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Джерело товарів:</label>
                <select 
                    name="source_type" 
                    value={data.source_type || 'category'} 
                    onChange={handleChange} 
                    style={inputStyle}
                >
                    <option value="category">Автоматично (з категорії)</option>
                    <option value="manual">Вручну (вибір товарів)</option>
                </select>
            </div>

            <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            {data.source_type === 'category' ? (
                <>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Категорія:</label>
                        <select 
                            name="category_id" 
                            value={data.category_id || 'all'} 
                            onChange={handleChange} 
                            style={inputStyle}
                        >
                            <option value="all">Всі категорії</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Кількість товарів ({data.limit || 8}):</label>
                        <input 
                            type="range" 
                            name="limit" 
                            min="1" max="20" 
                            value={data.limit || 8} 
                            onChange={handleChange} 
                            style={{width: '100%', cursor: 'pointer'}}
                        />
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--platform-text-secondary)'}}>
                            <span>1</span><span>20</span>
                        </div>
                    </div>
                </>
            ) : (
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Обрані товари:</label>
                    <div style={{marginBottom: '1rem', color: 'var(--platform-text-secondary)', fontSize: '0.9rem'}}>
                        Вибрано: {data.selected_product_ids?.length || 0}
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setIsPickerOpen(true)}
                        style={{
                            width: '100%', padding: '10px', 
                            background: 'var(--platform-accent)', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer'
                        }}
                    >
                        ➕ Обрати товари
                    </button>
                    
                    <ProductPickerModal 
                        isOpen={isPickerOpen}
                        onClose={() => setIsPickerOpen(false)}
                        onSave={handleProductsSelected}
                        initialSelectedIds={data.selected_product_ids || []}
                        siteId={siteData?.id}
                    />
                </div>
            )}

            <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            <div style={formGroupStyle}>
                <label style={labelStyle}>Кількість колонок ({data.columns || 4}):</label>
                <input 
                    type="range" 
                    name="columns" 
                    min="1" max="6" 
                    value={data.columns || 4} 
                    onChange={handleChange} 
                    style={{width: '100%', cursor: 'pointer'}}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--platform-text-secondary)'}}>
                    <span>1</span><span>6</span>
                </div>
            </div>
        </div>
    );
};

export default ShowCaseSettings;
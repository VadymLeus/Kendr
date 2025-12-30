// frontend/src/modules/site-editor/blocks/ShowCase/ShowCaseSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../common/services/api';
import ProductPickerModal from '../../../site-dashboard/components/ProductPickerModal';
import { commonStyles } from '../../components/common/SettingsUI';
import CustomSelect from '../../../../common/components/ui/CustomSelect';

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

    const sourceTypeOptions = [
        { value: 'category', label: 'Автоматично (з категорії)' },
        { value: 'manual', label: 'Вручну (вибір товарів)' }
    ];

    const categoryOptions = [
        { value: 'all', label: 'Всі категорії' },
        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Заголовок вітрини:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || ''} 
                    onChange={handleChange} 
                    placeholder="Напр. Хіти продажів"
                    style={commonStyles.input}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Джерело товарів:</label>
                <CustomSelect 
                    name="source_type" 
                    value={data.source_type || 'category'} 
                    onChange={handleChange} 
                    options={sourceTypeOptions}
                    style={commonStyles.input}
                />
            </div>

            <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            {data.source_type === 'category' ? (
                <>
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Категорія:</label>
                        <CustomSelect 
                            name="category_id" 
                            value={data.category_id || 'all'} 
                            onChange={handleChange} 
                            options={categoryOptions}
                            style={commonStyles.input}
                        />
                    </div>
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Кількість товарів ({data.limit || 8}):</label>
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
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Обрані товари:</label>
                    <div style={{marginBottom: '1rem', color: 'var(--platform-text-secondary)', fontSize: '0.9rem'}}>
                        Вибрано: {data.selected_product_ids?.length || 0}
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setIsPickerOpen(true)}
                        style={{
                            width: '100%', padding: '10px', 
                            background: 'var(--platform-accent)', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontWeight: '500', transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        <span>➕</span> Обрати товари
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

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Кількість колонок ({data.columns || 4}):</label>
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
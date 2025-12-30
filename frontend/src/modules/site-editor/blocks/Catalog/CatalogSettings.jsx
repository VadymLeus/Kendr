// frontend/src/modules/site-editor/blocks/Catalog/CatalogSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../common/services/api';
import { commonStyles, ToggleSwitch, SectionTitle } from '../../components/common/SettingsUI';
import CustomSelect from '../../../../common/components/ui/CustomSelect';

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

    const handleSwitchChange = (name, val) => {
        onChange({ ...data, [name]: val });
    };

    const sourceTypeOptions = [
        { value: 'all', label: 'Весь магазин (Всі товари)' },
        { value: 'category', label: 'З конкретної категорії' }
    ];

    const categoryOptions = [
        { value: "", label: "-- Оберіть категорію --" },
        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Заголовок блоку:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || ''} 
                    onChange={handleChange} 
                    placeholder="Напр. Наш Каталог"
                    style={commonStyles.input}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Джерело товарів:</label>
                <CustomSelect 
                    name="source_type" 
                    value={data.source_type || 'all'} 
                    onChange={(e) => onChange({ ...data, source_type: e.target.value })}
                    options={sourceTypeOptions}
                    style={commonStyles.input}
                />
                
                {data.source_type === 'category' && (
                    <div style={{ marginTop: '10px' }}>
                        <label style={{...commonStyles.label, fontSize: '0.8rem'}}>Оберіть кореневу категорію:</label>
                        <CustomSelect 
                            name="root_category_id" 
                            value={data.root_category_id || ''} 
                            onChange={(e) => onChange({ ...data, root_category_id: e.target.value })}
                            options={categoryOptions}
                            style={commonStyles.input}
                        />
                    </div>
                )}
            </div>

            <SectionTitle>Інструменти для клієнта</SectionTitle>

            <ToggleSwitch 
                checked={data.show_search !== false}
                onChange={(val) => handleSwitchChange('show_search', val)}
                label="Показувати рядок пошуку"
            />
            <ToggleSwitch 
                checked={data.show_category_filter !== false}
                onChange={(val) => handleSwitchChange('show_category_filter', val)}
                label="Показувати фільтр категорій"
            />
            <ToggleSwitch 
                checked={data.show_sorting !== false}
                onChange={(val) => handleSwitchChange('show_sorting', val)}
                label="Показувати сортування"
            />

            <SectionTitle>Налаштування відображення</SectionTitle>

            <div style={commonStyles.formGroup}>
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
                        style={commonStyles.input}
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
// frontend/src/modules/editor/blocks/Catalog/CatalogSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../shared/api/api';
import { commonStyles, ToggleSwitch, SectionTitle } from '../../controls/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../../shared/ui/elements/Input';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider'; 
import { Type, Grid, List, Layers } from 'lucide-react';

const CatalogSettings = ({ data, onChange, siteData }) => {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        if (siteData?.id) {
            apiClient.get(`/categories/site/${siteData.id}`)
                .then(res => setCategories(res.data))
                .catch(console.error);
        }
    }, [siteData?.id]);

    const updateData = (updates) => {
        onChange({ ...data, ...updates });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    const handleSwitchChange = (name, val) => {
        updateData({ [name]: val });
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
                <Input 
                    label="Заголовок блоку"
                    name="title" 
                    value={data.title || ''} 
                    onChange={handleInputChange} 
                    placeholder="Напр. Наш Каталог"
                    leftIcon={<Type size={16} />}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Джерело товарів:</label>
                <CustomSelect 
                    name="source_type" 
                    value={data.source_type || 'all'} 
                    onChange={(e) => updateData({ source_type: e.target.value })}
                    options={sourceTypeOptions}
                    style={commonStyles.input}
                    leftIcon={<Layers size={16} />}
                />
                
                {data.source_type === 'category' && (
                    <div style={{ marginTop: '10px' }}>
                        <label style={{...commonStyles.label, fontSize: '0.8rem'}}>Оберіть кореневу категорію:</label>
                        <CustomSelect 
                            name="root_category_id" 
                            value={data.root_category_id || ''} 
                            onChange={(e) => updateData({ root_category_id: e.target.value })}
                            options={categoryOptions}
                            style={commonStyles.input}
                            leftIcon={<List size={16} />}
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
                <RangeSlider 
                    label="Товарів на одній сторінці"
                    value={data.items_per_page || 12}
                    min={4}
                    max={100}
                    step={4}
                    onChange={(val) => updateData({ items_per_page: val })}
                    unit="" 
                />
            </div>

            <div style={commonStyles.formGroup}>
                <RangeSlider 
                    label="Кількість колонок (Desktop)"
                    value={data.columns || 3}
                    min={1}
                    max={6}
                    step={1}
                    onChange={(val) => updateData({ columns: val })}
                    unit="" 
                />
            </div>
        </div>
    );
};

export default CatalogSettings;
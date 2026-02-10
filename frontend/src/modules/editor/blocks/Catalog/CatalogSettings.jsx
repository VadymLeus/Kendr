// frontend/src/modules/editor/blocks/Catalog/CatalogSettings.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../shared/api/api';
import { commonStyles, ToggleSwitch, SectionTitle, ToggleGroup } from '../../ui/configuration/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../../shared/ui/elements/Input';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider'; 
import FontSelector from '../../ui/components/FontSelector';
import { Type, List, Layers, Settings, LayoutGrid } from 'lucide-react';

const CatalogSettings = ({ data, onChange, siteData }) => {
    const [categories, setCategories] = useState([]);
    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };
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
        { value: 'all', label: 'Весь магазин' },
        { value: 'category', label: 'Певна категорія' }
    ];

    const categoryOptions = [
        { value: "", label: "-- Оберіть категорію --" },
        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <SectionTitle icon={<Type size={16} />}>Заголовок та Шрифт</SectionTitle>
                <div className="mb-5">
                    <Input 
                        name="title" 
                        value={data.title || ''} 
                        onChange={handleInputChange} 
                        placeholder="Напр. Наш Каталог"
                    />
                </div>
                <div className="mb-5">
                    <FontSelector 
                        value={data.titleFontFamily}
                        onChange={(val) => updateData({ titleFontFamily: val })}
                        label="Шрифт заголовка"
                        siteFonts={currentSiteFonts}
                    />
                </div>
            </div>
            <div>
                <SectionTitle icon={<Layers size={16} />}>Джерело товарів</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Що показувати?</label>
                    <ToggleGroup 
                        options={sourceTypeOptions}
                        value={data.source_type || 'all'}
                        onChange={(val) => updateData({ source_type: val })}
                    />
                </div>
                {data.source_type === 'category' && (
                    <div className="mb-5">
                        <label style={{...commonStyles.label}}>Оберіть категорію:</label>
                        <CustomSelect 
                            name="root_category_id" 
                            value={data.root_category_id || ''} 
                            onChange={(e) => updateData({ root_category_id: e.target.value })}
                            options={categoryOptions}
                            leftIcon={<List size={16} />}
                        />
                    </div>
                )}
            </div>
            <div>
                <SectionTitle icon={<Settings size={16} />}>Інструменти для клієнта</SectionTitle>
                <div className="flex flex-col gap-2">
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
                </div>
            </div>

            <div>
                <SectionTitle icon={<LayoutGrid size={16} />}>Налаштування відображення</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Кількість колонок (Desktop)</label>
                    <ToggleGroup 
                        options={[
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                            { value: 4, label: '4' },
                            { value: 5, label: '5' },
                        ]}
                        value={data.columns || 3}
                        onChange={(val) => updateData({ columns: val })}
                    />
                </div>

                <div className="mb-5">
                    <RangeSlider 
                        label="Товарів на одній сторінці"
                        value={data.items_per_page || 12}
                        min={4}
                        max={48}
                        step={4}
                        onChange={(val) => updateData({ items_per_page: val })}
                        unit=" шт" 
                    />
                </div>
            </div>
        </div>
    );
};

export default CatalogSettings;
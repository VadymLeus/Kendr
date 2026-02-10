// frontend/src/modules/editor/blocks/ShowCase/ShowCaseSettings.jsx
import React, { useState, useEffect } from 'react';
import { commonStyles, SectionTitle, ToggleGroup } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import ProductPickerModal from '../../../dashboard/components/ProductPickerModal';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import apiClient from '../../../../shared/api/api';
import AlignmentControl from '../../ui/components/AlignmentControl';
import FontSelector from '../../ui/components/FontSelector';
import { LayoutGrid, ShoppingBag, Type, List, Layers, } from 'lucide-react';

const ShowCaseSettings = ({ data, onChange, siteData }) => { 
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };
    
    const normalizedData = {
        title: '',
        columns: 4,
        source_type: 'category',
        category_id: 0,
        alignment: 'center',
        ...data
    };

    const updateData = (updates) => onChange({ ...normalizedData, ...updates });
    const handleProductSelection = (ids) => {
        updateData({ selected_product_ids: ids });
    };

    useEffect(() => {
        const fetchCategories = async () => {
            if (!siteData?.id) return;
            setIsLoadingCategories(true);
            try {
                const res = await apiClient.get(`/categories/site/${siteData.id}`);
                const options = [
                    { value: 0, label: 'Всі товари' },
                    ...res.data.map(cat => ({
                        value: cat.id,
                        label: cat.name
                    }))
                ];
                setCategories(options);
            } catch (error) {
                console.error("Failed to load categories", error);
                setCategories([{ value: 0, label: 'Помилка завантаження' }]);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [siteData?.id]);

    return (
        <div className="flex flex-col gap-6">
            <ProductPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSave={handleProductSelection}
                initialSelectedIds={normalizedData.selected_product_ids || []}
                siteId={siteData?.id}
            />

            <div>
                <SectionTitle icon={<Type size={18}/>}>Заголовок</SectionTitle>
                <div className="mb-5">
                    <Input 
                        value={normalizedData.title}
                        onChange={(e) => updateData({ title: e.target.value })}
                        placeholder="Наприклад: Новинки"
                    />
                </div>
                
                <div className="mb-5">
                    <FontSelector 
                        value={normalizedData.titleFontFamily}
                        onChange={(val) => updateData({ titleFontFamily: val })}
                        label="Шрифт заголовка"
                        siteFonts={currentSiteFonts}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Layers size={18}/>}>Джерело товарів</SectionTitle>
                
                <div className="mb-5">
                    <label style={commonStyles.label}>Режим відображення</label>
                    <ToggleGroup 
                        options={[
                            { value: 'category', label: 'Категорія' },
                            { value: 'manual', label: 'Вибрані вручну' },
                        ]}
                        value={normalizedData.source_type}
                        onChange={(val) => updateData({ source_type: val })}
                    />
                </div>

                {normalizedData.source_type === 'manual' ? (
                    <div className="mb-5">
                        <div className="mb-3">
                            <Button 
                                variant="outline" 
                                className="w-full border-(--platform-accent) text-(--platform-accent)"
                                icon={<ShoppingBag size={16} />}
                                onClick={() => setIsPickerOpen(true)}
                            >
                                Обрати товари зі списку
                            </Button>
                        </div>
                        <small className="block text-center text-xs text-(--platform-text-secondary)">
                            {normalizedData.selected_product_ids?.length > 0 
                                ? `Обрано: ${normalizedData.selected_product_ids.length} шт.` 
                                : 'Товари не обрано'}
                        </small>
                    </div>
                ) : (
                    <div className="mb-5">
                        <label style={commonStyles.label}>Категорія</label>
                        <CustomSelect 
                            value={normalizedData.category_id}
                            onChange={(e) => updateData({ category_id: parseInt(e.target.value) })}
                            options={categories}
                            isLoading={isLoadingCategories}
                            leftIcon={<List size={16}/>}
                        />
                    </div>
                )}
                
                <div className="text-[0.8rem] text-(--platform-text-secondary) mt-2 p-3 bg-(--platform-bg) rounded-md border border-(--platform-border-color)">
                    * У блоці будуть відображатися перші <strong>20 товарів</strong> з вибраної категорії.
                </div>
            </div>

            <div>
                <SectionTitle icon={<LayoutGrid size={18}/>}>Вигляд сітки</SectionTitle>
                
                <div className="mb-5">
                    <AlignmentControl 
                        value={normalizedData.alignment}
                        onChange={(val) => updateData({ alignment: val })}
                        label="Вирівнювання заголовка"
                        showJustify={false}
                    />
                </div>

                <div className="mb-5">
                    <label style={commonStyles.label}>Кількість колонок (ПК)</label>
                    <ToggleGroup 
                        options={[
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                            { value: 4, label: '4' },
                            { value: 5, label: '5' },
                        ]}
                        value={normalizedData.columns}
                        onChange={(val) => updateData({ columns: val })}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShowCaseSettings;
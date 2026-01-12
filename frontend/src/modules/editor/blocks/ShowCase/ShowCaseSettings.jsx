// frontend/src/modules/editor/blocks/ShowCase/ShowCaseSettings.jsx
import React, { useState } from 'react';
import { commonStyles, SectionTitle, ToggleGroup } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import ProductPickerModal from '../../../dashboard/components/ProductPickerModal';
import { 
    LayoutGrid, 
    ShoppingBag, 
    Type, 
    List, 
    Layers, 
    AlignLeft, 
    AlignCenter, 
    AlignRight 
} from 'lucide-react';

const ShowCaseSettings = ({ data, onChange, siteData }) => { 
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    const updateData = (updates) => onChange({ ...data, ...updates });

    const handleProductSelection = (ids) => {
        updateData({ selected_product_ids: ids });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ProductPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSave={handleProductSelection}
                initialSelectedIds={data.selected_product_ids || []}
                siteId={siteData?.id}
            />

            <div>
                <SectionTitle icon={<Type size={18}/>}>Заголовок секції</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <Input 
                        value={data.title || ''}
                        onChange={(e) => updateData({ title: e.target.value })}
                        placeholder="Наприклад: Новинки"
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<LayoutGrid size={18}/>}>Макет сітки</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вирівнювання сітки</label>
                    <ToggleGroup 
                        options={[
                            { value: 'flex-start', label: <AlignLeft size={18}/>, title: 'Зліва' },
                            { value: 'center', label: <AlignCenter size={18}/>, title: 'По центру' },
                            { value: 'flex-end', label: <AlignRight size={18}/>, title: 'Справа' },
                        ]}
                        value={data.alignment || 'center'}
                        onChange={(val) => updateData({ alignment: val })}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <RangeSlider 
                        label="Кількість колонок (ПК)"
                        value={data.columns || 4}
                        min={1}
                        max={6}
                        step={1}
                        onChange={(val) => updateData({ columns: val })}
                        unit=""
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <RangeSlider 
                        label="Відступ між товарами"
                        value={data.gap || 20}
                        min={0}
                        max={60}
                        step={4}
                        onChange={(val) => updateData({ gap: val })}
                        unit="px"
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <RangeSlider 
                        label="Кількість товарів (Ліміт)"
                        value={data.limit || 8}
                        min={1}
                        max={20}
                        step={1}
                        onChange={(val) => updateData({ limit: val })}
                        unit=""
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Layers size={18}/>}>Джерело товарів</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тип вибірки</label>
                    <ToggleGroup 
                        options={[
                            { value: 'category', label: 'Категорія' },
                            { value: 'manual', label: 'Вручну' },
                        ]}
                        value={data.source_type || 'category'}
                        onChange={(val) => updateData({ source_type: val })}
                    />
                </div>

                {data.source_type === 'manual' ? (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Вибір товарів</label>
                    
                        <div style={{ marginBottom: '12px' }}>
                            <Button 
                                variant="outline" 
                                style={{ width: '100%', borderColor: 'var(--platform-accent)', color: 'var(--platform-accent)' }}
                                icon={<ShoppingBag size={16} />}
                                onClick={() => setIsPickerOpen(true)}
                            >
                                Обрати товари зі списку
                            </Button>
                        </div>

                        <label style={{...commonStyles.label, fontSize: '0.8rem', marginTop: '8px'}}>Або введіть ID вручну:</label>
                        <Input 
                            value={data.selected_product_ids ? data.selected_product_ids.join(',') : ''}
                            onChange={(e) => updateData({ 
                                selected_product_ids: e.target.value.split(',').map(id => id.trim()).filter(id => id) 
                            })}
                            placeholder="1, 5, 12..."
                            leftIcon={<ShoppingBag size={16}/>}
                        />
                        <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            {data.selected_product_ids?.length > 0 
                                ? `Обрано товарів: ${data.selected_product_ids.length}` 
                                : 'Товари не обрано'}
                        </small>
                    </div>
                ) : (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>ID Категорії (0 = Всі)</label>
                        <Input 
                            type="number"
                            value={data.category_id || ''}
                            onChange={(e) => updateData({ category_id: e.target.value })}
                            placeholder="Введіть ID категорії"
                            leftIcon={<List size={16}/>}
                        />
                        <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            Залиште порожнім або 0, щоб показати всі товари.
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowCaseSettings;
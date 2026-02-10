// frontend/src/modules/editor/blocks/Image/ImageSettings.jsx
import React from 'react';
import { generateBlockId } from '../../core/editorConfig';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../ui/configuration/SettingsUI';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { Image, Grid, Play, Link, Settings, Plus, Crop } from 'lucide-react';

const ImageSettings = ({ data, onChange }) => {
    const normalizedData = {
        mode: data.mode || 'single',
        items: Array.isArray(data.items) ? data.items : [],
        settings_slider: data.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true },
        settings_grid: { columns: 3, ...data.settings_grid },
        objectFit: data.objectFit || 'cover',
        borderRadius: data.borderRadius || '0px',
        link: data.link || '',
        targetBlank: data.targetBlank || false,
        aspectRatio: data.aspectRatio === 1 ? 1 : null 
    };

    const updateData = (updates) => onChange({ ...normalizedData, ...updates });
    const handleItemChange = (index, val) => {
        const newValue = val?.target ? val.target.value : val;
        const newItems = [...normalizedData.items];
        if (!newValue) {
            newItems.splice(index, 1);
        } else {
            newItems[index] = { ...newItems[index], src: newValue };
        }
        updateData({ items: newItems });
    };

    const handleAddItem = (val) => {
        const newValue = val?.target ? val.target.value : val;
        if (!newValue) return;
        const newItem = { id: generateBlockId(), src: newValue };
        const newItems = normalizedData.mode === 'single' 
            ? [newItem] 
            : [...normalizedData.items, newItem];
        updateData({ items: newItems });
    };

    const currentAspect = normalizedData.aspectRatio;
    return (
        <div className="flex flex-col gap-5">
            <ToggleGroup 
                options={[
                    { value: 'single', label: 'Одне', icon: <Image size={16} /> },
                    { value: 'slider', label: 'Слайдер', icon: <Play size={16} /> },
                    { value: 'grid', label: 'Сітка', icon: <Grid size={16} /> },
                ]}
                value={normalizedData.mode}
                onChange={(val) => updateData({ mode: val })}
            />

            <div className="bg-(--platform-bg) p-3 rounded-xl border border-(--platform-border-color)">
                {normalizedData.mode === 'single' ? (
                    <div className="w-full h-50">
                        <UniversalMediaInput 
                            type="image"
                            value={normalizedData.items[0]?.src || ''}
                            onChange={(e) => {
                                if (normalizedData.items.length > 0) handleItemChange(0, e);
                                else handleAddItem(e);
                            }}
                            aspect={currentAspect}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {normalizedData.items.map((item, idx) => (
                            <div key={item.id || idx} className="aspect-square w-full">
                                <UniversalMediaInput 
                                    type="image"
                                    value={item.src}
                                    onChange={(e) => handleItemChange(idx, e)}
                                    aspect={currentAspect}
                                />
                            </div>
                        ))}
                        <div className="aspect-square w-full">
                            <UniversalMediaInput 
                                type="image" 
                                value="" 
                                onChange={handleAddItem} 
                                aspect={currentAspect}
                                triggerStyle={{ width: '100%', height: '100%', padding: 0, border: 'none', background: 'transparent' }}
                            >
                                <div className="w-full h-full rounded-lg border border-dashed border-(--platform-border-color) flex flex-col items-center justify-center cursor-pointer text-(--platform-text-secondary) bg-(--platform-card-bg) gap-1 transition-all duration-200 hover:border-(--platform-accent) hover:text-(--platform-accent) hover:bg-blue-500/5 hover:-translate-y-px">
                                    <Plus size={24} />
                                    <span className="text-xs font-medium">Додати</span>
                                </div>
                            </UniversalMediaInput>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <SectionTitle icon={<Crop size={16}/>}>Формат</SectionTitle>
                <div className="mb-5">
                      <ToggleSwitch 
                        label="Квадратне зображення (1:1)"
                        checked={normalizedData.aspectRatio === 1}
                        onChange={(val) => updateData({ aspectRatio: val ? 1 : null })}
                      />
                      <div className="text-xs text-(--platform-text-secondary) mt-1.5 leading-snug">
                        {normalizedData.aspectRatio === 1 
                            ? "При завантаженні буде запропоновано обрізати фото під квадрат." 
                            : "Зображення відображатиметься в оригінальних пропорціях."}
                      </div>
                </div>
            </div>

            {normalizedData.mode === 'slider' && (
                <div className="flex flex-col gap-2">
                    <SectionTitle icon={<Settings size={16}/>}>Налаштування слайдера</SectionTitle>
                    <ToggleSwitch checked={normalizedData.settings_slider.navigation} label="Стрілки" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, navigation: v}})} />
                    <ToggleSwitch checked={normalizedData.settings_slider.autoplay} label="Автопрокрутка" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, autoplay: v}})} />
                    <ToggleSwitch checked={normalizedData.settings_slider.loop} label="Зациклити" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, loop: v}})} />
                </div>
            )}

            {normalizedData.mode === 'grid' && (
                <div className="flex flex-col gap-2">
                    <SectionTitle icon={<Grid size={16}/>}>Налаштування сітки</SectionTitle>
                    <div className="mb-5">
                         <label style={commonStyles.label}>Кількість колонок</label>
                         <CustomSelect 
                            value={normalizedData.settings_grid.columns}
                            onChange={(e) => updateData({ settings_grid: { ...normalizedData.settings_grid, columns: parseInt(e.target.value) } })}
                            options={[
                                { value: 1, label: '1 колонка' },
                                { value: 2, label: '2 колонки' },
                                { value: 3, label: '3 колонки' },
                                { value: 4, label: '4 колонки' },
                            ]}
                         />
                    </div>
                </div>
            )}

            <div>
                <SectionTitle icon={<Image size={16}/>}>Вигляд</SectionTitle>
                <div className="mb-5">
                    <RangeSlider 
                        label="Скруглення кутів"
                        value={normalizedData.borderRadius}
                        onChange={(val) => updateData({ borderRadius: val })}
                        min={0}
                        max={60}
                        unit="px"
                    />
                </div>
            </div>

            {normalizedData.mode === 'single' && (
                <div>
                    <SectionTitle icon={<Link size={16}/>}>Дія при кліку</SectionTitle>
                    <input 
                        type="text" 
                        value={normalizedData.link}
                        onChange={(e) => updateData({ link: e.target.value })}
                        style={commonStyles.input}
                        placeholder="https://..."
                    />
                </div>
            )}
        </div>
    );
};

export default ImageSettings;
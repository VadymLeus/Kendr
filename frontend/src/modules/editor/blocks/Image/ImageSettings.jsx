// frontend/src/modules/editor/blocks/Image/ImageSettings.jsx
import React from 'react';
import { generateBlockId } from '../../core/editorConfig';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../ui/configuration/SettingsUI';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import AlignmentControl from '../../ui/components/AlignmentControl'; 
import { Image, Grid, Play, Link, Settings, Plus, Crop, ChevronUp, ChevronDown } from 'lucide-react';

const ImageSettings = ({ data, onChange }) => {
    const normalizedData = {
        mode: data.mode || 'single',
        items: Array.isArray(data.items) ? data.items : [],
        settings_slider: data.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true },
        settings_grid: { columns: 3, alignment: 'center', ...data.settings_grid },
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

    const moveItem = (index, direction) => {
        const newItems = [...normalizedData.items];
        if (direction === 'up' && index > 0) {
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            updateData({ items: newItems });
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
            updateData({ items: newItems });
        }
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
                    <div className="flex flex-col gap-3">
                        {normalizedData.items.map((item, idx) => (
                            <div key={item.id || idx} className="flex gap-2 items-stretch bg-(--platform-card-bg) p-2 rounded-xl border border-(--platform-border-color) shadow-sm group">
                                <div className="flex flex-col justify-center gap-1 shrink-0">
                                    <button
                                        onClick={() => moveItem(idx, 'up')}
                                        disabled={idx === 0}
                                        className="p-1 text-(--platform-text-secondary) hover:text-(--platform-text-primary) hover:bg-black/5 dark:hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Підняти вище"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => moveItem(idx, 'down')}
                                        disabled={idx === normalizedData.items.length - 1}
                                        className="p-1 text-(--platform-text-secondary) hover:text-(--platform-text-primary) hover:bg-black/5 dark:hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Опустити нижче"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                                <div className="flex-1 h-28 relative rounded-lg overflow-hidden border border-black/5">
                                    <UniversalMediaInput 
                                        type="image"
                                        value={item.src}
                                        onChange={(e) => handleItemChange(idx, e)}
                                        aspect={currentAspect}
                                    />
                                    <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10 pointer-events-none backdrop-blur-sm">
                                        #{idx + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <UniversalMediaInput 
                            type="image" 
                            value="" 
                            onChange={handleAddItem} 
                            aspect={currentAspect}
                            triggerStyle={{ width: '100%', padding: 0, border: 'none', background: 'transparent' }}
                        >
                            <div className="w-full h-12 mt-1 rounded-xl border border-dashed border-(--platform-border-color) flex items-center justify-center cursor-pointer text-(--platform-text-secondary) bg-(--platform-card-bg) gap-2 transition-all duration-200 hover:border-(--platform-accent) hover:text-(--platform-accent) hover:bg-(--platform-accent)/5 shadow-sm">
                                <Plus size={18} />
                                <span className="text-sm font-medium">Додати зображення</span>
                            </div>
                        </UniversalMediaInput>
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
                    <div className="mb-2">
                        <AlignmentControl 
                            label="Вирівнювання сітки"
                            value={normalizedData.settings_grid.alignment}
                            onChange={(val) => updateData({ settings_grid: { ...normalizedData.settings_grid, alignment: val } })}
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
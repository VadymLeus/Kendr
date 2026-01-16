// frontend/src/modules/editor/blocks/Image/ImageSettings.jsx
import React from 'react';
import { generateBlockId } from '../../core/editorConfig';
import ImageInput from '../../../media/components/ImageInput';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../ui/configuration/SettingsUI';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
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
    const handleItemChange = (index, e) => {
        const newValue = e.target.value;
        const newItems = [...normalizedData.items];
        if (!newValue) {
            newItems.splice(index, 1);
        } else {
            newItems[index] = { ...newItems[index], src: newValue };
        }
        updateData({ items: newItems });
    };

    const handleAddItem = (e) => {
        const newValue = e.target.value;
        if (!newValue) return;
        const newItem = { id: generateBlockId(), src: newValue };
        const newItems = normalizedData.mode === 'single' 
            ? [newItem] 
            : [...normalizedData.items, newItem];
        updateData({ items: newItems });
    };

    const customStyles = `
        .grid-add-trigger {
            width: 100%; height: 100%; border-radius: 8px;
            border: 1px dashed var(--platform-border-color);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; color: var(--platform-text-secondary); background: var(--platform-card-bg);
            gap: 4px; transition: all 0.2s ease;
        }
        .grid-add-trigger:hover {
            border-color: var(--platform-accent);
            color: var(--platform-accent);
            background: rgba(59, 130, 246, 0.05);
            transform: translateY(-1px);
        }
    `;

    const currentAspect = normalizedData.aspectRatio;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <style>{customStyles}</style>
            
            <ToggleGroup 
                options={[
                    { value: 'single', label: 'Одне', icon: <Image size={16} /> },
                    { value: 'slider', label: 'Слайдер', icon: <Play size={16} /> },
                    { value: 'grid', label: 'Сітка', icon: <Grid size={16} /> },
                ]}
                value={normalizedData.mode}
                onChange={(val) => updateData({ mode: val })}
            />

            <div style={{ background: 'var(--platform-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--platform-border-color)' }}>
                {normalizedData.mode === 'single' ? (
                    <div style={{ width: '100%', height: '200px' }}>
                        <ImageInput 
                            value={normalizedData.items[0]?.src || ''}
                            onChange={(e) => {
                                if (normalizedData.items.length > 0) handleItemChange(0, e);
                                else handleAddItem(e);
                            }}
                            aspect={currentAspect}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {normalizedData.items.map((item, idx) => (
                            <div key={item.id || idx} style={{ aspectRatio: '1/1', width: '100%' }}>
                                <ImageInput 
                                    value={item.src}
                                    onChange={(e) => handleItemChange(idx, e)}
                                    aspect={currentAspect}
                                />
                            </div>
                        ))}
                        <div style={{ aspectRatio: '1/1', width: '100%' }}>
                            <ImageInput value="" onChange={handleAddItem} aspect={currentAspect}>
                                <div className="grid-add-trigger">
                                    <Plus size={24} />
                                    <span style={{fontSize: '0.75rem', fontWeight: 500}}>Додати</span>
                                </div>
                            </ImageInput>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <SectionTitle icon={<Crop size={16}/>}>Формат</SectionTitle>
                <div style={commonStyles.formGroup}>
                     <ToggleSwitch 
                        label="Квадратне зображення (1:1)"
                        checked={normalizedData.aspectRatio === 1}
                        onChange={(val) => updateData({ aspectRatio: val ? 1 : null })}
                     />
                     <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginTop: '6px', lineHeight: '1.4'}}>
                        {normalizedData.aspectRatio === 1 
                            ? "При завантаженні буде запропоновано обрізати фото під квадрат." 
                            : "Зображення відображатиметься в оригінальних пропорціях."}
                     </div>
                </div>
            </div>

            {normalizedData.mode === 'slider' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SectionTitle icon={<Settings size={16}/>}>Налаштування слайдера</SectionTitle>
                    <ToggleSwitch checked={normalizedData.settings_slider.navigation} label="Стрілки" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, navigation: v}})} />
                    <ToggleSwitch checked={normalizedData.settings_slider.autoplay} label="Автопрокрутка" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, autoplay: v}})} />
                    <ToggleSwitch checked={normalizedData.settings_slider.loop} label="Зациклити" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, loop: v}})} />
                </div>
            )}

            {normalizedData.mode === 'grid' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SectionTitle icon={<Grid size={16}/>}>Налаштування сітки</SectionTitle>
                    <div style={commonStyles.formGroup}>
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
                <div style={commonStyles.formGroup}>
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
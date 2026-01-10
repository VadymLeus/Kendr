// frontend/src/modules/editor/blocks/Image/ImageSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import MediaPickerModal from '../../../media/components/MediaPickerModal';
import { IconPlus, IconTrash, IconImage, IconGrid, IconPlay, IconLink, IconSettings } from '../../../../shared/ui/elements/Icons';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../controls/SettingsUI';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';

const API_URL = 'http://localhost:5000';

const ImageSettings = ({ data, onChange }) => {
    const normalizedData = {
        mode: data.mode || 'single',
        items: Array.isArray(data.items) ? data.items : [],
        width: data.width || 'medium',
        settings_slider: data.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true },
        settings_grid: data.settings_grid || { columns: 3 },
        objectFit: data.objectFit || 'cover',
        borderRadius: data.borderRadius || '0px',
        link: data.link || '',
        targetBlank: data.targetBlank || false
    };

    const [pickerState, setPickerState] = useState({ isOpen: false, mode: 'add', replaceIndex: null });

    const updateData = (updates) => onChange({ ...normalizedData, ...updates });

    const handleMediaSelect = (result) => {
        const files = Array.isArray(result) ? result : [result];
        if (files.length === 0) return;

        let newItems = [...normalizedData.items];

        if (pickerState.mode === 'add') {
            const added = files.map(f => ({ 
                id: generateBlockId(), 
                src: f.path_full, 
                thumb: f.path_thumb 
            }));
            if (normalizedData.mode === 'single') {
                 newItems = [added[0]];
            } else {
                 newItems = [...newItems, ...added];
            }
        } else if (pickerState.mode === 'replace' && pickerState.replaceIndex !== null) {
            newItems[pickerState.replaceIndex] = { 
                ...newItems[pickerState.replaceIndex], 
                src: files[0].path_full, 
                thumb: files[0].path_thumb 
            };
        }

        updateData({ items: newItems });
        setPickerState({ isOpen: false, mode: 'add', replaceIndex: null });
    };

    const handleReplaceClick = (index) => {
        setPickerState({ isOpen: true, mode: 'replace', replaceIndex: index });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MediaPickerModal 
                isOpen={pickerState.isOpen}
                onClose={() => setPickerState({ ...pickerState, isOpen: false })}
                onSelect={handleMediaSelect}
                multiple={pickerState.mode === 'add' && normalizedData.mode !== 'single'}
                allowedTypes={['image']}
                title={pickerState.mode === 'add' ? "Додати зображення" : "Замінити зображення"}
            />

            <ToggleGroup 
                options={[
                    { value: 'single', label: 'Одне', icon: <IconImage size={16} /> },
                    { value: 'slider', label: 'Слайдер', icon: <IconPlay size={16} /> },
                    { value: 'grid', label: 'Сітка', icon: <IconGrid size={16} /> },
                ]}
                value={normalizedData.mode}
                onChange={(val) => updateData({ mode: val })}
            />

            <div style={{ background: 'var(--platform-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--platform-border-color)' }}>
                {normalizedData.items.length === 0 ? (
                    <button 
                        className="gallery-add-btn"
                        style={{ width: '100%', height: '100px', fontSize: '0.9rem', gap: '8px' }}
                        onClick={() => setPickerState({ isOpen: true, mode: 'add', replaceIndex: null })}
                    >
                        <IconPlus size={24} />
                        <span>Вибрати зображення</span>
                    </button>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                        gap: '8px' 
                    }}>
                        {normalizedData.items.map((item, idx) => (
                            <div 
                                key={item.id || idx} 
                                style={{ 
                                    width: '100%', 
                                    aspectRatio: '1 / 1', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden', 
                                    position: 'relative', 
                                    border: '1px solid var(--platform-border-color)', 
                                    cursor: 'pointer',
                                    background: 'var(--platform-card-bg)'
                                }} 
                                onClick={() => handleReplaceClick(idx)} 
                                title="Натисніть, щоб замінити"
                            >
                                <img 
                                    src={`${API_URL}${item.thumb || item.src}`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    alt=""
                                />
                                
                                <button 
                                    className="gallery-delete-btn"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        updateData({ items: normalizedData.items.filter((_, i) => i !== idx) }); 
                                    }}
                                >
                                    <IconTrash size={10} />
                                </button>
                            </div>
                        ))}
                        {normalizedData.mode !== 'single' && (
                            <button 
                                className="gallery-add-btn"
                                onClick={() => setPickerState({ isOpen: true, mode: 'add', replaceIndex: null })}
                            >
                                <IconPlus size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {normalizedData.mode === 'slider' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SectionTitle icon={<IconSettings size={16}/>}>Налаштування слайдера</SectionTitle>
                    <ToggleSwitch checked={normalizedData.settings_slider.navigation} label="Стрілки" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, navigation: v}})} />
                    <ToggleSwitch checked={normalizedData.settings_slider.autoplay} label="Автопрокрутка" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, autoplay: v}})} />
                    <ToggleSwitch checked={normalizedData.settings_slider.loop} label="Зациклити" onChange={(v) => updateData({ settings_slider: {...normalizedData.settings_slider, loop: v}})} />
                </div>
            )}

            {normalizedData.mode === 'grid' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SectionTitle icon={<IconGrid size={16}/>}>Налаштування сітки</SectionTitle>
                    <div style={commonStyles.formGroup}>
                         <label style={commonStyles.label}>Кількість колонок</label>
                         <CustomSelect 
                            value={normalizedData.settings_grid.columns}
                            onChange={(e) => updateData({ settings_grid: { ...normalizedData.settings_grid, columns: parseInt(e.target.value) } })}
                            options={[
                                { value: 2, label: '2 колонки' },
                                { value: 3, label: '3 колонки' },
                                { value: 4, label: '4 колонки' },
                                { value: 5, label: '5 колонок' },
                            ]}
                         />
                    </div>
                </div>
            )}

            <div>
                <SectionTitle icon={<IconImage size={16}/>}>Вигляд</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Ширина блоку</label>
                    <CustomSelect 
                        value={normalizedData.width}
                        onChange={(e) => updateData({ width: e.target.value })}
                        options={[
                            { value: 'small', label: 'Вузька' },
                            { value: 'medium', label: 'Середня' },
                            { value: 'large', label: 'Широка' },
                            { value: 'full', label: 'На весь екран' }
                        ]}
                    />
                </div>
                
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
                    <SectionTitle icon={<IconLink size={16}/>}>Дія при кліку</SectionTitle>
                    <input 
                        type="text" 
                        value={normalizedData.link}
                        onChange={(e) => updateData({ link: e.target.value })}
                        style={commonStyles.input}
                        placeholder="https://..."
                    />
                </div>
            )}

            <style>{`
                .gallery-delete-btn {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: rgba(239, 68, 68, 0.9);
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 2;
                    opacity: 0.8;
                    transition: all 0.2s ease;
                }
                .gallery-delete-btn:hover {
                    opacity: 1;
                    transform: scale(1.1);
                    background: rgb(220, 38, 38);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .gallery-add-btn {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    border-radius: 8px;
                    border: 1px dashed var(--platform-border-color);
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column; 
                    cursor: pointer;
                    color: var(--platform-text-secondary);
                    transition: all 0.2s ease;
                }
                .gallery-add-btn:hover {
                    border-color: var(--platform-accent);
                    color: var(--platform-accent);
                    background: rgba(0,0,0,0.03);
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
};

export default ImageSettings;
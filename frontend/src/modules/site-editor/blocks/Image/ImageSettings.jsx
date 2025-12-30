// frontend/src/modules/site-editor/blocks/Image/ImageSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import MediaPickerModal from '../../../media/components/MediaPickerModal';
import { 
    IconPlus, IconTrash, IconImage, IconGrid, IconPlay
} from '../../../../common/components/ui/Icons';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../components/common/SettingsUI';

const API_URL = 'http://localhost:5000';

const galleryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: '8px',
    marginTop: '8px'
};

const thumbnailStyle = {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--platform-border-color)',
    cursor: 'pointer',
    backgroundColor: 'var(--platform-bg)',
    transition: 'all 0.2s'
};

const thumbImgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.2s',
};

const deleteBtnStyle = {
    position: 'absolute', top: '4px', right: '4px',
    background: 'rgba(229, 62, 62, 0.9)', color: 'white',
    border: 'none', borderRadius: '6px', width: '20px', height: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 2, padding: 0,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const addBtnStyle = {
    width: '100%', aspectRatio: '1',
    borderRadius: '8px', border: '1px dashed var(--platform-border-color)',
    background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '500',
    transition: 'all 0.2s ease', boxSizing: 'border-box'
};

const ImageSettings = ({ data, onChange }) => {
    const normalizedData = {
        mode: data.mode || 'single',
        items: (Array.isArray(data.items) && data.items.length > 0) 
            ? data.items 
            : (data.imageUrl ? [{ id: generateBlockId(), src: data.imageUrl }] : []),
        
        width: data.width || 'medium',
        settings_slider: data.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true },
        settings_grid: data.settings_grid || { columns: 3 },
        objectFit: data.objectFit || 'contain',
        borderRadius: data.borderRadius || '0px',
        link: data.link || '',
        targetBlank: data.targetBlank || false
    };

    const [pickerState, setPickerState] = useState({ isOpen: false, mode: 'add', replaceIndex: null });

    const handleDataChange = (field, value) => {
        onChange({ ...normalizedData, [field]: value });
    };

    const handleSettingsChange = (group, field, value) => {
        onChange({
            ...normalizedData,
            [group]: { ...normalizedData[group], [field]: value }
        });
    };

    const openAddPicker = () => setPickerState({ isOpen: true, mode: 'add', replaceIndex: null });
    const openReplacePicker = (index) => setPickerState({ isOpen: true, mode: 'replace', replaceIndex: index });

    const handleMediaSelect = (result) => {
        const files = Array.isArray(result) ? result : [result];
        if (files.length === 0) return;

        if (pickerState.mode === 'add') {
            const newItems = files.map(f => ({
                id: generateBlockId(),
                src: f.path_full
            }));
            
            if (normalizedData.mode === 'single') {
                 onChange({ ...normalizedData, items: [newItems[0]] });
            } else {
                 onChange({ ...normalizedData, items: [...normalizedData.items, ...newItems] });
            }
        } else if (pickerState.mode === 'replace' && pickerState.replaceIndex !== null) {
            const file = files[0];
            const newItems = [...normalizedData.items];
            newItems[pickerState.replaceIndex] = { 
                ...newItems[pickerState.replaceIndex], 
                src: file.path_full 
            };
            onChange({ ...normalizedData, items: newItems });
        }
    };

    const handleRemoveItem = (e, index) => {
        e.stopPropagation();
        const newItems = normalizedData.items.filter((_, i) => i !== index);
        onChange({ ...normalizedData, items: newItems });
    };

    const modeOptions = [
        { value: 'single', label: 'Одне', icon: <IconImage size={18} /> },
        { value: 'slider', label: 'Слайдер', icon: <IconPlay size={18} /> },
        { value: 'grid', label: 'Сітка', icon: <IconGrid size={18} /> },
    ];

    const renderGallery = () => {
        const isEmpty = normalizedData.items.length === 0;
        const isSingle = normalizedData.mode === 'single';

        const containerStyle = isSingle 
            ? { display: 'flex', justifyContent: 'center', marginTop: '12px' } 
            : galleryGridStyle;

        return (
            <div style={containerStyle}>
                {normalizedData.items.map((item, idx) => (
                    <div 
                        key={item.id || idx} 
                        style={{
                            ...thumbnailStyle,
                            width: isSingle ? '140px' : undefined,
                            height: isSingle ? '140px' : undefined,
                        }}
                        onClick={() => openReplacePicker(idx)}
                        title="Натисніть, щоб замінити"
                    >
                        <img 
                            src={item.src.startsWith('http') ? item.src : `${API_URL}${item.src}`} 
                            alt="" 
                            style={thumbImgStyle}
                        />
                        {(!isSingle || normalizedData.items.length > 0) && (
                            <button 
                                type="button" 
                                style={deleteBtnStyle}
                                onClick={(e) => handleRemoveItem(e, idx)}
                                title="Видалити"
                            >
                                <IconTrash size={12} />
                            </button>
                        )}
                    </div>
                ))}

                {(!isSingle || normalizedData.items.length === 0) && (
                    <button 
                        type="button"
                        style={{
                            ...addBtnStyle,
                            ...(isEmpty ? { gridColumn: '1 / -1', height: '100px', fontSize: '0.9rem', borderWidth: '2px' } : {}),
                            width: isSingle ? '140px' : undefined,
                            height: isSingle ? '140px' : undefined,
                            gridColumn: isSingle ? undefined : (isEmpty ? '1 / -1' : undefined)
                        }}
                        onClick={openAddPicker}
                    >
                        <IconPlus size={isEmpty || isSingle ? 24 : 18} />
                        <span>Додати фото</span>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '0.5rem 0.2rem' }}>
            <MediaPickerModal 
                isOpen={pickerState.isOpen}
                onClose={() => setPickerState(prev => ({ ...prev, isOpen: false }))}
                onSelect={handleMediaSelect}
                multiple={pickerState.mode === 'add' && normalizedData.mode !== 'single'}
                allowedTypes={['image']}
                title={pickerState.mode === 'add' ? "Додати зображення" : "Замінити зображення"}
            />

            <ToggleGroup 
                options={modeOptions}
                value={normalizedData.mode}
                onChange={(val) => handleDataChange('mode', val)}
            />
            
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--platform-text-secondary)', marginBottom: '0.5rem' }}>
                    {normalizedData.mode === 'single' ? 'Вибране зображення' : `Галерея (${normalizedData.items.length})`}
                </div>
                {renderGallery()}
            </div>

            {normalizedData.mode === 'single' && (
                <>
                    <SectionTitle>Посилання</SectionTitle>
                    <div style={{ marginBottom: '1rem' }}>
                        <input 
                            type="text" 
                            value={normalizedData.link} 
                            onChange={(e) => handleDataChange('link', e.target.value)} 
                            placeholder="https://..."
                            style={commonStyles.input}
                        />
                    </div>
                    {normalizedData.link && (
                        <ToggleSwitch 
                            checked={normalizedData.targetBlank} 
                            onChange={(checked) => handleDataChange('targetBlank', checked)}
                            label="Відкривати у новій вкладці"
                        />
                    )}
                </>
            )}

            {(normalizedData.mode === 'slider' || normalizedData.mode === 'grid') && (
                <>
                    <SectionTitle>{normalizedData.mode === 'slider' ? 'Слайдер' : 'Сітка'}</SectionTitle>

                    {normalizedData.mode === 'slider' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <ToggleSwitch checked={normalizedData.settings_slider.navigation} onChange={(checked) => handleSettingsChange('settings_slider', 'navigation', checked)} label="Стрілки навігації" />
                            <ToggleSwitch checked={normalizedData.settings_slider.pagination} onChange={(checked) => handleSettingsChange('settings_slider', 'pagination', checked)} label="Пагінація (крапки)" />
                            <ToggleSwitch checked={normalizedData.settings_slider.autoplay} onChange={(checked) => handleSettingsChange('settings_slider', 'autoplay', checked)} label="Автопрокрутка" />
                            <ToggleSwitch checked={normalizedData.settings_slider.loop} onChange={(checked) => handleSettingsChange('settings_slider', 'loop', checked)} label="Зациклити" />
                        </div>
                    )}

                    {normalizedData.mode === 'grid' && (
                        <CustomSelect 
                            name="grid_columns"
                            value={normalizedData.settings_grid.columns}
                            onChange={(e) => handleSettingsChange('settings_grid', 'columns', parseInt(e.target.value))}
                            options={[
                                { value: 2, label: '2 колонки' },
                                { value: 3, label: '3 колонки' },
                                { value: 4, label: '4 колонки' },
                                { value: 5, label: '5 колонок' },
                            ]}
                            style={commonStyles.input}
                        />
                    )}
                </>
            )}

            <SectionTitle>Вигляд</SectionTitle>
            
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Ширина блоку</label>
                <CustomSelect 
                    name="width"
                    value={normalizedData.width}
                    onChange={(e) => handleDataChange('width', e.target.value)}
                    options={[
                        { value: 'small', label: 'Маленька' },
                        { value: 'medium', label: 'Середня' },
                        { value: 'large', label: 'Велика' },
                        { value: 'full', label: 'На всю ширину' },
                    ]}
                    style={commonStyles.input}
                />
            </div>
            
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Заповнення (Object Fit)</label>
                <CustomSelect 
                    name="objectFit"
                    value={normalizedData.objectFit}
                    onChange={(e) => handleDataChange('objectFit', e.target.value)}
                    options={[
                        { value: 'contain', label: 'Вмістити (Contain)' },
                        { value: 'cover', label: 'Заповнити (Cover)' },
                    ]}
                    style={commonStyles.input}
                />
            </div>
            
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Радіус скруглення</label>
                <input 
                    type="text" 
                    value={normalizedData.borderRadius} 
                    onChange={(e) => handleDataChange('borderRadius', e.target.value)} 
                    placeholder="наприклад: 8px"
                    style={commonStyles.input}
                />
            </div>
        </div>
    );
};

export default ImageSettings;
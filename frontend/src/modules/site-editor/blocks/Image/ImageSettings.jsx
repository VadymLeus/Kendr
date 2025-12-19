// frontend/src/modules/site-editor/blocks/Image/ImageSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import MediaPickerModal from '../../../media/components/MediaPickerModal';
import { 
    IconPlus, IconTrash, IconImage, IconGrid, IconPlay, 
    IconCheck, IconSortDesc 
} from '../../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';
const PLACEHOLDER_URL = 'https://placehold.co/1000x500/EFEFEF/31343C?text=Select+Image';

const ToggleSwitch = ({ checked, onChange, label }) => (
    <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', padding: '0.5rem 0.2rem',
        borderBottom: '1px dashed var(--platform-border-color)'
    }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--platform-text-primary)' }}>{label}</span>
        <div style={{ position: 'relative', width: '36px', height: '20px' }}>
            <input 
                type="checkbox" checked={checked} onChange={onChange} 
                style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '20px',
                background: checked ? 'var(--platform-accent)' : 'var(--platform-border-color)',
                transition: 'background 0.2s',
            }}></div>
            <div style={{
                position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
                width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}></div>
        </div>
    </label>
);

const StyledSelect = ({ value, onChange, options, label }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <div style={{ marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>{label}</div>}
        <div style={{ position: 'relative' }}>
            <select
                value={value}
                onChange={onChange}
                style={{
                    width: '100%', appearance: 'none',
                    padding: '0.6rem 2rem 0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--platform-border-color)',
                    background: 'var(--platform-card-bg)',
                    color: 'var(--platform-text-primary)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                }}
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', color: 'var(--platform-text-secondary)'
            }}>
                <IconSortDesc size={14} />
            </div>
        </div>
    </div>
);

const ModeSwitcher = ({ value, onChange }) => {
    const modes = [
        { value: 'single', label: 'Одне', icon: <IconImage size={18} /> },
        { value: 'slider', label: 'Слайдер', icon: <IconPlay size={18} /> },
        { value: 'grid', label: 'Сітка', icon: <IconGrid size={18} /> },
    ];

    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '4px', background: 'var(--platform-bg)', borderRadius: '10px', border: '1px solid var(--platform-border-color)' }}>
                {modes.map(mode => {
                    const isActive = value === mode.value;
                    return (
                        <button
                            key={mode.value}
                            type="button"
                            onClick={() => onChange(mode.value)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                padding: '8px', border: 'none', borderRadius: '8px',
                                background: isActive ? 'var(--platform-card-bg)' : 'transparent',
                                color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                                fontWeight: isActive ? '600' : '500',
                                fontSize: '0.8rem'
                            }}
                        >
                            {mode.icon}
                            {mode.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

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
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'rgba(229, 62, 62, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    padding: 0,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const addBtnStyle = {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    border: '1px dashed var(--platform-border-color)',
    background: 'var(--platform-bg)',
    color: 'var(--platform-text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
};

const addBtnEmptyStyle = {
    ...addBtnStyle,
    gridColumn: '1 / -1',
    height: '100px',
    aspectRatio: 'auto',
    fontSize: '0.9rem',
    gap: '8px',
    borderWidth: '2px'
};

const sectionTitleStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: 'var(--platform-text-secondary)',
    letterSpacing: '0.5px',
    margin: '1.5rem 0 0.8rem 0',
    paddingBottom: '0.4rem',
    borderBottom: '1px solid var(--platform-border-color)'
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
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--platform-accent)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--platform-border-color)'; }}
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
                        {isSingle && (
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'rgba(0,0,0,0.6)', color: 'white',
                                fontSize: '10px', padding: '4px 2px', textAlign: 'center',
                                backdropFilter: 'blur(2px)'
                            }}>Натисніть для заміни</div>
                        )}
                    </div>
                ))}

                {(!isSingle || normalizedData.items.length === 0) && (
                    <button 
                        type="button"
                        style={{
                            ...(isEmpty ? addBtnEmptyStyle : addBtnStyle),
                            width: isSingle ? '140px' : undefined,
                            height: isSingle ? '140px' : undefined,
                            gridColumn: isSingle ? undefined : (isEmpty ? '1 / -1' : undefined)
                        }}
                        onClick={openAddPicker}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--platform-accent)';
                            e.currentTarget.style.color = 'var(--platform-accent)';
                            e.currentTarget.style.backgroundColor = 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                            e.currentTarget.style.color = 'var(--platform-text-secondary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
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

            <ModeSwitcher 
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
                    <div style={sectionTitleStyle}>Посилання</div>
                    <div style={{ marginBottom: '1rem' }}>
                        <input 
                            type="text" 
                            value={normalizedData.link} 
                            onChange={(e) => handleDataChange('link', e.target.value)} 
                            placeholder="https://..."
                            style={{
                                width: '100%', padding: '0.6rem',
                                border: '1px solid var(--platform-border-color)', borderRadius: '8px',
                                background: 'var(--platform-card-bg)', color: 'var(--platform-text-primary)',
                                fontSize: '0.9rem', outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    {normalizedData.link && (
                        <ToggleSwitch 
                            checked={normalizedData.targetBlank} 
                            onChange={(e) => handleDataChange('targetBlank', e.target.checked)}
                            label="Відкривати у новій вкладці"
                        />
                    )}
                </>
            )}

            {(normalizedData.mode === 'slider' || normalizedData.mode === 'grid') && (
                <>
                    <div style={sectionTitleStyle}>
                        {normalizedData.mode === 'slider' ? 'Слайдер' : 'Сітка'}
                    </div>

                    {normalizedData.mode === 'slider' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <ToggleSwitch checked={normalizedData.settings_slider.navigation} onChange={(e) => handleSettingsChange('settings_slider', 'navigation', e.target.checked)} label="Стрілки навігації" />
                            <ToggleSwitch checked={normalizedData.settings_slider.pagination} onChange={(e) => handleSettingsChange('settings_slider', 'pagination', e.target.checked)} label="Пагінація (крапки)" />
                            <ToggleSwitch checked={normalizedData.settings_slider.autoplay} onChange={(e) => handleSettingsChange('settings_slider', 'autoplay', e.target.checked)} label="Автопрокрутка" />
                            <ToggleSwitch checked={normalizedData.settings_slider.loop} onChange={(e) => handleSettingsChange('settings_slider', 'loop', e.target.checked)} label="Зациклити" />
                        </div>
                    )}

                    {normalizedData.mode === 'grid' && (
                        <StyledSelect 
                            label="Кількість колонок"
                            value={normalizedData.settings_grid.columns}
                            onChange={(e) => handleSettingsChange('settings_grid', 'columns', parseInt(e.target.value))}
                            options={[
                                { value: 2, label: '2 колонки' },
                                { value: 3, label: '3 колонки' },
                                { value: 4, label: '4 колонки' },
                                { value: 5, label: '5 колонок' },
                            ]}
                        />
                    )}
                </>
            )}

            <div style={sectionTitleStyle}>Вигляд</div>
            
            <StyledSelect 
                label="Ширина блоку"
                value={normalizedData.width}
                onChange={(e) => handleDataChange('width', e.target.value)}
                options={[
                    { value: 'small', label: 'Маленька' },
                    { value: 'medium', label: 'Середня' },
                    { value: 'large', label: 'Велика' },
                    { value: 'full', label: 'На всю ширину' },
                ]}
            />
            
            <StyledSelect 
                label="Заповнення (Object Fit)"
                value={normalizedData.objectFit}
                onChange={(e) => handleDataChange('objectFit', e.target.value)}
                options={[
                    { value: 'contain', label: 'Вмістити (Contain)' },
                    { value: 'cover', label: 'Заповнити (Cover)' },
                ]}
            />
            
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--platform-text-secondary)', marginBottom: '0.4rem' }}>Радіус скруглення</div>
                <input 
                    type="text" 
                    value={normalizedData.borderRadius} 
                    onChange={(e) => handleDataChange('borderRadius', e.target.value)} 
                    placeholder="наприклад: 8px"
                    style={{
                        width: '100%', padding: '0.6rem',
                        border: '1px solid var(--platform-border-color)', borderRadius: '8px',
                        background: 'var(--platform-card-bg)', color: 'var(--platform-text-primary)',
                        fontSize: '0.9rem', outline: 'none',
                        boxSizing: 'border-box'
                    }} 
                />
            </div>
        </div>
    );
};

export default ImageSettings;
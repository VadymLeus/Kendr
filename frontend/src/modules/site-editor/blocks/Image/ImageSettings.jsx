// frontend/src/modules/site-editor/blocks/Image/ImageSettings.jsx
import React from 'react';
import ImageInput from '../../../media/components/ImageInput';
import { generateBlockId } from '../../core/editorConfig';

const formGroupStyle = { 
    marginBottom: '0.8rem',
    padding: '0.3rem 0'
};
const labelStyle = { 
    display: 'block', 
    marginBottom: '0.3rem', 
    color: 'var(--platform-text-secondary)', 
    fontWeight: '500',
    fontSize: '0.85rem'
};
const checkboxLabelStyle = {
    ...labelStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    marginBottom: '0.4rem',
    fontSize: '0.85rem'
};
const inputStyle = { 
    width: '100%', 
    padding: '0.4rem 0.6rem', 
    border: '1px solid var(--platform-border-color)', 
    borderRadius: '4px', 
    fontSize: '0.85rem', 
    background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', 
    boxSizing: 'border-box' 
};
const hrStyle = {
    margin: '0.8rem 0',
    border: 'none',
    borderTop: '1px solid var(--platform-border-color)'
};

const compactItemStyle = {
    border: '1px solid var(--platform-border-color)',
    borderRadius: '8px',
    padding: '0.8rem',
    marginBottom: '0.6rem',
    background: 'var(--platform-bg)',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    position: 'relative'
};

const thumbnailStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '6px',
    border: '1px solid var(--platform-border-color)',
    backgroundColor: 'var(--platform-card-bg)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden'
};

const deleteButtonStyle = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'var(--platform-danger)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: 0,
    transition: 'all 0.2s ease'
};

const sectionTitleStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--platform-text-primary)',
    margin: '0.8rem 0 0.5rem 0',
    paddingBottom: '0.2rem',
    borderBottom: '1px solid var(--platform-border-color)'
};

const PLACEHOLDER_URL = 'https://placehold.co/1000x500/EFEFEF/31343C?text=Ваше+зображення';

const ImageSettings = ({ data, onChange }) => {
    const normalizedData = {
        mode: data.mode || 'single',
        items: (Array.isArray(data.items) && data.items.length > 0) 
            ? data.items 
            : [{ id: generateBlockId(), src: data.imageUrl || '' }],
        
        width: data.width || 'medium',
        settings_slider: data.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true },
        settings_grid: data.settings_grid || { columns: 3 },
        objectFit: data.objectFit || 'contain',
        borderRadius: data.borderRadius || '0px',
        link: data.link || '',
        targetBlank: data.targetBlank || false
    };

    const handleDataChange = (field, value) => {
        onChange({ ...normalizedData, [field]: value });
    };

    const handleSettingsChange = (group, field, value) => {
        onChange({
            ...normalizedData,
            [group]: {
                ...normalizedData[group],
                [field]: value
            }
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...normalizedData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...normalizedData, items: newItems });
    };

    const handleImageChange = (index, newUrl) => {
         const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
         handleItemChange(index, 'src', relativeUrl);
    };

    const handleAddItem = () => {
        const newItem = { id: generateBlockId(), src: PLACEHOLDER_URL };
        onChange({ ...normalizedData, items: [...normalizedData.items, newItem] });
    };

    const handleRemoveItem = (index) => {
        if (normalizedData.items.length <= 1 && normalizedData.mode !== 'single') {
            alert('Слайдер або сітка повинні мати хоча б одне зображення.');
            return;
        }
        if (normalizedData.mode === 'single') {
             alert('Неможливо видалити зображення в режимі "Одне зображення".');
             return;
        }
        const newItems = normalizedData.items.filter((_, i) => i !== index);
        onChange({ ...normalizedData, items: newItems });
    };
    
    const renderCompactItem = (item, index) => {
        const imageUrl = item.src ? 
            (item.src.startsWith('http') ? item.src : `http://localhost:5000${item.src}`) : 
            PLACEHOLDER_URL;

        const isPlaceholder = !item.src || item.src === PLACEHOLDER_URL;

        return (
            <div key={item.id} style={{ ...compactItemStyle, padding: '0.8rem 1rem', alignItems: 'flex-start' }}> 
                <ImageInput 
                    value={item.src}
                    onChange={(newUrl) => handleImageChange(index, newUrl)}
                    triggerStyle={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    <div style={thumbnailStyle}>
                        <img 
                            src={imageUrl} 
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: isPlaceholder ? 'contain' : 'cover',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.opacity = '0.8';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.opacity = '1';
                                e.target.style.transform = 'scale(1)';
                            }}
                        />
                    </div>
                </ImageInput>
                
                {normalizedData.items.length > 1 && (
                    <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)} 
                        style={deleteButtonStyle}
                        title="Видалити зображення"
                        onMouseOver={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                            e.target.style.background = 'var(--platform-danger-hover)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.background = 'var(--platform-danger)';
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
        );
    };

    const renderModeSwitcher = () => (
        <div style={formGroupStyle}>
            <label style={labelStyle}>Режим відображення</label>
            <select 
                value={normalizedData.mode} 
                onChange={(e) => handleDataChange('mode', e.target.value)} 
                style={inputStyle}
            >
                <option value="single">Одне зображення</option>
                <option value="slider">Слайдер</option>
                <option value="grid">Сітка</option>
            </select>
        </div>
    );

    const renderItemManager = () => (
        <div style={formGroupStyle}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0.5rem' 
            }}>
                <label style={labelStyle}>Зображення ({normalizedData.items.length})</label>
                <button 
                    type="button" 
                    onClick={handleAddItem}
                    style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        background: 'var(--platform-accent)',
                        color: 'var(--platform-accent-text)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    + Додати
                </button>
            </div>
            <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                padding: '0.2rem'
            }}>
                {normalizedData.items.map((item, index) => renderCompactItem(item, index))}
            </div>
        </div>
    );

    const renderSliderSettings = () => (
        <div style={formGroupStyle}>
            <div style={checkboxLabelStyle}>
                <input 
                    type="checkbox" 
                    checked={normalizedData.settings_slider.navigation} 
                    onChange={(e) => handleSettingsChange('settings_slider', 'navigation', e.target.checked)} 
                />
                Стрілки навігації
            </div>
            <div style={checkboxLabelStyle}>
                <input 
                    type="checkbox" 
                    checked={normalizedData.settings_slider.pagination} 
                    onChange={(e) => handleSettingsChange('settings_slider', 'pagination', e.target.checked)} 
                />
                Пагінація
            </div>
            <div style={checkboxLabelStyle}>
                <input 
                    type="checkbox" 
                    checked={normalizedData.settings_slider.autoplay} 
                    onChange={(e) => handleSettingsChange('settings_slider', 'autoplay', e.target.checked)} 
                />
                Автопрокрутка
            </div>
            <div style={checkboxLabelStyle}>
                <input 
                    type="checkbox" 
                    checked={normalizedData.settings_slider.loop} 
                    onChange={(e) => handleSettingsChange('settings_slider', 'loop', e.target.checked)} 
                />
                Зациклити
            </div>
        </div>
    );

    const renderGridSettings = () => (
        <div style={formGroupStyle}>
            <label style={labelStyle}>Кількість колонок</label>
            <select 
                value={normalizedData.settings_grid.columns} 
                onChange={(e) => handleSettingsChange('settings_grid', 'columns', parseInt(e.target.value))} 
                style={inputStyle}
            >
                <option value={2}>2 колонки</option>
                <option value={3}>3 колонки</option>
                <option value={4}>4 колонки</option>
            </select>
        </div>
    );

    const renderGlobalSettings = () => (
        <>
            <div style={sectionTitleStyle}>Загальні налаштування</div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Ширина блоку</label>
                <select 
                    value={normalizedData.width} 
                    onChange={(e) => handleDataChange('width', e.target.value)} 
                    style={inputStyle}
                >
                    <option value="small">Маленька</option>
                    <option value="medium">Середня</option>
                    <option value="large">Велика</option>
                    <option value="full">Повна</option>
                </select>
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Підгонка зображення</label>
                <select 
                    value={normalizedData.objectFit} 
                    onChange={(e) => handleDataChange('objectFit', e.target.value)} 
                    style={inputStyle}
                >
                    <option value="contain">По розміру</option>
                    <option value="cover">Заповнення</option>
                </select>
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Радіус скруглення</label>
                <input 
                    type="text" 
                    value={normalizedData.borderRadius} 
                    onChange={(e) => handleDataChange('borderRadius', e.target.value)} 
                    placeholder="наприклад: 8px"
                    style={inputStyle} 
                />
            </div>
        </>
    );

    return (
        <div style={{ padding: '0.4rem 0.3rem' }}>
            {renderModeSwitcher()}
            <hr style={hrStyle} />

            {normalizedData.mode === 'single' && (
                <>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Зображення</label>
                        {renderCompactItem(normalizedData.items[0], 0)}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Посилання</label>
                        <input 
                            type="text" 
                            value={normalizedData.link} 
                            onChange={(e) => handleDataChange('link', e.target.value)} 
                            placeholder="https://..."
                            style={inputStyle} 
                        />
                    </div>
                    
                    {normalizedData.link && (
                        <div style={formGroupStyle}>
                            <label style={checkboxLabelStyle}>
                                <input 
                                    type="checkbox" 
                                    checked={normalizedData.targetBlank} 
                                    onChange={(e) => handleDataChange('targetBlank', e.target.checked)} 
                                />
                                Відкривати у новій вкладці
                            </label>
                        </div>
                    )}
                    
                    {renderGlobalSettings()}
                </>
            )}

            {(normalizedData.mode === 'slider' || normalizedData.mode === 'grid') && (
                <>
                    {renderItemManager()}
                    <hr style={hrStyle} />
                    
                    <div style={sectionTitleStyle}>
                        {normalizedData.mode === 'slider' ? 'Налаштування слайдера' : 'Налаштування сітки'}
                    </div>

                    {normalizedData.mode === 'slider' && renderSliderSettings()}
                    {normalizedData.mode === 'grid' && renderGridSettings()}
                    
                    {renderGlobalSettings()}
                </>
            )}
        </div>
    );
};

export default ImageSettings;
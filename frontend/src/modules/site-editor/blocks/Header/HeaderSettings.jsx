// frontend/src/modules/site-editor/blocks/Header/HeaderSettings.jsx
import React from 'react';
import ImageInput from '../../../media/components/ImageInput';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, ToggleGroup, ToggleSwitch } from '../../components/common/SettingsUI';

const HeaderSettings = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleNavItemChange = (id, field, value) => {
        const newItems = data.nav_items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        handleChange('nav_items', newItems);
    };

    const addNavItem = () => {
        const newItem = { id: generateBlockId(), label: 'Нова сторінка', link: '/' };
        handleChange('nav_items', [...(data.nav_items || []), newItem]);
    };

    const removeNavItem = (id) => {
        if (window.confirm('Видалити цей пункт меню?')) {
            handleChange('nav_items', data.nav_items.filter(item => item.id !== id));
        }
    };

    const sectionStyle = { marginBottom: '1.5rem', borderBottom: '1px solid var(--platform-border-color)', paddingBottom: '1rem' };
    const navItemStyle = { 
        display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center',
        background: 'var(--platform-bg)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--platform-border-color)'
    };

    const logoSizeOptions = [
        { value: 'small', label: 'S (30px)' },
        { value: 'medium', label: 'M (50px)' },
        { value: 'large', label: 'L (80px)' },
    ];

    const navAlignOptions = [
        { value: 'left', label: '⬅️ Зліва', title: 'Зліва (відразу після лого)' },
        { value: 'center', label: '↔️ Центр', title: 'По центру' },
        { value: 'right', label: '➡️ Справа', title: 'Справа' },
    ];

    const navStyleOptions = [
        { value: 'text', label: 'Текст' },
        { value: 'button', label: 'Кнопки' },
    ];

    return (
        <div style={{ padding: '0.5rem' }}>
            <div style={sectionStyle}>
                <label style={commonStyles.label}>Логотип сайту</label>
                <ImageInput 
                    value={data.logo_src} 
                    onChange={(url) => handleChange('logo_src', url)} 
                />
                
                <div style={{ marginTop: '1rem' }}>
                    <label style={{...commonStyles.label, fontSize: '0.85rem'}}>Розмір логотипу:</label>
                    <ToggleGroup 
                        options={logoSizeOptions}
                        value={data.logo_size || 'medium'}
                        onChange={(val) => handleChange('logo_size', val)}
                    />
                </div>
            </div>

            <div style={sectionStyle}>
                <label style={commonStyles.label}>Назва сайту (текст)</label>
                <input 
                    type="text" 
                    value={data.site_title} 
                    onChange={(e) => handleChange('site_title', e.target.value)}
                    style={commonStyles.input}
                />
                <div style={{ marginTop: '0.5rem' }}>
                    <ToggleSwitch 
                        checked={data.show_title}
                        onChange={(checked) => handleChange('show_title', checked)}
                        label="Показувати назву поруч з лого"
                    />
                </div>
            </div>

            <div style={sectionStyle}>
                <label style={commonStyles.label}>Розміщення меню</label>
                <ToggleGroup 
                    options={navAlignOptions}
                    value={data.nav_alignment || 'right'}
                    onChange={(val) => handleChange('nav_alignment', val)}
                />
            </div>

            <div style={sectionStyle}>
                <label style={commonStyles.label}>Стиль пунктів меню</label>
                <ToggleGroup 
                    options={navStyleOptions}
                    value={data.nav_style || 'text'}
                    onChange={(val) => handleChange('nav_style', val)}
                />
            </div>

            <div style={sectionStyle}>
                <label style={commonStyles.label}>Пункти меню</label>
                <div style={{
                    fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginBottom: '0.8rem',
                    background: 'var(--platform-bg)', padding: '8px', borderRadius: '4px',
                    border: '1px dashed var(--platform-border-color)'
                }}>
                    <strong>Як вказувати посилання:</strong><br/>
                    • <code>/page</code> - внутрішня сторінка (напр. <code>/delivery</code>)<br/>
                    • <code>#id</code> - скрол до блоку
                </div>
                
                {data.nav_items && data.nav_items.map((item) => (
                    <div key={item.id} style={navItemStyle}>
                        <div style={{ flex: 1 }}>
                            <input 
                                type="text" 
                                value={item.label} 
                                onChange={(e) => handleNavItemChange(item.id, 'label', e.target.value)}
                                placeholder="Назва"
                                style={{ ...commonStyles.input, marginBottom: '4px' }}
                            />
                            <input 
                                type="text" 
                                value={item.link} 
                                onChange={(e) => handleNavItemChange(item.id, 'link', e.target.value)}
                                placeholder="Посилання (/page або #anchor)"
                                style={{ ...commonStyles.input, fontSize: '0.85rem' }}
                            />
                        </div>
                        <button 
                            onClick={() => removeNavItem(item.id)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                            title="Видалити"
                        >
                            ❌
                        </button>
                    </div>
                ))}
                <button 
                    onClick={addNavItem}
                    style={{ 
                        width: '100%', padding: '0.6rem', marginTop: '0.5rem', 
                        background: 'var(--platform-card-bg)', border: '1px dashed var(--platform-border-color)', 
                        cursor: 'pointer', color: 'var(--platform-text-primary)' 
                    }}
                >
                    ➕ Додати пункт меню
                </button>
            </div>
        </div>
    );
};

export default HeaderSettings;
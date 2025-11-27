// frontend/src/features/editor/settings/HeaderSettings.jsx
import React from 'react';
import ImageInput from '../../media/ImageInput';
import { generateBlockId } from '../editorConfig';

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

    const containerStyle = { padding: '0.5rem' };
    const sectionStyle = { marginBottom: '1.5rem', borderBottom: '1px solid var(--platform-border-color)', paddingBottom: '1rem' };
    const labelStyle = { display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--platform-text-primary)' };
    const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--platform-border-color)', background: 'var(--platform-bg)', color: 'var(--platform-text-primary)', boxSizing: 'border-box' };
    const checkboxRowStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', color: 'var(--platform-text-primary)' };
    
    const navItemStyle = { 
        display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center',
        background: 'var(--platform-bg)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--platform-border-color)'
    };

    const toggleButtonStyle = (isActive) => ({
        flex: 1,
        padding: '0.5rem',
        border: '1px solid var(--platform-border-color)',
        background: isActive ? 'var(--platform-accent)' : 'var(--platform-bg)',
        color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'all 0.2s',
        borderRadius: '4px',
        textAlign: 'center'
    });

    const buttonGroupStyle = {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem'
    };

    return (
        <div style={containerStyle}>
            <div style={sectionStyle}>
                <label style={labelStyle}>Логотип сайту</label>
                <ImageInput 
                    value={data.logo_src} 
                    onChange={(url) => handleChange('logo_src', url)} 
                />
                
                <div style={{ marginTop: '1rem' }}>
                    <label style={{...labelStyle, fontSize: '0.85rem'}}>Розмір логотипу:</label>
                    <div style={buttonGroupStyle}>
                        <button type="button" style={toggleButtonStyle(data.logo_size === 'small')} onClick={() => handleChange('logo_size', 'small')}>S (30px)</button>
                        <button type="button" style={toggleButtonStyle(!data.logo_size || data.logo_size === 'medium')} onClick={() => handleChange('logo_size', 'medium')}>M (50px)</button>
                        <button type="button" style={toggleButtonStyle(data.logo_size === 'large')} onClick={() => handleChange('logo_size', 'large')}>L (80px)</button>
                    </div>
                </div>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Назва сайту (текст)</label>
                <input 
                    type="text" 
                    value={data.site_title} 
                    onChange={(e) => handleChange('site_title', e.target.value)}
                    style={inputStyle}
                />
                <div style={{ marginTop: '0.5rem' }}>
                    <label style={checkboxRowStyle}>
                        <input 
                            type="checkbox" 
                            checked={data.show_title} 
                            onChange={(e) => handleChange('show_title', e.target.checked)}
                        />
                        Показувати назву поруч з лого
                    </label>
                </div>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Розміщення меню</label>
                <div style={buttonGroupStyle}>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.nav_alignment === 'left')} 
                        onClick={() => handleChange('nav_alignment', 'left')}
                        title="Зліва (відразу після лого)"
                    >
                        ⬅️ Зліва
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.nav_alignment === 'center')} 
                        onClick={() => handleChange('nav_alignment', 'center')}
                        title="По центру"
                    >
                        ↔️ Центр
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(!data.nav_alignment || data.nav_alignment === 'right')} 
                        onClick={() => handleChange('nav_alignment', 'right')}
                        title="Справа"
                    >
                        ➡️ Справа
                    </button>
                </div>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Стиль пунктів меню</label>
                <div style={buttonGroupStyle}>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(!data.nav_style || data.nav_style === 'text')} 
                        onClick={() => handleChange('nav_style', 'text')}
                    >
                        Текст (посилання)
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.nav_style === 'button')} 
                        onClick={() => handleChange('nav_style', 'button')}
                    >
                        Кнопки
                    </button>
                </div>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Пункти меню</label>
                <div style={{
                    fontSize: '0.8rem', 
                    color: 'var(--platform-text-secondary)', 
                    marginBottom: '0.8rem',
                    background: 'var(--platform-bg)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px dashed var(--platform-border-color)'
                }}>
                    <strong>Як вказувати посилання:</strong><br/>
                    • <code>/page</code> - внутрішня сторінка (напр. <code>/delivery</code>)<br/>
                    • <code>#id</code> - якір (скрол) до блоку (напр. <code>#contacts</code>)
                </div>
                
                {data.nav_items && data.nav_items.map((item) => (
                    <div key={item.id} style={navItemStyle}>
                        <div style={{ flex: 1 }}>
                            <input 
                                type="text" 
                                value={item.label} 
                                onChange={(e) => handleNavItemChange(item.id, 'label', e.target.value)}
                                placeholder="Назва"
                                style={{ ...inputStyle, marginBottom: '4px' }}
                            />
                            <input 
                                type="text" 
                                value={item.link} 
                                onChange={(e) => handleNavItemChange(item.id, 'link', e.target.value)}
                                placeholder="Посилання (/page або #anchor)"
                                style={{ ...inputStyle, fontSize: '0.85rem' }}
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
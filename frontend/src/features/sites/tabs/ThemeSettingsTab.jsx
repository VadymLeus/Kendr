// frontend/src/features/sites/tabs/ThemeSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import ImageInput from '../../../components/media/ImageInput';

const API_URL = 'http://localhost:5000';

const ThemeSettingsTab = ({ siteData }) => {
    const [themeSettings, setThemeSettings] = useState({
        font_heading: 'sans-serif',
        font_body: 'sans-serif',
        button_radius: '8px',
    });
    const [headerSettings, setHeaderSettings] = useState({
        layout: 'layout_1',
        logo_url: siteData.logo_url || '',
        menu_links: [],
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const styles = {
        card: {
            background: 'var(--platform-card-bg)', 
            padding: '1.5rem 2rem',
            borderRadius: '12px', 
            border: '1px solid var(--platform-border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            marginBottom: '1.5rem'
        },
        input: {
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid var(--platform-border-color)',
            borderRadius: '4px', 
            fontSize: '1rem', 
            background: 'var(--platform-card-bg)',
            color: 'var(--platform-text-primary)', 
            boxSizing: 'border-box',
            transition: 'all 0.2s ease'
        },
        label: {
            display: 'block', 
            marginBottom: '0.5rem', 
            color: 'var(--platform-text-primary)', 
            fontWeight: '500',
            fontSize: '0.9rem'
        },
        button: {
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        smallButton: {
            padding: '8px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        error: {
            color: 'var(--platform-danger)', 
            background: 'rgba(229, 62, 62, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
        },
        success: {
            color: 'var(--platform-success)', 
            background: 'rgba(56, 161, 105, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
        }
    };

    useEffect(() => {
        if (siteData.theme_settings) {
            setThemeSettings(siteData.theme_settings);
        }
        if (siteData.header_settings) {
            setHeaderSettings(siteData.header_settings);
        } else {
            setHeaderSettings(prev => ({ ...prev, logo_url: siteData.logo_url }));
        }
    }, [siteData]);

    const handleThemeChange = (e) => {
        const { name, value } = e.target;
        setThemeSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeaderSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (newUrl) => {
        const relativeUrl = newUrl.replace(API_URL, '');
        setHeaderSettings(prev => ({ ...prev, logo_url: relativeUrl }));
    };

    const handleLinkChange = (index, field, value) => {
        const newLinks = [...headerSettings.menu_links];
        newLinks[index][field] = value;
        setHeaderSettings(prev => ({ ...prev, menu_links: newLinks }));
    };

    const addLink = () => {
        setHeaderSettings(prev => ({
            ...prev,
            menu_links: [...prev.menu_links, { label: 'Нове Посилання', url: '/' }]
        }));
    };

    const removeLink = (index) => {
        setHeaderSettings(prev => ({
            ...prev,
            menu_links: prev.menu_links.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                theme_settings: themeSettings,
                header_settings: headerSettings,
                title: siteData.title,
                status: siteData.status,
                site_theme_mode: siteData.site_theme_mode,
                site_theme_accent: siteData.site_theme_accent
            });
            setSuccess('Налаштування збережено!');
            setTimeout(() => {
                alert('Налаштування збережено! Сторінка буде перезавантажена, щоб застосувати зміни.');
                window.location.reload();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка збереження.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <button 
                onClick={handleSave} 
                disabled={saving} 
                style={{
                    ...styles.button, 
                    width: '100%', 
                    padding: '12px 24px', 
                    background: saving ? 'var(--platform-text-secondary)' : 'var(--platform-accent)', 
                    color: 'var(--platform-accent-text)', 
                    fontSize: '16px',
                    fontWeight: '600',
                    opacity: saving ? 0.7 : 1,
                    marginBottom: '1.5rem'
                }}
            >
                {saving ? '⏳ Збереження...' : '💾 Зберегти Глобальні Налаштування'}
            </button>

            <div style={styles.card}>
                <h4 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🎨 Глобальні Стилі
                </h4>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Шрифт Заголовків</label>
                    <input 
                        type="text" 
                        name="font_heading" 
                        value={themeSettings.font_heading} 
                        onChange={handleThemeChange} 
                        style={styles.input}
                        placeholder="Наприклад: Roboto, Montserrat, sans-serif"
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                        Введіть назву шрифту або шрифтового стеку
                    </small>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Шрифт Основного Тексту</label>
                    <input 
                        type="text" 
                        name="font_body" 
                        value={themeSettings.font_body} 
                        onChange={handleThemeChange} 
                        style={styles.input}
                        placeholder="Наприклад: Lato, Open Sans, sans-serif"
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                        Введіть назву шрифту або шрифтового стеку
                    </small>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>Радіус Кнопок</label>
                    <input 
                        type="text" 
                        name="button_radius" 
                        value={themeSettings.button_radius} 
                        onChange={handleThemeChange} 
                        style={styles.input}
                        placeholder="Наприклад: 4px, 20px, 0"
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                        Введіть значення в px або %
                    </small>
                </div>
            </div>

            <div style={styles.card}>
                <h4 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🏷️ Налаштування Шапки (Header)
                </h4>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Логотип</label>
                    <ImageInput 
                        value={headerSettings.logo_url ? `${API_URL}${headerSettings.logo_url}` : ''} 
                        onChange={handleLogoChange} 
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Макет Шапки</label>
                    <select 
                        name="layout" 
                        value={headerSettings.layout} 
                        onChange={handleHeaderChange} 
                        style={styles.input}
                    >
                        <option value="layout_1">🔄 Лого зліва, меню справа</option>
                        <option value="layout_2">🔻 Лого по центру, меню знизу</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>Посилання в Меню</label>
                    {headerSettings.menu_links.length === 0 ? (
                        <p style={{ 
                            color: 'var(--platform-text-secondary)', 
                            fontStyle: 'italic',
                            padding: '1rem',
                            background: 'var(--platform-bg)',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            Ще немає посилань у меню
                        </p>
                    ) : (
                        headerSettings.menu_links.map((link, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    display: 'flex', 
                                    gap: '10px', 
                                    marginBottom: '10px', 
                                    alignItems: 'center' 
                                }}
                            >
                                <input 
                                    type="text" 
                                    placeholder="Текст (напр., Головна)" 
                                    value={link.label} 
                                    onChange={(e) => handleLinkChange(index, 'label', e.target.value)} 
                                    style={{...styles.input, flex: 2, marginBottom: 0}} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Шлях (напр., /home)" 
                                    value={link.url} 
                                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)} 
                                    style={{...styles.input, flex: 2, marginBottom: 0}} 
                                />
                                <button 
                                    onClick={() => removeLink(index)} 
                                    style={{
                                        ...styles.smallButton, 
                                        background: 'var(--platform-danger)', 
                                        color: 'white',
                                        flex: 0.5
                                    }}
                                    title="Видалити посилання"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                    <button 
                        onClick={addLink} 
                        style={{
                            ...styles.smallButton, 
                            background: 'var(--platform-card-bg)', 
                            color: 'var(--platform-text-primary)', 
                            border: '1px solid var(--platform-border-color)',
                            width: '100%',
                            marginTop: '0.5rem'
                        }}
                    >
                        + Додати посилання
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettingsTab;
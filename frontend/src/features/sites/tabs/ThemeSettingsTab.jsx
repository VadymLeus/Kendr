// frontend/src/features/sites/tabs/ThemeSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useAutoSave } from '../../../hooks/useAutoSave';
import SaveTemplateModal from '../components/SaveTemplateModal';
import apiClient from '../../../services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';
import FontPicker from '../components/FontPicker';

const PRESET_COLORS = [
    { id: 'green', color: '#48bb78', name: 'Зелений' },
    { id: 'orange', color: '#ed8936', name: 'Помаранчевий' },
    { id: 'blue', color: '#4299e1', name: 'Синій' },
    { id: 'red', color: '#f56565', name: 'Червоний' },
    { id: 'purple', color: '#9f7aea', name: 'Фіолетовий' },
    { id: 'yellow', color: '#ecc94b', name: 'Жовтий' },
    { id: 'gray', color: '#718096', name: 'Сірий' },
    { id: 'black', color: '#000000', name: 'Чорний' },
];

export const resolveAccentColor = (val) => {
    const preset = PRESET_COLORS.find(p => p.id === val);
    return preset ? preset.color : (val || '#ed8936');
};

const isLightColor = (hexColor) => {
    if (!hexColor) return false;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
};

const ThemeSettingsTab = ({ siteData, onUpdate }) => {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const { confirm } = useConfirm();
    
    const [sharedFonts, setSharedFonts] = useState([]);

    const { data, handleChange, isSaving } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            site_theme_mode: siteData.site_theme_mode || 'light',
            site_theme_accent: siteData.site_theme_accent || 'orange',
            theme_settings: siteData.theme_settings || {
                font_heading: "'Roboto Mono', monospace",
                font_body: "'Roboto Mono', monospace",
                button_radius: '8px',
            }
        }
    );

    const currentAccentHex = resolveAccentColor(data.site_theme_accent);
    const isPreset = PRESET_COLORS.some(p => p.id === data.site_theme_accent);
    const currentPreset = PRESET_COLORS.find(p => p.id === data.site_theme_accent);

    useEffect(() => {
        fetchTemplates();
        fetchSharedFonts();
    }, []);

    const fetchSharedFonts = async () => {
        try {
            const res = await apiClient.get('/media');
            const fonts = res.data.filter(f => 
                f.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(f.original_file_name)
            );
            setSharedFonts(fonts);
        } catch (error) {
            console.error("Error fetching shared fonts", error);
            toast.error('Помилка завантаження шрифтів');
        }
    };

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const res = await apiClient.get('/templates/personal');
            setTemplates(res.data);
        } catch (error) {
            console.error("Error fetching templates:", error);
            toast.error('Помилка завантаження шаблонів');
        } finally {
            setLoadingTemplates(false);
        }
    };

    const updateSetting = (key, value) => {
        handleChange(key, value);
        if (onUpdate) {
            onUpdate({ [key]: value });
        }
    };

    const handleThemeSettingChange = (key, value) => {
        const newThemeSettings = { ...data.theme_settings, [key]: value };
        updateSetting('theme_settings', newThemeSettings);
    };

    const handleColorChange = (colorValue) => {
        updateSetting('site_theme_accent', colorValue);
    };

    const handleSaveTemplate = async (name, description, overwriteId) => {
        try {
            if (overwriteId) {
                await apiClient.put(`/templates/personal/${overwriteId}`, {
                    siteId: siteData.id,
                    templateName: name,
                    description
                });
                toast.success(`Шаблон "${name}" оновлено!`);
            } else {
                await apiClient.post('/templates/personal', {
                    siteId: siteData.id,
                    templateName: name,
                    description
                });
                toast.success(`Шаблон "${name}" створено!`);
            }
            setIsTemplateModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error('Помилка збереження шаблону');
        }
    };

    const handleDeleteTemplate = async (id, name) => {
        const isConfirmed = await confirm({
            title: "Видалити шаблон?",
            message: `Ви впевнені, що хочете видалити шаблон "${name}"?`,
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/templates/personal/${id}`);
                toast.success("Шаблон видалено");
                fetchTemplates();
            } catch (error) {
                toast.error("Не вдалося видалити шаблон");
            }
        }
    };

    const handleApplyTemplate = async (template) => {
        const isConfirmed = await confirm({
            title: "Застосувати шаблон?",
            message: `Поточні налаштування теми будуть замінені на шаблон "${template.name}". Продовжити?`,
            confirmLabel: "Застосувати"
        });

        if (isConfirmed) {
            try {
                await apiClient.post(`/templates/personal/${template.id}/apply`, {
                    siteId: siteData.id
                });
                toast.success(`Шаблон "${template.name}" застосовано!`);
                window.location.reload();
            } catch (error) {
                toast.error("Помилка застосування шаблону");
            }
        }
    };

    const primaryButton = { 
        background: 'var(--platform-accent)', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        border: 'none', 
        fontWeight: '500', 
        cursor: 'pointer', 
        fontSize: '0.9rem', 
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const primaryButtonHover = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const secondaryButton = { 
        background: 'transparent', 
        border: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)', 
        padding: '8px 16px', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '0.8rem', 
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonHover = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        color: 'var(--platform-accent)'
    };

    const dangerButton = { 
        background: 'none', 
        border: '1px solid #e53e3e', 
        color: '#e53e3e', 
        padding: '8px 16px', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '0.8rem', 
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const dangerButtonHover = {
        background: '#e53e3e',
        color: 'white',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.2)'
    };

    const exampleButtonStyle = (isPrimary = true) => ({
        padding: '10px 20px', 
        background: isPrimary ? currentAccentHex : 'transparent', 
        color: isPrimary ? (isLightColor(currentAccentHex) ? '#000' : '#fff') : currentAccentHex, 
        border: isPrimary ? 'none' : `1px solid ${currentAccentHex}`, 
        borderRadius: data.theme_settings.button_radius, 
        cursor: 'pointer', 
        fontSize: '0.9rem', 
        fontWeight: '500', 
        transition: 'all 0.2s ease',
        boxShadow: isPrimary ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
    });

    const exampleButtonHover = (isPrimary = true) => ({
        transform: 'translateY(-1px)',
        boxShadow: isPrimary ? '0 2px 5px rgba(0,0,0,0.15)' : `0 2px 5px ${currentAccentHex}33`
    });

    const container = { maxWidth: '800px', margin: '0 auto', padding: '0 16px' };
    const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '16px' };
    const card = { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', padding: '32px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' };
    const cardTitle = { fontSize: '1.3rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: '0 0 8px 0' };
    const label = { display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' };
    const section = { marginBottom: '28px' };
    const templateCard = { background: 'var(--platform-bg)', border: '1px solid var(--platform-border-color)', borderRadius: '8px', padding: '16px', marginBottom: '12px', transition: 'all 0.2s ease' };
    const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--platform-border-color)', background: 'var(--platform-bg)', color: 'var(--platform-text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' };

    return (
        <div style={container}>
            <div style={header}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--platform-text-primary)' }}>Тема та Стиль</h2>
                    <p style={{ color: 'var(--platform-text-secondary)', margin: 0, fontSize: '0.9rem' }}>Налаштування зовнішнього вигляду вашого сайту</p>
                </div>
                {isSaving && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--platform-accent)', fontWeight: '500', fontSize: '0.9rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--platform-accent)', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                        Збереження...
                    </div>
                )}
            </div>

            <div style={card}>
                <h3 style={cardTitle}>Тема інтерфейсу</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px' }}>
                    <div 
                        style={{
                            border: `2px solid ${data.site_theme_mode === 'light' ? currentAccentHex : 'var(--platform-border-color)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: 'var(--platform-bg)',
                            boxShadow: data.site_theme_mode === 'light' ? `0 4px 20px ${currentAccentHex}33` : 'none'
                        }}
                        onClick={() => updateSetting('site_theme_mode', 'light')}
                        onMouseOver={(e) => {
                            if (data.site_theme_mode !== 'light') {
                                e.currentTarget.style.borderColor = currentAccentHex;
                                e.currentTarget.style.boxShadow = `0 4px 20px ${currentAccentHex}33`;
                            }
                        }}
                        onMouseOut={(e) => {
                            if (data.site_theme_mode !== 'light') {
                                e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        <div style={{ height: '120px', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '12px' }}>
                                <div style={{ height: '20px', background: currentAccentHex, borderRadius: '4px', marginBottom: '12px', opacity: 0.7 }}></div>
                                <div style={{ display: 'flex', gap: '8px', height: 'calc(100% - 32px)' }}>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.8)', borderRadius: '4px' }}></div>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.8)', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            <span style={{fontSize: '1.1rem'}}>☀️</span> Світла
                        </div>
                    </div>
                    
                    <div 
                        style={{
                            border: `2px solid ${data.site_theme_mode === 'dark' ? currentAccentHex : 'var(--platform-border-color)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: 'var(--platform-bg)',
                            boxShadow: data.site_theme_mode === 'dark' ? `0 4px 20px ${currentAccentHex}33` : 'none'
                        }}
                        onClick={() => updateSetting('site_theme_mode', 'dark')}
                        onMouseOver={(e) => {
                            if (data.site_theme_mode !== 'dark') {
                                e.currentTarget.style.borderColor = currentAccentHex;
                                e.currentTarget.style.boxShadow = `0 4px 20px ${currentAccentHex}33`;
                            }
                        }}
                        onMouseOut={(e) => {
                            if (data.site_theme_mode !== 'dark') {
                                e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        <div style={{ height: '120px', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)', padding: '12px' }}>
                                <div style={{ height: '20px', background: currentAccentHex, borderRadius: '4px', marginBottom: '12px', opacity: 0.7 }}></div>
                                <div style={{ display: 'flex', gap: '8px', height: 'calc(100% - 32px)' }}>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            <span style={{fontSize: '1.1rem'}}>🌙</span> Темна
                        </div>
                    </div>
                </div>
            </div>

            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={cardTitle}>Акцентний колір</h3>
                    <div style={{ fontSize: '0.9rem', color: currentAccentHex, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: currentAccentHex, border: '1px solid var(--platform-border-color)' }}></div>
                        {currentPreset ? currentPreset.name : 'Власний колір'}
                        {!isPreset && <span style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem'}}>({currentAccentHex})</span>}
                    </div>
                </div>
                
                <div style={section}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '8px 0', justifyContent: 'center' }}>
                        {PRESET_COLORS.map(a => (
                            <div key={a.id} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <button 
                                    onClick={() => handleColorChange(a.id)}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '8px', background: a.color,
                                        border: data.site_theme_accent === a.id ? `3px solid var(--platform-card-bg)` : '2px solid var(--platform-border-color)',
                                        boxShadow: data.site_theme_accent === a.id ? `0 0 0 2px ${a.color}` : 'none',
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        transform: data.site_theme_accent === a.id ? 'scale(1.05)' : 'scale(1)'
                                    }}
                                    title={a.name}
                                    onMouseOver={(e) => {
                                        if (data.site_theme_accent !== a.id) {
                                            e.target.style.transform = 'scale(1.1)';
                                            e.target.style.boxShadow = `0 0 0 2px ${a.color}`;
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (data.site_theme_accent !== a.id) {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = 'none';
                                        }
                                    }}
                                />
                            </div>
                        ))}
                        
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <label 
                                style={{
                                    width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer',
                                    border: !isPreset ? `3px solid var(--platform-card-bg)` : '2px dashed var(--platform-border-color)',
                                    boxShadow: !isPreset ? `0 0 0 2px ${currentAccentHex}` : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: !isPreset ? currentAccentHex : 'transparent',
                                    position: 'relative', transition: 'all 0.2s ease',
                                    transform: !isPreset ? 'scale(1.05)' : 'scale(1)'
                                }}
                                title="Власний колір"
                                onMouseOver={(e) => {
                                    if (isPreset) {
                                        e.currentTarget.style.borderColor = currentAccentHex;
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    } else {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.boxShadow = `0 0 0 2px ${currentAccentHex}`;
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (isPreset) {
                                        e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    } else {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = `0 0 0 2px ${currentAccentHex}`;
                                    }
                                }}
                            >
                                <input 
                                    type="color" 
                                    value={currentAccentHex}
                                    onChange={(e) => handleColorChange(e.target.value)} 
                                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                />
                                {!isPreset ? (
                                    <span style={{ fontSize: '14px', color: isLightColor(currentAccentHex) ? '#000' : '#fff', textShadow: isLightColor(currentAccentHex) ? 'none' : '0 1px 2px rgba(0,0,0,0.5)' }}>✎</span>
                                ) : (
                                    <span style={{ fontSize: '20px', color: 'var(--platform-text-secondary)', lineHeight: 1 }}>+</span>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--platform-bg)', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                    <button 
                        style={exampleButtonStyle(true)}
                        onMouseOver={(e) => Object.assign(e.target.style, exampleButtonHover(true))}
                        onMouseOut={(e) => Object.assign(e.target.style, exampleButtonStyle(true))}
                    >
                        Основна кнопка
                    </button>
                    <button 
                        style={exampleButtonStyle(false)}
                        onMouseOver={(e) => Object.assign(e.target.style, exampleButtonHover(false))}
                        onMouseOut={(e) => Object.assign(e.target.style, exampleButtonStyle(false))}
                    >
                        Другорядна кнопка
                    </button>
                    <div style={{ padding: '8px 12px', background: currentAccentHex + '20', color: currentAccentHex, borderRadius: data.theme_settings.button_radius, fontSize: '0.8rem', fontWeight: '500' }}>Фоновий елемент</div>
                </div>
            </div>

            <div style={card}>
                <h3 style={cardTitle}>Типографіка</h3>
                <p style={{margin: '0 0 20px 0', color: 'var(--platform-text-secondary)', fontSize: '0.9rem'}}>
                    Оберіть шрифти для заголовків та основного тексту. 
                    Ви можете використовувати Google Fonts або завантажити власні файли.
                </p>
                
                <div style={section}>
                    <FontPicker 
                        label="Шрифт заголовків"
                        value={data.theme_settings.font_heading}
                        onChange={(val) => handleThemeSettingChange('font_heading', val)}
                        type="heading"
                        externalFonts={sharedFonts}
                        onExternalChange={fetchSharedFonts}
                    />
                    
                    <div style={{ padding: '16px', background: 'var(--platform-bg)', borderRadius: '6px', border: '1px solid var(--platform-border-color)', fontFamily: data.theme_settings.font_heading, fontSize: '1.1rem', fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                        Приклад заголовку: Заголовок сторінки
                    </div>
                </div>

                <div style={section}>
                    <FontPicker 
                        label="Шрифт тексту"
                        value={data.theme_settings.font_body}
                        onChange={(val) => handleThemeSettingChange('font_body', val)}
                        type="body"
                        externalFonts={sharedFonts} 
                        onExternalChange={fetchSharedFonts} 
                    />

                    <div style={{ padding: '16px', background: 'var(--platform-bg)', borderRadius: '6px', border: '1px solid var(--platform-border-color)', fontFamily: data.theme_settings.font_body, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--platform-text-primary)' }}>
                        Приклад тексту: Основний текст сторінки - це приклад того, як буде виглядати ваший текст на сайті. Тут ви можете побачити міжрядковий інтервал, розмір шрифту та загальний вигляд.
                    </div>
                </div>

                <div style={section}>
                    <label style={label}>Радіус закруглення кнопок</label>
                    
                    <input 
                        type="text" 
                        value={data.theme_settings.button_radius}
                        onChange={(e) => handleThemeSettingChange('button_radius', e.target.value)}
                        placeholder="Наприклад: 8px або 0.5rem"
                        style={inputStyle}
                    />

                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--platform-bg)', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                        <button 
                            style={exampleButtonStyle(true)}
                            onMouseOver={(e) => Object.assign(e.target.style, exampleButtonHover(true))}
                            onMouseOut={(e) => Object.assign(e.target.style, exampleButtonStyle(true))}
                        >
                            Кнопка
                        </button>
                        <button 
                            style={exampleButtonStyle(false)}
                            onMouseOver={(e) => Object.assign(e.target.style, exampleButtonHover(false))}
                            onMouseOut={(e) => Object.assign(e.target.style, exampleButtonStyle(false))}
                        >
                            Кнопка
                        </button>
                        <div style={{ 
                            padding: '8px 12px', 
                            background: currentAccentHex + '20', 
                            color: currentAccentHex, 
                            borderRadius: data.theme_settings.button_radius, 
                            fontSize: '0.8rem', 
                            fontWeight: '500' 
                        }}>
                            Елемент
                        </div>
                    </div>
                </div>
            </div>

            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h3 style={cardTitle}>Мої шаблони</h3>
                        <p style={{ margin: 0, color: 'var(--platform-text-secondary)', fontSize: '0.9rem' }}>Зберігайте поточний дизайн як шаблон для подальшого використання</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '16px' }}>
                        <button 
                            onClick={() => setIsTemplateModalOpen(true)} 
                            style={primaryButton}
                            onMouseOver={(e) => Object.assign(e.target.style, primaryButtonHover)}
                            onMouseOut={(e) => Object.assign(e.target.style, primaryButton)}
                        >
                            Зберегти поточний шаблон
                        </button>
                    </div>
                </div>

                {loadingTemplates ? (
                    <div style={{textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)'}}>Завантаження шаблонів...</div>
                ) : templates.length > 0 ? (
                    <div>
                        {templates.map(template => (
                            <div key={template.id} style={templateCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{flex: 1}}>
                                        <div style={{ fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '1rem', marginBottom: '4px' }}>{template.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--platform-text-secondary)', lineHeight: '1.4' }}>{template.description || 'Опис відсутній'}</div>
                                    </div>
                                    <div style={{display: 'flex', gap: '8px', marginLeft: '16px'}}>
                                        <button 
                                            onClick={() => handleApplyTemplate(template)} 
                                            style={secondaryButton}
                                            onMouseOver={(e) => Object.assign(e.target.style, secondaryButtonHover)}
                                            onMouseOut={(e) => Object.assign(e.target.style, secondaryButton)}
                                        >
                                            Застосувати
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTemplate(template.id, template.name)} 
                                            style={dangerButton}
                                            onMouseOver={(e) => Object.assign(e.target.style, dangerButtonHover)}
                                            onMouseOut={(e) => Object.assign(e.target.style, dangerButton)}
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginTop: '8px' }}>
                                    <span>Створено: {new Date(template.created_at).toLocaleDateString()}</span>
                                    {template.updated_at !== template.created_at && <span>Оновлено: {new Date(template.updated_at).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--platform-text-secondary)', fontSize: '0.9rem', border: '1px dashed var(--platform-border-color)', borderRadius: '8px' }}>
                        У вас ще немає збережених шаблонів
                    </div>
                )}
            </div>

            <SaveTemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSave={handleSaveTemplate} templates={templates} />
            <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
        </div>
    );
};

export default ThemeSettingsTab;
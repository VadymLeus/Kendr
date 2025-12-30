// frontend/src/modules/site-dashboard/tabs/ThemeSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import FontPicker from '../../../site-render/components/FontPicker';
import RangeSlider from '../../../../common/components/ui/RangeSlider';
import ThemeModeSelector from '../../../../common/components/ui/ThemeModeSelector';
import AccentColorSelector from '../../../../common/components/ui/AccentColorSelector';
import { resolveAccentColor, isLightColor } from '../../../../common/utils/themeUtils';
import { 
    IconPalette, 
    IconType 
} from '../../../../common/components/ui/Icons';

const ThemeSettingsTab = ({ siteData, onUpdate }) => {
    const [themeData, setThemeData] = useState({
        site_theme_mode: siteData.site_theme_mode || 'light',
        site_theme_accent: siteData.site_theme_accent || 'orange',
        theme_settings: siteData.theme_settings || {
            font_heading: "'Roboto Mono', monospace",
            font_body: "'Roboto Mono', monospace",
            button_radius: '8px',
        }
    });

    const currentAccentHex = resolveAccentColor(themeData.site_theme_accent);

    useEffect(() => {
        setThemeData({
            site_theme_mode: siteData.site_theme_mode || 'light',
            site_theme_accent: siteData.site_theme_accent || 'orange',
            theme_settings: siteData.theme_settings || {
                font_heading: "'Roboto Mono', monospace",
                font_body: "'Roboto Mono', monospace",
                button_radius: '8px',
            }
        });
    }, [siteData]);

    const updateThemeSetting = (key, value) => {
        const newData = { ...themeData, [key]: value };
        setThemeData(newData);
        if (onUpdate) onUpdate({ [key]: value });
    };

    const updateThemeSettings = (key, value) => {
        const newThemeSettings = { ...themeData.theme_settings, [key]: value };
        const newData = { ...themeData, theme_settings: newThemeSettings };
        setThemeData(newData);
        if (onUpdate) onUpdate({ theme_settings: newThemeSettings });
    };

    const container = { maxWidth: '900px', margin: '0 auto', padding: '0 16px' };
    const header = { marginBottom: '2rem' };
    const card = { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '16px', 
        border: '1px solid var(--platform-border-color)', 
        padding: '32px', 
        marginBottom: '24px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' 
    };
    const cardTitle = { fontSize: '1.3rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' };
    const section = { marginBottom: '32px' };

    const exampleButtonStyle = (isPrimary) => ({
        minHeight: '56px',
        padding: '0 32px', 
        background: isPrimary ? currentAccentHex : 'transparent', 
        color: isPrimary ? (isLightColor(currentAccentHex) ? '#000' : '#fff') : currentAccentHex, 
        border: isPrimary ? 'none' : `1px solid ${currentAccentHex}`, 
        borderRadius: themeData.theme_settings.button_radius, 
        cursor: 'default', 
        fontSize: '1rem', 
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isPrimary ? '0 4px 10px rgba(0,0,0,0.15)' : 'none'
    });

    return (
        <div style={container}>
            <div style={header}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconPalette size={28} />
                    Тема та Стиль
                </h2>
                <p style={{ color: 'var(--platform-text-secondary)', margin: 0, fontSize: '0.9rem', paddingLeft: '38px' }}>
                    Налаштування зовнішнього вигляду вашого сайту
                </p>
            </div>

            <div style={card}>
                <div style={section}>
                    <h3 style={cardTitle}>Тема інтерфейсу</h3>
                    <ThemeModeSelector 
                        currentMode={themeData.site_theme_mode}
                        accentColor={themeData.site_theme_accent}
                        onChange={(mode) => updateThemeSetting('site_theme_mode', mode)}
                    />
                </div>

                <div style={{...section, marginBottom: 0}}>
                    <AccentColorSelector 
                        value={themeData.site_theme_accent}
                        onChange={(val) => updateThemeSetting('site_theme_accent', val)}
                        enableCustom={true}
                    />
                </div>
            </div>

            <div style={card}>
                <h3 style={cardTitle}>
                    <IconType size={22} style={{ color: 'var(--platform-accent)' }} />
                    Типографіка
                </h3>
                <p style={{margin: '0 0 24px 0', color: 'var(--platform-text-secondary)', fontSize: '0.9rem'}}>
                    Оберіть шрифти для заголовків та основного тексту.
                </p>
                
                <div style={section}>
                    <FontPicker 
                        label="Шрифт заголовків"
                        value={themeData.theme_settings.font_heading}
                        onChange={(val) => updateThemeSettings('font_heading', val)}
                        type="heading"
                    />
                </div>

                <div style={{...section, marginBottom: 0}}>
                    <FontPicker 
                        label="Шрифт тексту"
                        value={themeData.theme_settings.font_body}
                        onChange={(val) => updateThemeSettings('font_body', val)}
                        type="body"
                    />
                </div>
            </div>

            <div style={card}>
                <h3 style={cardTitle}>Стиль кнопок</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1fr', gap: '40px', alignItems: 'center' }}>
                    
                    <div>
                        <p style={{ color: 'var(--platform-text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
                            Налаштуйте радіус закруглення кнопок. 
                            <br/>
                            <span style={{fontSize: '0.8rem', opacity: 0.7}}>
                                *Примітка: для стандартних кнопок будь-яке значення вище 50% висоти зробить їх "пігулками".
                            </span>
                        </p>
                        
                        <RangeSlider 
                            label="Радіус закруглення"
                            value={themeData.theme_settings.button_radius}
                            onChange={(val) => updateThemeSettings('button_radius', val)}
                            min={0}
                            max={50}
                        />
                    </div>

                    <div style={{ 
                        padding: '24px', 
                        background: 'var(--platform-bg)', 
                        border: '1px dashed var(--platform-border-color)', 
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                    }}>
                        <div style={{ 
                            fontSize: '0.75rem', 
                            textTransform: 'uppercase', 
                            color: 'var(--platform-text-secondary)', 
                            letterSpacing: '0.1em', 
                            fontWeight: 600,
                            marginBottom: '4px'
                        }}>
                            Попередній перегляд
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                            <button style={{
                                ...exampleButtonStyle(true),
                                transition: 'all 0.2s',
                                transform: 'scale(1.05)'
                            }}>
                                Головна дія
                            </button>
                            
                            <button style={exampleButtonStyle(false)}>
                                Скасувати
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ThemeSettingsTab;
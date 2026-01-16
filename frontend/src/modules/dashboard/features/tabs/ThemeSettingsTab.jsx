// frontend/src/modules/dashboard/features/tabs/ThemeSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import FontPicker from '../../../renderer/components/FontPicker';
import ThemeModeSelector from '../../../../shared/ui/complex/ThemeModeSelector';
import AccentColorSelector from '../../../../shared/ui/complex/AccentColorSelector';
import { resolveAccentColor } from '../../../../shared/utils/themeUtils';
import { Palette, Type } from 'lucide-react';

const ThemeSettingsTab = ({ siteData, onUpdate }) => {
    const [themeData, setThemeData] = useState({
        site_theme_mode: siteData.site_theme_mode || 'light',
        site_theme_accent: siteData.site_theme_accent || 'orange',
        theme_settings: siteData.theme_settings || {
            font_heading: "'Roboto Mono', monospace",
            font_body: "'Roboto Mono', monospace",
        }
    });

    useEffect(() => {
        const newMode = siteData.site_theme_mode || 'light';
        const newAccent = siteData.site_theme_accent || 'orange';
        const newSettings = siteData.theme_settings || {};

        setThemeData(prev => {
            if (
                prev.site_theme_mode === newMode &&
                prev.site_theme_accent === newAccent &&
                JSON.stringify(prev.theme_settings) === JSON.stringify(newSettings)
            ) {
                return prev;
            }

            return {
                site_theme_mode: newMode,
                site_theme_accent: newAccent,
                theme_settings: {
                    font_heading: "'Roboto Mono', monospace",
                    font_body: "'Roboto Mono', monospace",
                    ...newSettings
                }
            };
        });
    }, [siteData]);

    const updateThemeSetting = (key, value) => {
        setThemeData(prev => ({ ...prev, [key]: value }));
        if (onUpdate) onUpdate({ [key]: value });
    };

    const updateThemeSettings = (key, value) => {
        setThemeData(prev => ({
             ...prev, 
             theme_settings: { ...prev.theme_settings, [key]: value } 
        }));
        const newSettings = { ...themeData.theme_settings, [key]: value };
        if (onUpdate) onUpdate({ theme_settings: newSettings });
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

    return (
        <div style={container}>
            <div style={header}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Palette size={28} />
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
                    <Type size={22} style={{ color: 'var(--platform-accent)' }} />
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
        </div>
    );
};

export default ThemeSettingsTab;
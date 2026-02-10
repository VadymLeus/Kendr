// frontend/src/modules/dashboard/features/settings/ThemeSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import FontPicker from '../../../renderer/components/FontPicker';
import ThemeModeSelector from '../../../../shared/ui/complex/ThemeModeSelector';
import AccentColorSelector from '../../../../shared/ui/complex/AccentColorSelector';
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

    return (
        <div className="max-w-225 mx-auto px-4">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold m-0 mb-1 text-(--platform-text-primary) flex items-center gap-2.5">
                    <Palette size={28} />
                    Тема та Стиль
                </h2>
                <p className="text-(--platform-text-secondary) m-0 text-sm pl-9.5">
                    Налаштування зовнішнього вигляду вашого сайту
                </p>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-[1.3rem] font-semibold text-(--platform-text-primary) m-0 mb-2 flex items-center gap-2.5">
                        Тема інтерфейсу
                    </h3>
                    <ThemeModeSelector 
                        currentMode={themeData.site_theme_mode}
                        accentColor={themeData.site_theme_accent}
                        onChange={(mode) => updateThemeSetting('site_theme_mode', mode)}
                    />
                </div>
                <div>
                    <AccentColorSelector 
                        value={themeData.site_theme_accent}
                        onChange={(val) => updateThemeSetting('site_theme_accent', val)}
                        enableCustom={true}
                    />
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <h3 className="text-[1.3rem] font-semibold text-(--platform-text-primary) m-0 mb-2 flex items-center gap-2.5">
                    <Type size={22} className="text-(--platform-accent)" />
                    Типографіка
                </h3>
                <p className="m-0 mb-6 text-(--platform-text-secondary) text-sm">
                    Оберіть шрифти для заголовків та основного тексту.
                </p>
                <div className="mb-8">
                    <FontPicker 
                        label="Шрифт заголовків"
                        value={themeData.theme_settings.font_heading}
                        onChange={(val) => updateThemeSettings('font_heading', val)}
                        type="heading"
                    />
                </div>
                <div>
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
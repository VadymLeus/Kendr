// frontend/src/features/sites/tabs/ThemeSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import { FONT_LIBRARY } from '../../editor/editorConfig';
import CustomSelect from '../../../components/common/CustomSelect';

const FONT_OPTIONS = FONT_LIBRARY.filter(f => f.value !== 'global');

const ThemeSettingsTab = ({ siteData }) => {
    const [themeSettings, setThemeSettings] = useState({
        font_heading: "'Inter', sans-serif",
        font_body: "'Inter', sans-serif",
        button_radius: '8px',
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
            setThemeSettings(prev => ({ ...prev, ...siteData.theme_settings }));
        }
    }, [siteData]);

    const handleThemeChange = (e) => {
        const { name, value } = e.target;
        setThemeSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                theme_settings: themeSettings,
                title: siteData.title,
                status: siteData.status,
                site_theme_mode: siteData.site_theme_mode,
                site_theme_accent: siteData.site_theme_accent
            });
            setSuccess('Налаштування збережено!');
            setTimeout(() => {
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
                    <label style={styles.label}>Шрифт Заголовків (H1-H6)</label>
                    <CustomSelect
                        name="font_heading" 
                        value={themeSettings.font_heading} 
                        onChange={handleThemeChange} 
                        options={FONT_OPTIONS}
                        style={styles.input}
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Шрифт Основного Тексту</label>
                    <CustomSelect
                        name="font_body" 
                        value={themeSettings.font_body} 
                        onChange={handleThemeChange} 
                        options={FONT_OPTIONS}
                        style={styles.input}
                    />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>Радіус Кнопок</label>
                    <input 
                        type="text" 
                        name="button_radius" 
                        value={themeSettings.button_radius} 
                        onChange={handleThemeChange} 
                        style={styles.input}
                        placeholder="Наприклад: 8px, 20px, 0"
                    />
                </div>
            </div>
        </div>
    );
};

export default ThemeSettingsTab;
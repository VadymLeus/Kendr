// frontend/src/modules/site-editor/blocks/SocialIcons/SocialIconsSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup, SectionTitle } from '../../components/common/SettingsUI';

const socialNetworks = [
    { key: 'facebook', name: 'Facebook' },
    { key: 'instagram', name: 'Instagram' },
    { key: 'telegram', name: 'Telegram' },
    { key: 'youtube', name: 'YouTube' },
    { key: 'tiktok', name: 'TikTok' }
];

const SocialIconsSettings = ({ data, onChange }) => {
    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const handleAlignmentChange = (alignment) => {
        onChange({ ...data, alignment });
    };

    const handleThemeChange = (theme_mode) => {
        onChange({ ...data, theme_mode });
    };

    const alignOptions = [
        { value: 'left', label: 'Ліво' },
        { value: 'center', label: 'Центр' },
        { value: 'right', label: 'Право' }
    ];

    const themeOptions = [
        { value: 'auto', label: '🌓 Авто' },
        { value: 'light', label: '☀️ Темні іконки' },
        { value: 'dark', label: '🌙 Світлі іконки' },
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Вирівнювання:</label>
                <ToggleGroup 
                    options={alignOptions}
                    value={data.alignment || 'left'}
                    onChange={handleAlignmentChange}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Колір іконок:</label>
                <ToggleGroup 
                    options={themeOptions}
                    value={data.theme_mode || 'auto'}
                    onChange={handleThemeChange}
                />
                <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                    Оберіть "Темні іконки" для світлого фону, "Світлі" для темного.
                </small>
            </div>

            <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            <SectionTitle>Посилання</SectionTitle>

            {socialNetworks.map(net => (
                <div style={commonStyles.formGroup} key={net.key}>
                    <label style={commonStyles.label}>{net.name} URL:</label>
                    <input
                        type="text"
                        name={net.key}
                        value={data[net.key] || ''}
                        onChange={handleChange}
                        style={commonStyles.input}
                        placeholder={`https://www.${net.key.toLowerCase()}.com/...`}
                    />
                </div>
            ))}
        </div>
    );
};

export default SocialIconsSettings;
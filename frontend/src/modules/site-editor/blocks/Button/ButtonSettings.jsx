// frontend/src/modules/site-editor/blocks/Button/ButtonSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup, ToggleSwitch } from '../../components/common/SettingsUI';

const helpTextStyle = {
    fontSize: '0.8rem',
    color: 'var(--platform-text-secondary)',
    marginTop: '0.25rem'
};

const ButtonSettings = ({ data, onChange }) => {

    const handleChange = (name, value) => {
        onChange({ ...data, [name]: value });
    };

    const alignOptions = [
        { value: 'left', label: '⬅️ Ліво' },
        { value: 'center', label: '⏺️ Центр' },
        { value: 'right', label: '➡️ Право' },
    ];

    const styleOptions = [
        { value: 'primary', label: 'Основна' },
        { value: 'secondary', label: 'Другорядна' },
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Текст кнопки:</label>
                <input 
                    type="text" 
                    value={data.text || ''} 
                    onChange={(e) => handleChange('text', e.target.value)} 
                    style={commonStyles.input} 
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Посилання (URL):</label>
                <input 
                    type="text" 
                    value={data.link || '#'} 
                    onChange={(e) => handleChange('link', e.target.value)} 
                    style={commonStyles.input} 
                    placeholder="/page або #anchor" 
                />
                <p style={helpTextStyle}>
                    💡 <strong>/page</strong> - для внутрішніх сторінок<br/>
                    ⚓ <strong>#anchor</strong> - для скролу до блоку
                </p>
            </div>

            <div style={commonStyles.formGroup}>
                <ToggleSwitch 
                    checked={data.targetBlank || false}
                    onChange={(val) => handleChange('targetBlank', val)}
                    label="Відкривати у новій вкладці"
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Стиль кнопки:</label>
                <ToggleGroup 
                    options={styleOptions}
                    value={data.styleType || 'primary'}
                    onChange={(val) => handleChange('styleType', val)}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Вирівнювання:</label>
                <ToggleGroup 
                    options={alignOptions}
                    value={data.alignment || 'center'}
                    onChange={(val) => handleChange('alignment', val)}
                />
            </div>
        </div>
    );
};

export default ButtonSettings;
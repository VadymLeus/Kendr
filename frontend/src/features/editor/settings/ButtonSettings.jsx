// frontend/src/features/editor/settings/ButtonSettings.jsx
import React from 'react';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500' 
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '1rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box' 
};

const ButtonSettings = ({ data, onChange }) => {

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({ ...data, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Текст кнопки:</label>
                <input type="text" name="text" value={data.text || ''} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Посилання (URL):</label>
                <input type="text" name="link" value={data.link || '#'} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={formGroupStyle}>
                <label style={{...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input type="checkbox" name="targetBlank" checked={data.targetBlank || false} onChange={handleChange} style={{width: 'auto'}} />
                    Відкривати у новій вкладці
                </label>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Стиль кнопки:</label>
                <select name="styleType" value={data.styleType || 'primary'} onChange={handleChange} style={inputStyle}>
                    <option value="primary">Основна (Primary)</option>
                    <option value="secondary">Другорядна (Secondary)</option>
                </select>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Вирівнювання:</label>
                <select name="alignment" value={data.alignment || 'center'} onChange={handleChange} style={inputStyle}>
                    <option value="left">По лівому краю</option>
                    <option value="center">По центру</option>
                    <option value="right">По правому краю</option>
                </select>
            </div>
        </div>
    );
};

export default ButtonSettings;
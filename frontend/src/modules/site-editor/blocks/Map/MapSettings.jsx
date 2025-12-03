// frontend/src/modules/site-editor/blocks/Map/MapSettings.jsx
import React from 'react';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500' 
};
const textareaStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '0.9rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box',
    minHeight: '150px', resize: 'vertical', fontFamily: 'monospace',
    lineHeight: '1.6'
};
const helpTextStyle = {
    color: 'var(--platform-text-secondary)',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    fontStyle: 'italic',
    lineHeight: '1.4'
};

const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '1rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box'
};

const MapSettings = ({ data, onChange }) => {

    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Вбудований код карти (iframe)</label>
                <textarea
                    name="embed_code"
                    value={data.embed_code || ''}
                    onChange={handleChange}
                    style={textareaStyle}
                    placeholder="Вставте сюди код <iframe ...> з Google Maps..."
                    rows="6"
                />
                <p style={helpTextStyle}>
                    Зайдіть на Google Maps, знайдіть місце, натисніть 'Поділитися' → 'Вбудувати карту' і скопіюйте код сюди.
                </p>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Розмір карти:</label>
                <select
                    name="sizePreset"
                    value={data.sizePreset || 'medium'}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="small">Маленька</option>
                    <option value="medium">Середня</option>
                    <option value="large">Велика</option>
                </select>
            </div>
        </div>
    );
};

export default MapSettings;
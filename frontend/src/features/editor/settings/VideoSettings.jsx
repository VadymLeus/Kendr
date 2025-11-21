// frontend/src/features/editor/settings/VideoSettings.jsx
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

const VideoSettings = ({ data, onChange }) => {

    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Посилання на YouTube / Vimeo:</label>
                <input 
                    type="text" 
                    name="url" 
                    value={data.url || ''} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    placeholder="https://www.youtube.com/watch?v=..."
                />
                <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem'}}>
                    Підтримуються посилання типу youtube.com/watch, youtu.be/ та vimeo.com/
                </small>
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Розмір відео:</label>
                <select 
                    name="sizePreset" 
                    value={data.sizePreset || 'medium'} 
                    onChange={handleChange} 
                    style={inputStyle}
                >
                    <option value="small">Маленьке</option>
                    <option value="medium">Середнє</option>
                    <option value="large">Велике (100% ширини)</option>
                </select>
                <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem'}}>
                    Оберіть бажану максимальну ширину для відображення відео.
                </small>
            </div>
        </div>
    );
};

export default VideoSettings;
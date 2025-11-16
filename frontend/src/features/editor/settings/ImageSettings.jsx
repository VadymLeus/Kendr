// frontend/src/features/editor/settings/ImageSettings.jsx
import React from 'react';
import ImageInput from '../../media/ImageInput';

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

const ImageSettings = ({ data, onChange }) => {

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({ ...data, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (newUrl) => {
        const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...data, imageUrl: relativeUrl });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Зображення:</label>
                <ImageInput 
                    value={data.imageUrl}
                    onChange={handleImageChange} 
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Alt Text (для SEO):</label>
                <input type="text" name="alt" value={data.alt || ''} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Підгонка (Object Fit):</label>
                <select name="objectFit" value={data.objectFit || 'cover'} onChange={handleChange} style={inputStyle}>
                    <option value="cover">Заповнення (Cover)</option>
                    <option value="contain">По розміру (Contain)</option>
                </select>
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Радіус скруглення (Border Radius):</label>
                <input type="text" name="borderRadius" value={data.borderRadius || '0px'} onChange={handleChange} placeholder="напр., 8px або 50%" style={inputStyle} />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Посилання (Link):</label>
                <input type="text" name="link" value={data.link || ''} onChange={handleChange} placeholder="https://..." style={inputStyle} />
            </div>

            {data.link && (
                <div style={formGroupStyle}>
                    <label style={{...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <input type="checkbox" name="targetBlank" checked={data.targetBlank || false} onChange={handleChange} style={{width: 'auto'}} />
                        Відкривати у новій вкладці
                    </label>
                </div>
            )}
        </div>
    );
};

export default ImageSettings;
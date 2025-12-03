// frontend/src/modules/site-editor/blocks/SocialIcons/SocialIconsSettings.jsx
import React from 'react';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500' 
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '0.9rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box'
};
const toggleButtonContainerStyle = {
    display: 'flex',
    borderRadius: '6px',
    border: '1px solid var(--platform-border-color)',
    overflow: 'hidden'
};
const toggleButtonStyle = (isActive) => ({
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    background: isActive ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
    color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'background 0.2s, color 0.2s'
});

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

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Вирівнювання:</label>
                <div style={toggleButtonContainerStyle}>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.alignment === 'left' || !data.alignment)} 
                        onClick={() => handleAlignmentChange('left')}
                    >
                        Ліво
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.alignment === 'center')} 
                        onClick={() => handleAlignmentChange('center')}
                    >
                        Центр
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.alignment === 'right')} 
                        onClick={() => handleAlignmentChange('right')}
                    >
                        Право
                    </button>
                </div>
            </div>

            <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            {socialNetworks.map(net => (
                <div style={formGroupStyle} key={net.key}>
                    <label style={{...labelStyle, fontSize: '0.9rem'}}>{net.name} URL:</label>
                    <input
                        type="text"
                        name={net.key}
                        value={data[net.key] || ''}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder={`https://www.${net.key.toLowerCase()}.com/...`}
                    />
                </div>
            ))}
        </div>
    );
};

export default SocialIconsSettings;
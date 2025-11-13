// frontend/src/components/editor/settings/CategoriesSettings.jsx
import React from 'react';

const CategoriesSettings = ({ data, onChange }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };
    
    const formGroupStyle = { marginBottom: '1rem' };
    
    const labelStyle = { 
        display: 'block', 
        marginBottom: '0.5rem', 
        color: 'var(--platform-text-primary)', 
        fontWeight: '500' 
    };
    
    const inputStyle = { 
        width: '100%', 
        padding: '0.75rem', 
        border: '1px solid var(--platform-border-color)', 
        borderRadius: '4px', 
        fontSize: '1rem', 
        background: 'var(--platform-card-bg)', 
        color: 'var(--platform-text-primary)' 
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок розділу категорій:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні категорії'} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                />
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Підзаголовок:</label>
                <textarea 
                    name="subtitle" 
                    value={data.subtitle || 'Оберіть те, що вам потрібно.'} 
                    onChange={handleChange} 
                    rows="2"
                    style={inputStyle}
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Максимальна кількість категорій для відображення:</label>
                <input 
                    type="number" 
                    name="limit" 
                    value={data.limit || 6} 
                    onChange={handleChange} 
                    min="1"
                    max="10"
                    style={inputStyle}
                />
            </div>
        </div>
    );
};

export default CategoriesSettings;
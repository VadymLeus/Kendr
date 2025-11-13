// frontend/src/components/editor/settings/FeaturesSettings.jsx
import React from 'react';

const FeaturesSettings = ({ data, onChange }) => {
    
    const handleTitleChange = (e) => {
        onChange({ ...data, title: e.target.value });
    };

    const handleFeatureChange = (index, e) => {
        const { name, value } = e.target;
        const newFeatures = data.items.map((feature, i) => {
            if (i === index) {
                return { ...feature, [name]: value };
            }
            return feature;
        });
        onChange({ ...data, items: newFeatures });
    };

    const handleAddFeature = () => {
        const newItems = [
            ...(data.items || []),
            { icon: '⭐', text: 'Нова особливість' }
        ];
        onChange({ ...data, items: newItems });
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = (data.items || []).filter((_, i) => i !== index);
        onChange({ ...data, items: newFeatures });
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
                <label style={labelStyle}>Заголовок розділу переваг:</label>
                <input 
                    type="text" 
                    value={data.title || 'Наші переваги'} 
                    onChange={handleTitleChange} 
                    required 
                    style={inputStyle}
                />
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--platform-text-primary)' }}>Список переваг:</h5>
            
            {(data.items || []).map((feature, index) => (
                <div key={index} style={{ border: '1px solid var(--platform-border-color)', padding: '15px', borderRadius: '6px', marginBottom: '15px', position: 'relative', background: 'var(--platform-bg)' }}>
                    
                    <div style={formGroupStyle}>
                         <label style={labelStyle}>Іконка (емодзі/символ):</label>
                        <input 
                            type="text" 
                            name="icon"
                            value={feature.icon} 
                            onChange={(e) => handleFeatureChange(index, e)} 
                            maxLength="5"
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Опис:</label>
                        <input 
                            type="text" 
                            name="text"
                            value={feature.text} 
                            onChange={(e) => handleFeatureChange(index, e)} 
                            required 
                            style={inputStyle}
                        />
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => handleRemoveFeature(index)} 
                        style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            background: 'var(--platform-danger)', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer'
                        }}
                    >
                        Видалити
                    </button>
                </div>
            ))}

            <button 
                type="button" 
                onClick={handleAddFeature} 
                style={{ 
                    width: '100%', 
                    marginBottom: '20px',
                    background: 'var(--platform-card-bg)',
                    color: 'var(--platform-text-primary)',
                    border: '1px solid var(--platform-border-color)',
                    padding: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                + Додати перевагу
            </button>
        </div>
    );
};

export default FeaturesSettings;
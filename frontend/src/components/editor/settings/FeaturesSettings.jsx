// frontend/src/components/editor/settings/FeaturesSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../editorConfig';

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
const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
};

const itemWrapperStyle = {
    border: '1px solid var(--platform-border-color)',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'var(--platform-card-bg)',
    overflow: 'hidden'
};

const itemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    background: 'var(--platform-bg)',
    borderBottom: '1px solid var(--platform-border-color)'
};

const itemHeaderTitleStyle = {
    fontWeight: '500',
    color: 'var(--platform-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const itemBodyStyle = {
    padding: '1.5rem'
};

const iconButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--platform-danger)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '4px',
    fontSize: '1.1rem',
    lineHeight: '1'
};

const iconPresetGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
    gap: '0.5rem',
    marginTop: '0.75rem'
};

const iconPresetButtonStyle = {
    ...iconButtonStyle,
    border: '1px solid var(--platform-border-color)',
    color: 'var(--platform-text-primary)',
    fontSize: '1.25rem',
    background: 'var(--platform-card-bg)',
    transition: 'background 0.2s ease'
};


const FeaturesSettings = ({ data, onChange }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const presetIcons = ['⭐', '💡', '🚀', '🛡️', '💬', '✅', '📦', '🚚', '📈', '⚙️', '🔒', '🌍'];

    const handleDataChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const handleFeatureChange = (index, field, value) => {
        const newItems = data.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        onChange({ ...data, items: newItems });
    };

    const handleAddFeature = () => {
        if (data.items && data.items.length >= 8) {
            alert("Можна додати максимум 8 переваг.");
            return;
        }
        const newItem = { 
            id: generateBlockId(), 
            icon: '⭐', 
            title: 'Нова перевага', 
            text: 'Короткий опис' 
        };
        onChange({ ...data, items: [...(data.items || []), newItem] });
        setOpenIndex((data.items || []).length);
    };

    const handleRemoveFeature = (e, index) => {
        e.stopPropagation(); 
        if (window.confirm(`Видалити перевагу "${data.items[index].title}"?`)) {
            onChange({ ...data, items: data.items.filter((_, i) => i !== index) });
            setOpenIndex(null);
        }
    };
    
    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок розділу:</label>
                <input 
                    type="text" 
                    name="title"
                    value={data.title || 'Наші переваги'} 
                    onChange={handleDataChange}
                    style={inputStyle}
                />
            </div>

            <div style={formGroupStyle}>
                <label style={labelStyle}>Кількість колонок:</label>
                <select name="columns" value={data.columns || 3} onChange={handleDataChange} style={inputStyle}>
                    <option value={1}>1 колонка</option>
                    <option value="2">2 колонки</option>
                    <option value="3">3 колонки</option>
                    <option value="4">4 колонки</option>
                </select>
            </div>

            <hr style={{margin: '2rem 0'}} />

            <label style={labelStyle}>Список переваг ({(data.items || []).length} / 8):</label>
            
            {(data.items || []).map((item, index) => (
                <div key={item.id || index} style={itemWrapperStyle}>
                    <div style={itemHeaderStyle} onClick={() => toggleItem(index)}>
                        <span style={itemHeaderTitleStyle}>
                            <span style={{fontSize: '1.2rem'}}>{item.icon}</span>
                            <span>{item.title}</span>
                        </span>

                        <button 
                            onClick={(e) => handleRemoveFeature(e, index)} 
                            style={iconButtonStyle}
                            title="Видалити"
                        >
                            ❌
                        </button>
                    </div>

                    {openIndex === index && (
                        <div style={itemBodyStyle}>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Іконка:</label>
                                <input 
                                    type="text" 
                                    value={item.icon} 
                                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)} 
                                    style={inputStyle}
                                    maxLength="5"
                                />
                                <div style={iconPresetGridStyle}>
                                    {presetIcons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            style={iconPresetButtonStyle}
                                            onClick={() => handleFeatureChange(index, 'icon', icon)}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Заголовок:</label>
                                <input 
                                    type="text" 
                                    value={item.title} 
                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} 
                                    style={inputStyle}
                                />
                            </div>
                            
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Опис:</label>
                                <textarea 
                                    value={item.text} 
                                    onChange={(e) => handleFeatureChange(index, 'text', e.target.value)} 
                                    style={textareaStyle}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button 
                type="button" 
                onClick={handleAddFeature}
                disabled={(data.items || []).length >= 8}
                style={{
                    ...inputStyle,
                    cursor: (data.items || []).length >= 8 ? 'not-allowed' : 'pointer',
                    background: 'var(--platform-accent)',
                    color: 'var(--platform-accent-text)',
                    textAlign: 'center',
                    fontWeight: 500,
                    opacity: (data.items || []).length >= 8 ? 0.7 : 1
                }}
            >
                + Додати перевагу
            </button>
        </div>
    );
};

export default FeaturesSettings;

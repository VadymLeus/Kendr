// frontend/src/features/editor/settings/CategoriesSettings.jsx
import React from 'react';
import ImageInput from '../../media/ImageInput';
import { generateBlockId } from '../editorConfig';

const API_URL = 'http://localhost:5000';

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
    background: 'var(--platform-bg)',
    borderBottom: '1px solid var(--platform-border-color)'
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

const CategoriesSettings = ({ data, onChange }) => {
    
    const { columns = 3, items = [] } = data;

    const handleDataChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...data, items: newItems });
    };

    const handleItemImageChange = (index, fullUrl) => {
        const relativeUrl = fullUrl.startsWith(API_URL)
            ? fullUrl.substring(API_URL.length)
            : fullUrl;
            
        const newItems = [...items];
        newItems[index] = { ...newItems[index], image: relativeUrl };
        onChange({ ...data, items: newItems });
    };

    const handleAddItem = () => {
        const newItem = {
            id: generateBlockId(),
            image: '',
            title: 'Новий елемент',
            link: ''
        };
        onChange({ ...data, items: [...items, newItem] });
    };

    const handleRemoveItem = (index) => {
        if (window.confirm(`Видалити елемент "${items[index].title}"?`)) {
            const newItems = items.filter((_, i) => i !== index);
            onChange({ ...data, items: newItems });
        }
    };
    
    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Кількість колонок:</label>
                <select name="columns" value={columns} onChange={handleDataChange} style={inputStyle}>
                    <option value={2}>2 колонки</option>
                    <option value={3}>3 колонки</option>
                    <option value={4}>4 колонки</option>
                </select>
            </div>

            <hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid var(--platform-border-color)'}} />

            <label style={labelStyle}>Елементи вітрини:</label>
            
            {items.length === 0 && (
                <p style={{
                    color: 'var(--platform-text-secondary)',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    padding: '1rem',
                    background: 'var(--platform-bg)',
                    borderRadius: '4px'
                }}>
                    Блок порожній. Почніть з додавання елементів вітрини.
                </p>
            )}

            {items.map((item, index) => (
                <div key={item.id || index} style={itemWrapperStyle}>
                    <div style={itemHeaderStyle}>
                        <span style={{fontWeight: '500', color: 'var(--platform-text-primary)'}}>
                            {item.title || 'Новий елемент'}
                        </span>
                        <button 
                            onClick={() => handleRemoveItem(index)} 
                            style={iconButtonStyle}
                            title="Видалити"
                        >
                            ❌
                        </button>
                    </div>
                    <div style={itemBodyStyle}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Зображення:</label>
                            <ImageInput 
                                value={item.image}
                                onChange={(newUrl) => handleItemImageChange(index, newUrl)}
                            />
                        </div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Заголовок:</label>
                            <input 
                                type="text" 
                                value={item.title} 
                                onChange={(e) => handleItemChange(index, 'title', e.target.value)} 
                                style={inputStyle}
                            />
                        </div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Посилання (URL):</label>
                            <input 
                                type="text" 
                                value={item.link} 
                                onChange={(e) => handleItemChange(index, 'link', e.target.value)} 
                                style={inputStyle}
                                placeholder="/site/my-site/page-slug"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button 
                type="button" 
                onClick={handleAddItem}
                style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    background: 'var(--platform-accent)',
                    color: 'var(--platform-accent-text)',
                    textAlign: 'center',
                    fontWeight: 500
                }}
            >
                ➕ Додати елемент вітрини
            </button>
        </div>
    );
};

export default CategoriesSettings;
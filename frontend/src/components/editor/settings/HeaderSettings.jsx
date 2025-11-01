// frontend/src/components/editor/settings/HeaderSettings.jsx
import React, { useState } from 'react';

const HeaderSettings = ({ initialData, onSave, onClose }) => {
    const [data, setData] = useState(initialData);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };
    
    const handleLinkChange = (index, field, value) => {
        const newLinks = data.links.map((link, i) => {
            if (i === index) {
                return { ...link, [field]: value };
            }
            return link;
        });
        setData(prev => ({ ...prev, links: newLinks }));
    };

    const handleAddLink = () => {
        setData(prev => ({
            ...prev,
            links: [
                ...prev.links,
                { label: 'Нове Посилання', url: '/new-page' }
            ]
        }));
    };

    const handleRemoveLink = (index) => {
        const newLinks = data.links.filter((_, i) => i !== index);
        setData(prev => ({ ...prev, links: newLinks }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <form onSubmit={handleSave}>
            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="checkbox" 
                        name="sticky" 
                        checked={data.sticky || false} 
                        onChange={handleChange} 
                    />
                    Фіксувати шапку при прокручуванні (Sticky Header)
                </label>
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Пункти меню:</h5>

            {data.links.map((link, index) => (
                <div key={index} style={{ border: '1px solid var(--platform-border-color)', padding: '15px', borderRadius: '6px', marginBottom: '15px', position: 'relative' }}>
                    <div className="form-group">
                        <label>Текст посилання:</label>
                        <input 
                            type="text" 
                            value={link.label} 
                            onChange={(e) => handleLinkChange(index, 'label', e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>URL (шлях):</label>
                        <input 
                            type="text" 
                            value={link.url} 
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => handleRemoveLink(index)} 
                        className="btn btn-sm btn-danger"
                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                    >
                        Видалити
                    </button>
                </div>
            ))}
            
            <button type="button" onClick={handleAddLink} className="btn btn-secondary" style={{ width: '100%', marginBottom: '20px' }}>
                + Додати пункт меню
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default HeaderSettings;
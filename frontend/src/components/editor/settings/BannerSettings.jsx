// frontend/src/components/editor/settings/BannerSettings.jsx
import React, { useState } from 'react';

const BannerSettings = ({ initialData, onSave, onClose }) => {
    const [data, setData] = useState(initialData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <form onSubmit={handleSave}>
            <div className="form-group">
                <label>Заголовок:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || ''} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Підзаголовок:</label>
                <textarea 
                    name="subtitle" 
                    value={data.subtitle || ''} 
                    onChange={handleChange} 
                    rows="2"
                />
            </div>

            <div className="form-group">
                <label>Текст кнопки:</label>
                <input 
                    type="text" 
                    name="buttonText" 
                    value={data.buttonText || ''} 
                    onChange={handleChange} 
                />
            </div>
            
            <div className="form-group">
                <label>URL зображення:</label>
                <input 
                    type="text" 
                    name="imageUrl" 
                    value={data.imageUrl || ''} 
                    onChange={handleChange} 
                />
                {data.imageUrl && (
                    <img 
                        src={data.imageUrl} 
                        alt="Перегляд банера" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '150px', 
                            marginTop: '10px', 
                            objectFit: 'cover', 
                            borderRadius: '4px' 
                        }}
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/300x150/AAAAAA/FFFFFF?text=Немає+фото"; 
                        }}
                    />
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default BannerSettings;
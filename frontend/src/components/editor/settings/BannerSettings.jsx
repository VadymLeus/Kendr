// frontend/src/components/editor/settings/BannerSettings.jsx
import React, { useState } from 'react';
import ImageInput from '../../media/ImageInput';

const BannerSettings = ({ initialData, onSave, onClose }) => {
    const [data, setData] = useState(initialData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (newUrl) => {
        // Видаляємо префікс API_URL, щоб зберегти відносний шлях у БД
        const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
        setData(prev => ({ ...prev, imageUrl: relativeUrl }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Посилання (куди веде банер):</label>
                <input 
                    type="text" 
                    name="link" 
                    value={data.link || '#'} 
                    onChange={handleChange} 
                />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                 <ImageInput 
                    value={data.imageUrl} 
                    onChange={handleImageChange} 
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default BannerSettings;
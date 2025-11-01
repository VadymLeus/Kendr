// frontend/src/components/editor/settings/CategoriesSettings.jsx
import React, { useState } from 'react';

const CategoriesSettings = ({ initialData, onSave, onClose }) => {
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
                <label>Заголовок секції категорій:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні Категорії'} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Підзаголовок:</label>
                <textarea 
                    name="subtitle" 
                    value={data.subtitle || 'Оберіть, що вам потрібно.'} 
                    onChange={handleChange} 
                    rows="2"
                />
            </div>

            <div className="form-group">
                <label>Максимальна кількість категорій для відображення:</label>
                <input 
                    type="number" 
                    name="limit" 
                    value={data.limit || 6} 
                    onChange={handleChange} 
                    min="1"
                    max="10"
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default CategoriesSettings;
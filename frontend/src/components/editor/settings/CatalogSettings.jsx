// frontend/src/components/editor/settings/CatalogSettings.jsx
import React, { useState } from 'react';

const CatalogSettings = ({ initialData, onSave, onClose }) => {
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
                <label>Заголовок секції товарів:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні Товари'} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Максимальна кількість товарів для відображення:</label>
                <input 
                    type="number" 
                    name="limit" 
                    value={data.limit || 8} 
                    onChange={handleChange} 
                    min="1"
                    max="20"
                />
            </div>

            <p className="text-info" style={{ marginTop: '15px' }}>
                Для додавання, редагування або видалення самих товарів перейдіть на вкладку 
                **"Товари та Категорії"** в меню управління сайтом.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default CatalogSettings;
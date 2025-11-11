// frontend/src/components/editor/settings/CategoriesSettings.jsx
import React from 'react';

const CategoriesSettings = ({ data, onChange }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };
    
    return (
        <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Заголовок розділу категорій:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні категорії'} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Підзаголовок:</label>
                <textarea 
                    name="subtitle" 
                    value={data.subtitle || 'Оберіть те, що вам потрібно.'} 
                    onChange={handleChange} 
                    rows="2"
                />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
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
        </div>
    );
};

export default CategoriesSettings;
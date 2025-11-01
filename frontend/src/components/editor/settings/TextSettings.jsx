// frontend/src/components/editor/settings/TextSettings.jsx
import React, { useState } from 'react';

const TextSettings = ({ initialData, onSave, onClose }) => {
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
                <label>Текст блоку:</label>
                <textarea 
                    name="content" 
                    value={data.content || ''} 
                    onChange={handleChange} 
                    rows="5"
                    required 
                />
            </div>

            <div className="form-group">
                <label>Розмір шрифту:</label>
                <select 
                    name="size" 
                    value={data.size || 'md'} 
                    onChange={handleChange}
                >
                    <option value="sm">Маленький</option>
                    <option value="md">Середній</option>
                    <option value="lg">Великий</option>
                    <option value="xl">Дуже великий</option>
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default TextSettings;
// frontend/src/components/editor/settings/FeaturesSettings.jsx
import React, { useState } from 'react';

const FeaturesSettings = ({ initialData, onSave, onClose }) => {
    const [data, setData] = useState(initialData);

    const handleTitleChange = (e) => {
        setData(prev => ({ ...prev, title: e.target.value }));
    };

    const handleFeatureChange = (index, e) => {
        const { name, value } = e.target;
        const newFeatures = data.features.map((feature, i) => {
            if (i === index) {
                return { ...feature, [name]: value };
            }
            return feature;
        });
        setData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleAddFeature = () => {
        setData(prev => ({
            ...prev,
            features: [
                ...prev.features,
                { icon: '⭐', name: 'Нова фіча', description: 'Короткий опис нової фічі.' }
            ]
        }));
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = data.features.filter((_, i) => i !== index);
        setData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <form onSubmit={handleSave}>
            <div className="form-group">
                <label>Заголовок секції переваг:</label>
                <input 
                    type="text" 
                    value={data.title || 'Наші Переваги'} 
                    onChange={handleTitleChange} 
                    required 
                />
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Список переваг:</h5>
            
            {data.features.map((feature, index) => (
                <div key={index} style={{ border: '1px solid var(--platform-border-color)', padding: '15px', borderRadius: '6px', marginBottom: '15px', position: 'relative' }}>
                    
                    <div className="form-group">
                        <label>Іконка (Emoji/Символ):</label>
                        <input 
                            type="text" 
                            name="icon" 
                            value={feature.icon} 
                            onChange={(e) => handleFeatureChange(index, e)} 
                            maxLength="5"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Назва:</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={feature.name} 
                            onChange={(e) => handleFeatureChange(index, e)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Опис:</label>
                        <textarea 
                            name="description" 
                            value={feature.description} 
                            onChange={(e) => handleFeatureChange(index, e)} 
                            rows="2"
                        />
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => handleRemoveFeature(index)} 
                        className="btn btn-sm btn-danger"
                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                    >
                        Видалити
                    </button>
                </div>
            ))}

            <button type="button" onClick={handleAddFeature} className="btn btn-secondary" style={{ width: '100%', marginBottom: '20px' }}>
                + Додати перевагу
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default FeaturesSettings;
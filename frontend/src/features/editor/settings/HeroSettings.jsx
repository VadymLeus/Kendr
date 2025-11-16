// frontend/src/features/editor/settings/HeroSettings.jsx
import React from 'react';
import ImageInput from '../../media/ImageInput';

const HeroSettings = ({ data, onChange }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const handleImageChange = (newUrl) => {
        const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...data, imageUrl: relativeUrl });
    };

    return (
        <div> 
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Заголовок:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || ''}
                    onChange={handleChange}
                    placeholder="Заголовок обкладинки"
                />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Підзаголовок:</label>
                <textarea 
                    name="subtitle" 
                    value={data.subtitle || ''}
                    onChange={handleChange}
                    placeholder="Короткий опис"
                    rows="3"
                />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Текст кнопки:</label>
                <input 
                    type="text" 
                    name="buttonText" 
                    value={data.buttonText || ''}
                    onChange={handleChange}
                    placeholder="Текст кнопки"
                />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Посилання кнопки:</label>
                <input 
                    type="text" 
                    name="buttonLink" 
                    value={data.buttonLink || ''}
                    onChange={handleChange}
                    placeholder="/каталог"
                />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <ImageInput 
                    value={data.imageUrl}
                    onChange={handleImageChange} 
                />
            </div>
        </div>
    );
};

export default HeroSettings;
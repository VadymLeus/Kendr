// frontend/src/components/editor/settings/BannerSettings.jsx
import React from 'react';
import ImageInput from '../../media/ImageInput';

const BannerSettings = ({ data, onChange }) => {
    
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
        </div>
    );
};

export default BannerSettings;
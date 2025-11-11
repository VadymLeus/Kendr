// frontend/src/components/editor/settings/TextSettings.jsx
import React from 'react';

const TextSettings = ({ data, onChange }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Заголовок блоку:</label>
                <input 
                    type="text" 
                    name="headerTitle" 
                    value={data.headerTitle || ''} 
                    onChange={handleChange} 
                    placeholder="Заголовок текстового блоку"
                />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Текст блоку:</label>
                <textarea 
                    name="aboutText" 
                    value={data.aboutText || ''} 
                    onChange={handleChange} 
                    rows="8"
                    placeholder="Введіть основний текст тут..."
                />
            </div>
        </div>
    );
};

export default TextSettings;
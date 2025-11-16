// frontend/src/features/editor/settings/FooterSettings.jsx
import React, { useState } from 'react';

const FooterSettings = ({ initialData, onSave, onClose }) => {
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
                <label>Основний текст (наприклад, копірайт):</label>
                <input 
                    type="text" 
                    name="copyright" 
                    value={data.copyright || `© ${new Date().getFullYear()} Ваш Сайт. Всі права захищені.`} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Посилання на політику конфіденційності:</label>
                <input 
                    type="url" 
                    name="privacyLink" 
                    value={data.privacyLink || '#'} 
                    onChange={handleChange} 
                />
            </div>

            <div className="form-group">
                <label>Посилання на умови використання:</label>
                <input 
                    type="url" 
                    name="termsLink" 
                    value={data.termsLink || '#'} 
                    onChange={handleChange} 
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
                <button type="submit" className="btn btn-primary">Зберегти</button>
            </div>
        </form>
    );
};

export default FooterSettings;
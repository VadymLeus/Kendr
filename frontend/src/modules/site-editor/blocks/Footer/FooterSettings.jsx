// frontend/src/modules/site-editor/blocks/Footer/FooterSettings.jsx
import React, { useState } from 'react';
import { commonStyles } from '../../components/common/SettingsUI';

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
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Основний текст (наприклад, копірайт):</label>
                <input 
                    type="text" 
                    name="copyright" 
                    value={data.copyright || `© ${new Date().getFullYear()} Ваш Сайт. Всі права захищені.`} 
                    onChange={handleChange} 
                    required 
                    style={commonStyles.input}
                />
            </div>
            
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Посилання на політику конфіденційності:</label>
                <input 
                    type="url" 
                    name="privacyLink" 
                    value={data.privacyLink || '#'} 
                    onChange={handleChange} 
                    style={commonStyles.input}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Посилання на умови використання:</label>
                <input 
                    type="url" 
                    name="termsLink" 
                    value={data.termsLink || '#'} 
                    onChange={handleChange} 
                    style={commonStyles.input}
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
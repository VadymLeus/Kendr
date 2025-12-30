// frontend/src/modules/site-editor/blocks/Form/FormSettings.jsx
import React from 'react';
import { commonStyles } from '../../components/common/SettingsUI';

const FormSettings = ({ data, onChange }) => {
    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Текст кнопки:</label>
                <input 
                    type="text" 
                    name="buttonText" 
                    value={data.buttonText || ''} 
                    onChange={handleChange} 
                    style={commonStyles.input} 
                />
            </div>
            
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Повідомлення про успіх:</label>
                <textarea 
                    name="successMessage" 
                    value={data.successMessage || ''} 
                    onChange={handleChange}
                    style={{
                        ...commonStyles.textarea, 
                        minHeight: '100px',
                        resize: 'vertical'
                    }}
                    rows="4"
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Email для сповіщень (необов'язково):</label>
                <input 
                    type="email" 
                    name="notifyEmail" 
                    value={data.notifyEmail || ''} 
                    onChange={handleChange} 
                    style={commonStyles.input} 
                />
                <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block'}}>
                    Якщо залишити порожнім, сповіщення надходитимуть на email вашого акаунту.
                </small>
            </div>
        </div>
    );
};

export default FormSettings;
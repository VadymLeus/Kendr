// frontend/src/features/editor/settings/FormSettings.jsx
import React, { useRef, useEffect } from 'react';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500' 
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '1rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box',
    resize: 'none'
};

const FormSettings = ({ data, onChange }) => {
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        autoResizeTextarea();
    }, [data.successMessage]);

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Текст кнопки:</label>
                <input type="text" name="buttonText" value={data.buttonText || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Повідомлення про успіх:</label>
                <textarea 
                    ref={textareaRef}
                    name="successMessage" 
                    value={data.successMessage || ''} 
                    onChange={handleChange}
                    style={{
                        ...inputStyle, 
                        minHeight: '80px',
                        overflow: 'hidden'
                    }}
                    onInput={autoResizeTextarea}
                />
            </div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Email для сповіщень (необов'язково):</label>
                <input type="email" name="notifyEmail" value={data.notifyEmail || ''} onChange={handleChange} style={inputStyle} />
                <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem'}}>Якщо залишити порожнім, сповіщення надходитимуть на email вашого акаунту.</small>
            </div>
        </div>
    );
};
export default FormSettings;
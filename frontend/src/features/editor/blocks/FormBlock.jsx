// frontend/src/features/editor/blocks/FormBlock.jsx
import React, { useState } from 'react';
import apiClient from '../../services/api';

const FormBlock = ({ blockData, siteData, isEditorPreview }) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });
    
    const { buttonText, successMessage } = blockData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditorPreview) return; 

        setStatus({ loading: true, error: '', success: '' });
        try {
            await apiClient.post(`/public/form/${siteData.id}/submit`, formData);
            
            alert(successMessage || 'Дякуємо! Ваше повідомлення надіслано.');
            setStatus({ loading: false, error: '', success: '' });
            setFormData({ name: '', email: '', subject: '', message: '' });

        } catch (err) {
            setStatus({ loading: false, error: err.response?.data?.message || 'Помилка відправки.', success: '' });
        }
    };

    const bg = isEditorPreview ? 'var(--platform-bg)' : 'var(--site-bg)';
    const cardBg = isEditorPreview ? 'var(--platform-card-bg)' : 'var(--site-card-bg)';
    const borderColor = isEditorPreview ? 'var(--platform-border-color)' : 'var(--site-border-color)';
    const textPrimary = isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    const accent = isEditorPreview ? 'var(--platform-accent)' : 'var(--site-accent)';
    const accentText = isEditorPreview ? 'var(--platform-accent-text)' : 'var(--site-accent-text)';
    const accentHover = isEditorPreview ? 'var(--platform-accent-hover)' : 'var(--site-accent-hover)';
    const danger = isEditorPreview ? 'var(--platform-danger)' : 'var(--site-danger)';

    const inputStyle = {
        width: '100%', 
        padding: '0.75rem', 
        border: `1px solid ${borderColor}`,
        borderRadius: '4px', 
        background: cardBg,
        color: textPrimary, 
        marginBottom: '1rem', 
        boxSizing: 'border-box',
        fontSize: '14px',
        transition: 'border-color 0.2s ease'
    };

    const buttonStyle = {
        padding: '12px 24px',
        backgroundColor: accent,
        color: accentText,
        border: 'none',
        borderRadius: '4px',
        cursor: isEditorPreview ? 'default' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
        opacity: isEditorPreview ? 0.7 : 1
    };

    const errorStyle = {
        padding: '1rem', 
        border: `1px solid ${danger}`, 
        background: 'rgba(229, 62, 62, 0.1)', 
        color: danger, 
        borderRadius: '4px', 
        marginBottom: '1rem',
        textAlign: 'center'
    };

    return (
        <div style={{ 
            padding: '20px', 
            background: isEditorPreview ? cardBg : 'transparent',
            maxWidth: '600px',
            margin: '0 auto',
            borderRadius: isEditorPreview ? '8px' : '0',
            border: isEditorPreview ? `1px solid ${borderColor}` : 'none'
        }}>
            <form onSubmit={handleSubmit}>
                {status.error && (
                    <div style={errorStyle}>
                        {status.error}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Ваше ім'я*" 
                        required 
                        style={{ 
                            ...inputStyle, 
                            marginBottom: 0, 
                            flex: 1 
                        }}
                        onFocus={(e) => e.target.style.borderColor = accent}
                        onBlur={(e) => e.target.style.borderColor = borderColor}
                    />
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Ваш Email*" 
                        required 
                        style={{ 
                            ...inputStyle, 
                            marginBottom: 0, 
                            flex: 1 
                        }}
                        onFocus={(e) => e.target.style.borderColor = accent}
                        onBlur={(e) => e.target.style.borderColor = borderColor}
                    />
                </div>
                <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="Тема (необов'язково)" 
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = accent}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                />
                <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Ваше повідомлення*" 
                    required 
                    style={{ 
                        ...inputStyle, 
                        minHeight: '150px', 
                        resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = accent}
                    onBlur={(e) => e.target.style.borderColor = borderColor}
                />
                
                <div style={{ textAlign: 'center' }}> 
                    <button 
                        type="submit" 
                        disabled={status.loading || isEditorPreview}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.backgroundColor = accentHover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.backgroundColor = accent;
                            }
                        }}
                    >
                        {status.loading ? 'Відправка...' : (buttonText || 'Надіслати')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormBlock;
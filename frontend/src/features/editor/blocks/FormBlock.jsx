// frontend/src/features/editor/blocks/FormBlock.jsx
import React, { useState } from 'react';
import apiClient from '../../../services/api';
import { toast } from 'react-toastify';

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
            toast.success(successMessage || 'Дякуємо! Ваше повідомлення надіслано.');
            
            setStatus({ loading: false, error: '', success: '' });
            setFormData({ name: '', email: '', subject: '', message: '' });

        } catch (err) {
            setStatus({ loading: false, error: err.response?.data?.message || 'Помилка відправки.', success: '' });
        }
    };

    const inputStyle = {
        width: '100%', 
        padding: '0.75rem', 
        
        background: 'var(--site-card-bg)', 
        border: '1px solid var(--site-border-color)',
        color: 'var(--site-text-primary)',
        
        borderRadius: '4px', 
        marginBottom: '1rem', 
        boxSizing: 'border-box',
        fontSize: '14px',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s ease'
    };

    const buttonStyle = {
        padding: '12px 24px',
        backgroundColor: 'var(--site-accent)',
        color: 'var(--site-accent-text)',
        border: 'none',
        borderRadius: 'var(--btn-radius, 4px)',
        cursor: isEditorPreview ? 'default' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        opacity: isEditorPreview ? 0.8 : 1,
        transition: 'background-color 0.2s ease'
    };

    const errorStyle = {
        padding: '1rem', 
        border: '1px solid var(--site-danger)', 
        background: 'rgba(229, 62, 62, 0.1)', 
        color: 'var(--site-danger)', 
        borderRadius: '4px', 
        marginBottom: '1rem',
        textAlign: 'center'
    };

    const containerStyle = { 
        padding: '30px', 
        background: isEditorPreview ? 'var(--site-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        maxWidth: '600px',
        margin: '0 auto',
        borderRadius: '8px'
    };

    return (
        <div style={containerStyle}>
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
                        onFocus={(e) => e.target.style.borderColor = 'var(--site-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--site-border-color)'}
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
                        onFocus={(e) => e.target.style.borderColor = 'var(--site-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--site-border-color)'}
                    />
                </div>
                <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="Тема (необов'язково)" 
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--site-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--site-border-color)'}
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
                    onFocus={(e) => e.target.style.borderColor = 'var(--site-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--site-border-color)'}
                />
                
                <div style={{ textAlign: 'center' }}> 
                    <button 
                        type="submit" 
                        disabled={status.loading || isEditorPreview}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.backgroundColor = 'var(--site-accent-hover)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.backgroundColor = 'var(--site-accent)';
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
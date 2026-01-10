// frontend/src/modules/site-editor/blocks/Form/FormBlock.jsx
import React, { useState } from 'react';
import apiClient from '../../api';
import { toast } from 'react-toastify';
import { IconSend } from '../../../../common/components/ui/Icons'; 

const FormBlock = ({ blockData, siteData, isEditorPreview, style }) => {
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

    const containerStyle = { 
        padding: '30px', 
        background: isEditorPreview ? 'var(--site-card-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        maxWidth: '600px',
        margin: '0 auto',
        borderRadius: '8px',
        ...style
    };

    const inputStyle = {
        width: '100%', 
        padding: '12px 16px', 
        background: 'var(--site-bg)', 
        border: '1px solid var(--site-border-color)',
        color: 'var(--site-text-primary)',
        borderRadius: '6px', 
        marginBottom: '1rem', 
        boxSizing: 'border-box',
        fontSize: '1rem',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none'
    };

    const buttonStyle = {
        padding: '12px 32px',
        backgroundColor: 'var(--site-accent)',
        color: 'var(--site-accent-text)',
        border: 'none',
        borderRadius: 'var(--btn-radius, 6px)',
        cursor: isEditorPreview ? 'default' : 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        opacity: (isEditorPreview || status.loading) ? 0.7 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px'
    };

    const errorStyle = {
        padding: '12px', 
        border: '1px solid var(--site-danger)', 
        background: 'rgba(229, 62, 62, 0.1)', 
        color: 'var(--site-danger)', 
        borderRadius: '6px', 
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        textAlign: 'center'
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = 'var(--site-accent)';
        e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.05)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = 'var(--site-border-color)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit}>
                {status.error && (
                    <div style={errorStyle}>
                        {status.error}
                    </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Ваше ім'я*" 
                        required 
                        style={{ ...inputStyle, marginBottom: 0 }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Ваш Email*" 
                        required 
                        style={{ ...inputStyle, marginBottom: 0 }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </div>

                <input 
                    type="text" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="Тема (необов'язково)" 
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                
                <div style={{ textAlign: 'center' }}> 
                    <button 
                        type="submit" 
                        disabled={status.loading || isEditorPreview}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }
                        }}
                    >
                        <span>{status.loading ? 'Відправка...' : (buttonText || 'Надіслати')}</span>
                        {!status.loading && <IconSend size={16} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormBlock;
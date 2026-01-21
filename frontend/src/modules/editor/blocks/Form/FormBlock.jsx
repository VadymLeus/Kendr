// frontend/src/modules/editor/blocks/Form/FormBlock.jsx
import React, { useState } from 'react';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { Send, ArrowRight, ShoppingCart, Mail, Phone, Check, Star, MousePointer2 } from 'lucide-react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';

const DEFAULT_BUTTON_CONFIG = {
    text: 'Надіслати',
    styleType: 'primary',
    variant: 'solid',
    size: 'medium',
    borderRadius: 6,
    width: 'auto',
    alignment: 'center',
    icon: 'none',
    iconPosition: 'right',
    fontFamily: 'global'
};

const FormBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });
    
    const { 
        successMessage, 
        height = 'small', 
        buttonText 
    } = blockData;

    const buttonConfig = {
        ...DEFAULT_BUTTON_CONFIG,
        ...((blockData && blockData.button) || {}),
        text: (blockData && blockData.button && blockData.button.text) || buttonText || DEFAULT_BUTTON_CONFIG.text
    };

    const rawRadius = buttonConfig.borderRadius;
    const safeRadius = (rawRadius !== undefined && rawRadius !== null && rawRadius !== '') 
        ? parseInt(rawRadius, 10) 
        : 6;

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        button: buttonConfig.fontFamily
    }, siteData);

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

    const accentColor = 'var(--site-accent, #3b82f6)';
    const textColor = 'var(--site-text-primary, #111827)';
    const whiteColor = '#ffffff';
    const colorVar = buttonConfig.styleType === 'secondary' ? textColor : accentColor;
    const isOutline = buttonConfig.variant === 'outline';

    const dynamicBtnStyle = {
        background: isOutline ? 'transparent' : colorVar,
        color: isOutline ? colorVar : (buttonConfig.styleType === 'secondary' && !isOutline ? whiteColor : whiteColor),
        border: isOutline ? `2px solid ${colorVar}` : '2px solid transparent',
        opacity: status.loading ? 0.7 : 1,
    };

    const sizeMap = {
        small:  { padding: '8px 16px',  fontSize: '0.85rem' },
        medium: { padding: '12px 24px', fontSize: '1rem' },
        large:  { padding: '16px 32px', fontSize: '1.2rem' }
    };
    
    const alignMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
    };

    const heightMap = { 
        small: 'auto',
        medium: '500px',
        large: '700px',
        full: 'calc(100vh - 60px)' 
    };

    const scopeClass = `form-scope-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    const btnClass = `form-btn-${(blockData && blockData.id) ? blockData.id : 'preview'}`;

    const containerStyle = { 
        padding: '30px',
        backgroundColor: 'var(--site-card-bg, #ffffff)',
        color: 'var(--site-text-primary)',
        border: '1px solid var(--site-border-color)',
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        borderRadius: '12px',
        minHeight: heightMap[height] || 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...style,
        ...cssVariables 
    };

    const inputStyle = {
        width: '100%', 
        padding: '12px 16px', 
        backgroundColor: 'var(--site-bg)',
        border: '1px solid var(--site-border-color)',
        color: 'var(--site-text-primary)',
        borderRadius: '8px', 
        marginBottom: '1rem', 
        boxSizing: 'border-box',
        fontSize: '1rem',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none'
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = 'var(--site-accent)';
        e.target.style.boxShadow = '0 0 0 1px var(--site-accent)'; 
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = 'var(--site-border-color)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div className={scopeClass} style={containerStyle}>
            <RenderFonts />
            
            <style>{`
                .${btnClass} { ${fontStyles.button || ''} }
                button.${btnClass} {
                    border-radius: ${safeRadius}px !important;
                }

                .${scopeClass} textarea::-webkit-scrollbar {
                    width: 6px;
                }
                .${scopeClass} textarea::-webkit-scrollbar-track {
                    background: transparent;
                }
                .${scopeClass} textarea::-webkit-scrollbar-thumb {
                    background-color: var(--site-border-color);
                    border-radius: 4px;
                }
                .${scopeClass} textarea::-webkit-scrollbar-thumb:hover {
                    background-color: var(--site-accent);
                }
                .${scopeClass} textarea {
                    scrollbar-width: thin;
                    scrollbar-color: var(--site-border-color) transparent;
                }
                
                .${scopeClass} input::placeholder,
                .${scopeClass} textarea::placeholder {
                    color: var(--site-text-secondary);
                    opacity: 0.7;
                }
            `}</style>
            
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {status.error && (
                    <div style={{
                        padding: '12px', border: '1px solid var(--site-danger)', 
                        background: 'rgba(229, 62, 62, 0.1)', color: 'var(--site-danger)', 
                        borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {status.error}
                    </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0' }}>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ваше ім'я*" required 
                        style={{ ...inputStyle, marginBottom: '1rem' }} onFocus={handleFocus} onBlur={handleBlur} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ваш Email*" required 
                        style={{ ...inputStyle, marginBottom: '1rem' }} onFocus={handleFocus} onBlur={handleBlur} />
                </div>

                <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Тема (необов'язково)" 
                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />

                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Ваше повідомлення*" required 
                    style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} onFocus={handleFocus} onBlur={handleBlur} />
                
                <div style={{ 
                    textAlign: buttonConfig.width === 'full' ? 'center' : (buttonConfig.alignment || 'center'),
                    display: 'flex',
                    justifyContent: buttonConfig.width === 'full' ? 'stretch' : (alignMap[buttonConfig.alignment] || 'center')
                }}> 
                    <button 
                        type="submit" 
                        className={btnClass}
                        disabled={status.loading} 
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: (isEditorPreview || status.loading) ? 'default' : 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            width: buttonConfig.width === 'full' ? '100%' : 'auto',
                            fontFamily: fontStyles.button,
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            borderRadius: `${safeRadius}px`,
                            ...sizeMap[buttonConfig.size || 'medium'],
                            ...dynamicBtnStyle
                        }}
                        onClick={(e) => {
                            if (isEditorPreview) {
                                e.preventDefault();
                            }
                        }}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.opacity = '0.9';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview && !status.loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.opacity = '1';
                            }
                        }}
                    >
                        {buttonConfig.iconPosition === 'left' && <ButtonIcon name={buttonConfig.icon} size={buttonConfig.size} flip={buttonConfig.iconFlip} />}
                        <span>{status.loading ? 'Відправка...' : (buttonConfig.text || 'Надіслати')}</span>
                        {buttonConfig.iconPosition === 'right' && <ButtonIcon name={buttonConfig.icon} size={buttonConfig.size} flip={buttonConfig.iconFlip} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ButtonIcon = ({ name, size, flip }) => {
    if (!name || name === 'none') return null;
    const s = size === 'large' ? 20 : 18;
    const style = { transform: flip ? 'scaleX(-1)' : 'none', flexShrink: 0 };
    const icons = {
        arrowRight: <ArrowRight size={s} style={style} />,
        cart: <ShoppingCart size={s} style={style} />,
        mail: <Mail size={s} style={style} />,
        phone: <Phone size={s} style={style} />,
        check: <Check size={s} style={style} />,
        star: <Star size={s} fill="currentColor" style={style} />,
        pointer: <MousePointer2 size={s} style={style} />
    };
    return icons[name] || null;
};

export default FormBlock;
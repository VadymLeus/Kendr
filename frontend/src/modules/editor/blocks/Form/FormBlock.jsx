// frontend/src/modules/editor/blocks/Form/FormBlock.jsx
import React, { useState } from 'react';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { Send, ArrowRight, ShoppingCart, Mail, Phone, Check, Star, MousePointer2 } from 'lucide-react';

const DEFAULT_BUTTON_CONFIG = {
    text: 'Надіслати',
    styleType: 'primary',
    variant: 'solid',
    size: 'medium',
    borderRadius: 8,
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
        : 8;
        
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

    const sizeClasses = {
        small: 'px-5 py-2.5 text-[0.9rem]',
        medium: 'px-7 py-3.5 text-base',
        large: 'px-10 py-4 text-[1.15rem]'
    };
    
    const alignMap = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    };

    const heightClasses = { 
        small: 'min-h-auto',
        medium: 'min-h-[500px]',
        large: 'min-h-[700px]',
        full: 'min-h-[calc(100vh-60px)]' 
    };

    const scopeClass = `form-scope-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    const btnClass = `form-btn-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    const inputClasses = `
        w-full px-4 py-3.5 
        bg-black/[0.03] dark:bg-white/[0.03] 
        border border-transparent
        text-(--site-text-primary) 
        rounded-xl text-base 
        transition duration-300 outline-none 
        focus:bg-transparent dark:focus:bg-transparent
        focus:border-(--site-accent) focus:ring-4 focus:ring-(--site-accent)/15 
        hover:bg-black/[0.05] dark:hover:bg-white/[0.05]
    `;

    const labelClasses = "block text-xs font-semibold uppercase tracking-wider text-(--site-text-secondary) opacity-80 mb-1.5 ml-1";
    return (
        <div 
            className={`
                p-8 md:p-10 bg-(--site-card-bg) text-(--site-text-primary) 
                border border-(--site-border-color) shadow-2xl shadow-black/5
                max-w-150 w-full mx-auto rounded-2xl flex flex-col justify-center
                ${heightClasses[height]}
                ${scopeClass}
            `}
            style={{ 
                ...style,
                ...cssVariables 
            }}
        >
            <RenderFonts />
            <style>{`
                .${btnClass} { ${fontStyles.button || ''} }
                button.${btnClass} {
                    border-radius: ${safeRadius}px !important;
                }
                .${scopeClass} input::placeholder,
                .${scopeClass} textarea::placeholder {
                    color: var(--site-text-secondary);
                    opacity: 0.5;
                }
            `}</style>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                {status.error && (
                    <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl mb-2 text-sm text-center font-medium">
                        {status.error}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClasses}>Ваше ім'я *</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange}
                            required 
                            className={inputClasses} 
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Email *</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="email@example.com" 
                            required 
                            className={inputClasses} 
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Тема (необов'язково)</label>
                    <input 
                        type="text" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange}
                        className={inputClasses} 
                    />
                </div>
                <div>
                    <label className={labelClasses}>Повідомлення *</label>
                    <textarea 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange} 
                        placeholder="Напишіть ваше повідомлення тут..." 
                        required 
                        className={`custom-scrollbar min-h-32 md:min-h-40 resize-y ${inputClasses}`}
                    />
                </div>
                <div 
                    className={`
                        flex w-full mt-2
                        ${buttonConfig.width === 'full' ? 'text-center justify-stretch' : (alignMap[buttonConfig.alignment] || 'justify-center')}
                    `}
                    style={{ textAlign: buttonConfig.width === 'full' ? 'center' : (buttonConfig.alignment || 'center') }}
                > 
                    <button 
                        type="submit" 
                        className={`
                            ${btnClass}
                            inline-flex items-center justify-center gap-2.5 font-medium transition-all duration-300 appearance-none shadow-sm
                            ${(isEditorPreview || status.loading) ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'}
                            ${sizeClasses[buttonConfig.size || 'medium']}
                        `}
                        disabled={status.loading} 
                        style={{
                            width: buttonConfig.width === 'full' ? '100%' : 'auto',
                            fontFamily: fontStyles.button,
                            borderRadius: `${safeRadius}px`,
                            ...dynamicBtnStyle
                        }}
                        onClick={(e) => {
                            if (isEditorPreview) {
                                e.preventDefault();
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
// frontend/src/features/sites/tabs/GeneralSettingsTab.jsx
import React, { useState } from 'react';
import { useAutoSave } from '../../../hooks/useAutoSave';
import ImageInput from '../../media/ImageInput'; 
import apiClient from '../../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../hooks/useConfirm';
import ChangeTemplateModal from '../components/ChangeTemplateModal';

const GeneralSettingsTab = ({ siteData, onUpdate }) => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [slugError, setSlugError] = useState('');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const { data, handleChange } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            title: siteData.title,
            status: siteData.status,
            favicon_url: siteData.favicon_url || '', 
            site_title_seo: siteData.site_title_seo || siteData.title,
            theme_settings: siteData.theme_settings || {}
        }
    );

    const [slug, setSlug] = useState(siteData.site_path);
    const [isSavingSlug, setIsSavingSlug] = useState(false);

    const cookieSettings = data.theme_settings?.cookie_banner || {
        enabled: false,
        text: "Ми використовуємо файли cookie для покращення роботи сайту.",
        acceptText: "Прийняти",
        rejectText: "Відхилити",
        showReject: true,
        position: "bottom"
    };

    const handleCookieChange = (field, value) => {
        const updatedCookieSettings = { ...cookieSettings, [field]: value };
        
        const updatedThemeSettings = {
            ...data.theme_settings,
            cookie_banner: updatedCookieSettings
        };

        handleChange('theme_settings', updatedThemeSettings);
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        handleChange('title', newTitle);
        
        if (onUpdate) {
            onUpdate({ title: newTitle });
        }
    };

    const handleSlugChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(val);
        setSlugError('');
    };

    const saveSlug = async () => {
        if (slug === siteData.site_path) return;
        if (slug.length < 3) {
            setSlugError('Мінімум 3 символи');
            return;
        }

        setIsSavingSlug(true);
        try {
            await apiClient.put(`/sites/${siteData.site_path}/rename`, { newPath: slug });
            toast.success('Адресу сайту успішно змінено! Перезавантаження...');
            setTimeout(() => {
                navigate(`/dashboard/${slug}`);
                window.location.reload();
            }, 1500);
        } catch (error) {
            setSlugError(error.response?.data?.message || 'Помилка зміни адреси');
        } finally {
            setIsSavingSlug(false);
        }
    };

    const handleTemplateChange = async (templateId, isPersonal) => {
        setIsTemplateModalOpen(false);

        const isConfirmed = await confirm({
            title: "Змінити шаблон?",
            message: "УВАГА: Ця дія повністю видалить всі ваші поточні сторінки, хедер та футер і замінить їх структурою нового шаблону. Медіафайли залишаться. Продовжити?",
            type: "danger",
            confirmLabel: "Так, замінити все"
        });

        if (isConfirmed) {
            const toastId = toast.loading("Застосування нового шаблону...");
            try {
                await apiClient.put(`/sites/${siteData.id}/reset-template`, {
                    templateId,
                    isPersonal
                });
                toast.update(toastId, { 
                    render: "Шаблон успішно змінено! Перезавантаження...", 
                    type: "success", 
                    isLoading: false,
                    autoClose: 2000 
                });
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (error) {
                console.error(error);
                toast.update(toastId, { 
                    render: error.response?.data?.message || "Помилка зміни шаблону", 
                    type: "error", 
                    isLoading: false,
                    autoClose: 3000 
                });
            }
        }
    };

    const handleDeleteSite = async () => {
        const isConfirmed = await confirm({
            title: "Видалити сайт?",
            message: `Ви впевнені, що хочете видалити "${siteData.title}"? Всі дані, товари та сторінки будуть втрачені безповоротно.`,
            type: "danger",
            confirmLabel: "Так, видалити сайт"
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/sites/${siteData.site_path}`);
                toast.success('Сайт успішно видалено');
                navigate('/my-sites');
            } catch (err) {
                toast.error('Не вдалося видалити сайт');
            }
        }
    };

    const primaryButton = { 
        background: 'var(--platform-accent)', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        border: 'none', 
        fontWeight: '500', 
        cursor: 'pointer', 
        fontSize: '0.9rem', 
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const primaryButtonHover = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };
    
    const dangerButton = { 
        background: '#e53e3e', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '8px', 
        border: 'none', 
        fontWeight: '600', 
        cursor: 'pointer', 
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(229, 62, 62, 0.2)'
    };

    const dangerButtonHover = {
        background: '#c53030',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.3)'
    };

    const warningButton = {
        background: 'var(--platform-warning)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(237, 137, 54, 0.2)'
    };

    const warningButtonHover = {
        background: 'var(--platform-warning-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(237, 137, 54, 0.3)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

    const containerStyle = { 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '0 16px' 
    };
    
    const headerStyle = { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '2rem', 
        flexWrap: 'wrap', 
        gap: '16px' 
    };
    
    const cardStyle = { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '16px', 
        border: '1px solid var(--platform-border-color)', 
        padding: '32px', 
        marginBottom: '24px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' 
    };
    
    const cardTitleStyle = { 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        color: 'var(--platform-text-primary)', 
        margin: '0 0 8px 0' 
    };
    
    const cardSubtitleStyle = { 
        fontSize: '0.95rem', 
        color: 'var(--platform-text-secondary)', 
        margin: 0, 
        lineHeight: '1.5' 
    };
    
    const inputGroupStyle = { 
        marginBottom: '24px' 
    };
    
    const labelStyle = { 
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '500', 
        color: 'var(--platform-text-primary)', 
        fontSize: '0.9rem' 
    };
    
    const inputStyle = { 
        width: '100%', 
        padding: '12px 16px', 
        borderRadius: '8px', 
        border: '1px solid var(--platform-border-color)', 
        background: 'var(--platform-bg)', 
        color: 'var(--platform-text-primary)', 
        fontSize: '0.9rem', 
        boxSizing: 'border-box', 
        transition: 'all 0.2s ease' 
    };

    const inputHoverStyle = {
        borderColor: 'var(--platform-accent)',
        boxShadow: '0 0 0 1px var(--platform-accent)'
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '600', 
                        margin: '0 0 4px 0', 
                        color: 'var(--platform-text-primary)' 
                    }}>
                        Глобальні налаштування
                    </h2>
                    <p style={{ 
                        color: 'var(--platform-text-secondary)', 
                        margin: 0, 
                        fontSize: '0.9rem' 
                    }}>
                        Керування основними параметрами вашого сайту
                    </p>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{marginBottom: '24px'}}>
                    <h3 style={cardTitleStyle}>📋 Основна інформація</h3>
                    <p style={cardSubtitleStyle}>Назва сайту та його видимість в інтернеті</p>
                </div>
                
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Назва сайту</label>
                    <input 
                        type="text" 
                        style={inputStyle}
                        value={data.title}
                        onChange={handleTitleChange}
                        placeholder="Мій інтернет-магазин"
                        onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                        onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Адреса сайту</label>
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center' 
                    }}>
                        <div style={{ 
                            padding: '12px 16px', 
                            background: 'var(--platform-bg)', 
                            borderRadius: '8px', 
                            border: '1px solid var(--platform-border-color)', 
                            color: 'var(--platform-text-secondary)', 
                            fontSize: '0.9rem', 
                            whiteSpace: 'nowrap' 
                        }}>
                            /site/
                        </div>
                        <input 
                            type="text" 
                            style={{ 
                                ...inputStyle, 
                                flex: 1, 
                                fontWeight: '500' 
                            }}
                            value={slug}
                            onChange={handleSlugChange}
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, flex: 1, fontWeight: '500'})}
                        />
                        {slug !== siteData.site_path && (
                            <button 
                                onClick={saveSlug}
                                disabled={isSavingSlug}
                                style={{ 
                                    ...primaryButton, 
                                    opacity: isSavingSlug ? 0.7 : 1 
                                }}
                                onMouseOver={(e) => !isSavingSlug && handleMouseOver(e.target, primaryButtonHover)}
                                onMouseOut={(e) => handleMouseOut(e.target, {...primaryButton, opacity: isSavingSlug ? 0.7 : 1})}
                            >
                                {isSavingSlug ? '...' : 'Зберегти'}
                            </button>
                        )}
                    </div>
                    {slugError && (
                        <div style={{ 
                            color: '#e53e3e', 
                            fontSize: '0.8rem', 
                            marginTop: '6px' 
                        }}>
                            {slugError}
                        </div>
                    )}
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Статус сайту</label>
                    <select 
                        value={data.status} 
                        onChange={(e) => handleChange('status', e.target.value)}
                        style={selectStyle}
                        onMouseOver={(e) => handleMouseOver(e.target, {...selectStyle, ...inputHoverStyle})}
                        onMouseOut={(e) => handleMouseOut(e.target, selectStyle)}
                    >
                        <option value="draft">📝 Чернетка (Draft)</option>
                        <option value="published">🌐 Опубліковано (Published)</option>
                        <option value="suspended" disabled>⏸️ Призупинено (Suspended)</option>
                    </select>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{marginBottom: '24px'}}>
                    <h3 style={cardTitleStyle}>🍪 Конфіденційність</h3>
                    <p style={cardSubtitleStyle}>Налаштування Cookie-банера та згоди користувачів</p>
                </div>

                <div style={inputGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '1rem', color: 'var(--platform-text-primary)' }}>
                        <input 
                            type="checkbox" 
                            checked={cookieSettings.enabled} 
                            onChange={(e) => handleCookieChange('enabled', e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500' }}>Ввімкнути Cookie-баннер</span>
                    </label>
                </div>

                {cookieSettings.enabled && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Текст повідомлення</label>
                            <textarea 
                                value={cookieSettings.text}
                                onChange={(e) => handleCookieChange('text', e.target.value)}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Ми використовуємо cookies..."
                                onMouseOver={(e) => handleMouseOver(e.target, {...inputStyle, minHeight: '80px', resize: 'vertical', ...inputHoverStyle})}
                                onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, minHeight: '80px', resize: 'vertical'})}
                            />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={cookieSettings.showReject !== false} 
                                    onChange={(e) => handleCookieChange('showReject', e.target.checked)}
                                />
                                Показати кнопку "Відхилити"
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Текст кнопки прийняття</label>
                                <input 
                                    type="text" 
                                    value={cookieSettings.acceptText || cookieSettings.buttonText || ''}
                                    onChange={(e) => handleCookieChange('acceptText', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Прийняти"
                                    onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                    onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                                />
                            </div>
                            
                            {(cookieSettings.showReject !== false) && (
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Текст кнопки відхилення</label>
                                    <input 
                                        type="text" 
                                        value={cookieSettings.rejectText}
                                        onChange={(e) => handleCookieChange('rejectText', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Відхилити"
                                        onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                        onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Позиція</label>
                            <select 
                                value={cookieSettings.position || 'bottom'}
                                onChange={(e) => handleCookieChange('position', e.target.value)}
                                style={selectStyle}
                                onMouseOver={(e) => handleMouseOver(e.target, {...selectStyle, ...inputHoverStyle})}
                                onMouseOut={(e) => handleMouseOut(e.target, selectStyle)}
                            >
                                <option value="bottom">Внизу екрану</option>
                                <option value="top">Вгорі екрану</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div style={cardStyle}>
                <div style={{marginBottom: '24px'}}>
                    <h3 style={cardTitleStyle}>🎨 SEO та Брендинг</h3>
                    <p style={cardSubtitleStyle}>Налаштування вигляду у пошукових системах</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div>
                        <label style={labelStyle}>Favicon</label>
                        <div style={{ height: '120px', width: '120px', marginBottom: '8px' }}>
                            <ImageInput value={data.favicon_url} onChange={(url) => handleChange('favicon_url', url)} />
                        </div>
                    </div>
                    <div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>SEO Заголовок</label>
                            <input 
                                type="text" 
                                style={inputStyle}
                                value={data.site_title_seo}
                                onChange={(e) => handleChange('site_title_seo', e.target.value)}
                                onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ 
                ...cardStyle, 
                borderColor: 'var(--platform-warning)', 
                background: 'rgba(237, 137, 54, 0.05)' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '16px' 
                }}>
                    <div style={{flex: 1}}>
                        <h3 style={{ 
                            ...cardTitleStyle, 
                            color: 'var(--platform-warning)', 
                            marginBottom: '8px' 
                        }}>
                            🔄 Зміна дизайну
                        </h3>
                        <p style={{ 
                            margin: 0, 
                            color: 'var(--platform-text-secondary)', 
                            fontSize: '0.9rem'
                        }}>
                            Скинути поточну структуру та застосувати інший шаблон.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsTemplateModalOpen(true)} 
                        style={warningButton}
                        onMouseOver={(e) => handleMouseOver(e.target, warningButtonHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, warningButton)}
                    >
                        Змінити шаблон
                    </button>
                </div>
            </div>

            <div style={{ 
                ...cardStyle, 
                borderColor: '#fed7d7', 
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '16px' 
                }}>
                    <div style={{flex: 1}}>
                        <h3 style={{ 
                            ...cardTitleStyle, 
                            color: '#c53030', 
                            marginBottom: '8px' 
                        }}>
                            🚫 Небезпечна зона
                        </h3>
                        <p style={{ 
                            margin: 0, 
                            color: '#c53030', 
                            fontSize: '0.9rem', 
                            opacity: 0.8 
                        }}>
                            Видалення сайту є незворотним.
                        </p>
                    </div>
                    <button 
                        onClick={handleDeleteSite} 
                        style={dangerButton}
                        onMouseOver={(e) => handleMouseOver(e.target, dangerButtonHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, dangerButton)}
                    >
                        Видалити сайт
                    </button>
                </div>
            </div>

            <ChangeTemplateModal 
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateChange}
            />

            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
};

export default GeneralSettingsTab;
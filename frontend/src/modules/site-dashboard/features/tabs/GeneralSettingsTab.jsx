// frontend/src/modules/site-dashboard/features/tabs/GeneralSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useAutoSave } from '../../../../common/hooks/useAutoSave';
import ImageInput from '../../../media/components/ImageInput'; 
import SiteCoverDisplay from '../../../../common/components/ui/SiteCoverDisplay';
import apiClient from '../../../../common/services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import ChangeTemplateModal from '../../components/ChangeTemplateModal';
import { Input, Button, Select } from '../../../../common/components/ui';

const GeneralSettingsTab = ({ siteData, onUpdate, onSavingChange }) => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [slugError, setSlugError] = useState('');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const { data, handleChange, isSaving } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            title: siteData.title,
            status: siteData.status,
            favicon_url: siteData.favicon_url || '', 
            site_title_seo: siteData.site_title_seo || siteData.title,
            theme_settings: siteData.theme_settings || {},
            cover_image: siteData.cover_image || '',
            cover_layout: siteData.cover_layout || 'centered'
        }
    );

    const [slug, setSlug] = useState(siteData.site_path);
    const [isSavingSlug, setIsSavingSlug] = useState(false);

    useEffect(() => {
        if (onSavingChange) {
            onSavingChange(isSaving || isSavingSlug);
        }
    }, [isSaving, isSavingSlug, onSavingChange]);

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
        const updatedThemeSettings = { ...data.theme_settings, cookie_banner: updatedCookieSettings };
        handleChange('theme_settings', updatedThemeSettings);
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        handleChange('title', newTitle);
        if (onUpdate) onUpdate({ title: newTitle });
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
            setIsSavingSlug(false);
        } 
    };

    const handleTemplateChange = async (templateId, isPersonal) => {
        setIsTemplateModalOpen(false);
        const isConfirmed = await confirm({
            title: "Змінити шаблон?",
            message: "УВАГА: Ця дія повністю видалить всі ваші поточні сторінки, хедер та футер. Продовжити?",
            type: "danger",
            confirmLabel: "Так, замінити все"
        });

        if (isConfirmed) {
            const toastId = toast.loading("Застосування нового шаблону...");
            try {
                await apiClient.put(`/sites/${siteData.id}/reset-template`, { templateId, isPersonal });
                toast.update(toastId, { render: "Шаблон успішно змінено! Перезавантаження...", type: "success", isLoading: false, autoClose: 2000 });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                toast.update(toastId, { render: error.response?.data?.message || "Помилка", type: "error", isLoading: false, autoClose: 3000 });
            }
        }
    };

    const handleDeleteSite = async () => {
        if (await confirm({ title: "Видалити сайт?", message: `Ви впевнені?`, type: "danger", confirmLabel: "Так, видалити сайт" })) {
            try {
                await apiClient.delete(`/sites/${siteData.site_path}`);
                toast.success('Сайт успішно видалено');
                navigate('/my-sites');
            } catch (err) {
                toast.error('Не вдалося видалити сайт');
            }
        }
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
                
                <Input 
                    label="Назва сайту"
                    value={data.title}
                    onChange={handleTitleChange}
                    placeholder="Мій інтернет-магазин"
                />

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500', 
                        color: 'var(--platform-text-primary)', 
                        fontSize: '0.9rem' 
                    }}>
                        Адреса сайту
                    </label>
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
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--platform-border-color)',
                                background: 'var(--platform-bg)',
                                color: 'var(--platform-text-primary)',
                                fontSize: '0.9rem',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                fontWeight: '500'
                            }}
                            value={slug}
                            onChange={handleSlugChange}
                        />
                        {slug !== siteData.site_path && (
                            <Button 
                                onClick={saveSlug}
                                disabled={isSavingSlug}
                            >
                                {isSavingSlug ? '...' : 'Зберегти'}
                            </Button>
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

                <Select 
                    label="Статус сайту"
                    value={data.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    options={[
                        { value: 'draft', label: '📝 Чернетка (Draft)' },
                        { value: 'published', label: '🌐 Опубліковано (Published)' },
                        { value: 'suspended', label: '⏸️ Призупинено (Suspended)' }
                    ]}
                />
            </div>

            <div style={cardStyle}>
                <div style={{marginBottom: '24px'}}>
                    <h3 style={cardTitleStyle}>🖼️ Розумна Обкладинка</h3>
                    <p style={cardSubtitleStyle}>Ця картка відображається в каталозі сайтів та при поширенні посилання.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                    
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '10px', 
                            fontWeight: '600', 
                            color: 'var(--platform-text-primary)',
                            fontSize: '0.9rem' 
                        }}>
                            Попередній перегляд:
                        </label>
                        <div style={{ 
                            width: '100%', 
                            aspectRatio: '1.6 / 1',
                            border: '1px solid var(--platform-border-color)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <SiteCoverDisplay 
                                site={{
                                    ...siteData,
                                    title: data.title,
                                    cover_image: data.cover_image,
                                    cover_layout: data.cover_layout
                                }} 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div style={{ 
                            padding: '16px', 
                            background: 'var(--platform-bg)', 
                            borderRadius: '10px', 
                            border: '1px solid var(--platform-border-color)' 
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--platform-text-primary)' }}>
                                    Власне зображення
                                </label>
                                {data.cover_image && (
                                    <button 
                                        onClick={() => handleChange('cover_image', '')}
                                        style={{
                                            background: 'none', border: 'none', color: '#e53e3e',
                                            cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500',
                                            padding: 0
                                        }}
                                    >
                                        🗑 Видалити
                                    </button>
                                )}
                            </div>
                            
                            {data.cover_image ? (
                                <div style={{ fontSize: '0.9rem', color: 'var(--platform-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>✅</span> Зображення завантажено
                                </div>
                            ) : (
                                <div style={{ height: '50px' }}>
                                    <ImageInput 
                                        value={data.cover_image}
                                        onChange={(e) => handleChange('cover_image', e.target.value)}
                                        aspect={1.6}
                                        triggerStyle={{
                                            border: '1px dashed var(--platform-border-color)',
                                            borderRadius: '6px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            height: '100%', cursor: 'pointer', color: 'var(--platform-text-secondary)',
                                            background: 'var(--platform-card-bg)', fontSize: '0.9rem'
                                        }}
                                    >
                                        <span>📷 Завантажити обкладинку...</span>
                                    </ImageInput>
                                </div>
                            )}
                        </div>

                        <div style={{ 
                            opacity: data.cover_image ? 0.5 : 1, 
                            pointerEvents: data.cover_image ? 'none' : 'auto',
                            transition: 'opacity 0.2s ease'
                        }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '10px', 
                                fontWeight: '600', 
                                color: 'var(--platform-text-primary)',
                                fontSize: '0.9rem' 
                            }}>
                                Стиль генератора:
                            </label>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {[
                                    { id: 'centered', label: 'Стандарт', icon: '⬇️' },
                                    { id: 'centered_reverse', label: 'Реверс', icon: '⬆️' },
                                    { id: 'classic', label: 'Класика', icon: '⬅️' },
                                    { id: 'reverse', label: 'Справа', icon: '➡️' },
                                    { id: 'minimal', label: 'Текст', icon: '📝' },
                                    { id: 'logo_only', label: 'Лого', icon: '🖼️' },
                                ].map(layout => (
                                    <button
                                        key={layout.id}
                                        onClick={() => handleChange('cover_layout', layout.id)}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            padding: '10px',
                                            background: data.cover_layout === layout.id ? 'var(--platform-accent)' : 'var(--platform-bg)',
                                            color: data.cover_layout === layout.id ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
                                            border: data.cover_layout === layout.id ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            transition: 'all 0.2s ease',
                                            boxShadow: data.cover_layout === layout.id ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{layout.icon}</span>
                                        {layout.label}
                                    </button>
                                ))}
                            </div>
                            <small style={{ display: 'block', marginTop: '10px', color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                                Використовує кольори з налаштувань теми сайту.
                            </small>
                        </div>

                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{marginBottom: '24px'}}>
                    <h3 style={cardTitleStyle}>🍪 Конфіденційність</h3>
                    <p style={cardSubtitleStyle}>Налаштування Cookie-банера та згоди користувачів</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '1rem', color: 'var(--platform-text-primary)' }}>
                        <input 
                            type="checkbox" 
                            checked={cookieSettings.enabled} 
                            onChange={(e) => handleCookieChange('enabled', e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500' }}>Ввімкнути Cookie-банер</span>
                    </label>
                </div>

                {cookieSettings.enabled && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500', 
                                color: 'var(--platform-text-primary)', 
                                fontSize: '0.9rem' 
                            }}>
                                Текст повідомлення
                            </label>
                            <textarea 
                                value={cookieSettings.text}
                                onChange={(e) => handleCookieChange('text', e.target.value)}
                                style={{ 
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--platform-border-color)',
                                    background: 'var(--platform-bg)',
                                    color: 'var(--platform-text-primary)',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s ease',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                placeholder="Ми використовуємо cookies..."
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                marginBottom: '8px', 
                                fontWeight: '500', 
                                color: 'var(--platform-text-primary)', 
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={cookieSettings.showReject !== false} 
                                    onChange={(e) => handleCookieChange('showReject', e.target.checked)}
                                />
                                Показати кнопку "Відхилити"
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <Input 
                                label="Текст кнопки прийняття"
                                value={cookieSettings.acceptText || cookieSettings.buttonText || ''}
                                onChange={(e) => handleCookieChange('acceptText', e.target.value)}
                                placeholder="Прийняти"
                            />
                            
                            {(cookieSettings.showReject !== false) && (
                                <Input 
                                    label="Текст кнопки відхилення"
                                    value={cookieSettings.rejectText}
                                    onChange={(e) => handleCookieChange('rejectText', e.target.value)}
                                    placeholder="Відхилити"
                                />
                            )}
                        </div>

                        <Select 
                            label="Позиція"
                            value={cookieSettings.position || 'bottom'}
                            onChange={(e) => handleCookieChange('position', e.target.value)}
                            options={[
                                { value: 'bottom', label: 'Внизу екрану' },
                                { value: 'top', label: 'Вгорі екрану' }
                            ]}
                        />
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
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '500', 
                            color: 'var(--platform-text-primary)', 
                            fontSize: '0.9rem' 
                        }}>
                            Favicon
                        </label>
                        <div style={{ height: '120px', width: '120px', marginBottom: '8px' }}>
                            <ImageInput 
                                value={data.favicon_url} 
                                onChange={(e) => handleChange('favicon_url', e.target.value)} 
                                aspect={1}
                                circularCrop={false}
                            />
                        </div>
                        <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                            Рекомендовано: квадратне зображення (1:1)
                        </small>
                    </div>
                    <div>
                        <Input 
                            label="SEO Заголовок"
                            value={data.site_title_seo}
                            onChange={(e) => handleChange('site_title_seo', e.target.value)}
                        />
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
                    <Button 
                        variant="warning"
                        onClick={() => setIsTemplateModalOpen(true)}
                    >
                        Змінити шаблон
                    </Button>
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
                    <Button 
                        variant="danger"
                        onClick={handleDeleteSite}
                    >
                        Видалити сайт
                    </Button>
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
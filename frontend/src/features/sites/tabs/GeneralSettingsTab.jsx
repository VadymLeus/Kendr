// frontend/src/features/sites/tabs/GeneralSettingsTab.jsx
import React, { useState } from 'react';
import { useAutoSave } from '../../../hooks/useAutoSave';
import ImageUploader from '../../../components/common/ImageUploader';
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

    const { data, handleChange, isSaving } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            title: siteData.title,
            status: siteData.status,
            favicon_url: siteData.favicon_url || '', 
            site_title_seo: siteData.site_title_seo || siteData.title
        }
    );

    const [slug, setSlug] = useState(siteData.site_path);
    const [isSavingSlug, setIsSavingSlug] = useState(false);

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

    const handleFaviconUpload = async (file) => {
        const formData = new FormData();
        formData.append('mediaFile', file);
        try {
            const res = await apiClient.post('/media/upload', formData);
            handleChange('favicon_url', res.data.path_full);
            toast.success('Favicon оновлено');
        } catch (e) {
            toast.error('Помилка завантаження');
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
    
    const primaryButton = { 
        background: 'var(--platform-accent)', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        border: 'none', 
        fontWeight: '500', 
        cursor: 'pointer', 
        fontSize: '0.9rem', 
        whiteSpace: 'nowrap' 
    };
    
    const dangerButton = { 
        background: '#e53e3e', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '8px', 
        border: 'none', 
        fontWeight: '600', 
        cursor: 'pointer', 
        fontSize: '0.9rem' 
    };

    const warningButton = {
        background: 'var(--platform-warning)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.9rem'
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
                {isSaving && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        color: 'var(--platform-accent)', 
                        fontWeight: '500', 
                        fontSize: '0.9rem' 
                    }}>
                        <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: 'var(--platform-accent)', 
                            animation: 'pulse 1.5s ease-in-out infinite' 
                        }}></div>
                        Збереження...
                    </div>
                )}
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
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--platform-accent)';
                            e.target.style.boxShadow = '0 0 0 2px var(--platform-accent)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--platform-border-color)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <div style={{ 
                        color: 'var(--platform-text-secondary)', 
                        fontSize: '0.8rem', 
                        marginTop: '6px' 
                    }}>
                        Ця назва відображається у шапці вашого сайту та в каталозі.
                    </div>
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
                            onFocus={(e) => { 
                                e.target.style.borderColor = 'var(--platform-accent)'; 
                                e.target.style.boxShadow = '0 0 0 2px var(--platform-accent)'; 
                            }}
                            onBlur={(e) => { 
                                e.target.style.borderColor = 'var(--platform-border-color)'; 
                                e.target.style.boxShadow = 'none'; 
                            }}
                        />
                        {slug !== siteData.site_path && (
                            <button 
                                onClick={saveSlug}
                                disabled={isSavingSlug}
                                style={{ 
                                    ...primaryButton, 
                                    opacity: isSavingSlug ? 0.7 : 1 
                                }}
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
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '12px' 
                    }}>
                        {[
                            { value: 'published', label: 'Опубліковано', description: 'Сайт доступний всім відвідувачам', icon: '🌍' },
                            { value: 'draft', label: 'Чернетка', description: 'Сайт бачите тільки ви', icon: '📝' }
                        ].map(option => (
                            <div 
                                key={option.value}
                                onClick={() => handleChange('status', option.value)}
                                style={{
                                    border: `2px solid ${data.status === option.value ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    background: data.status === option.value ? 'rgba(var(--platform-accent-rgb), 0.05)' : 'var(--platform-bg)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    marginBottom: '4px' 
                                }}>
                                    <span style={{fontSize: '1.2rem'}}>{option.icon}</span>
                                    <span style={{ 
                                        fontWeight: '600', 
                                        color: data.status === option.value ? 'var(--platform-accent)' : 'var(--platform-text-primary)' 
                                    }}>
                                        {option.label}
                                    </span>
                                </div>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--platform-text-secondary)', 
                                    lineHeight: '1.4' 
                                }}>
                                    {option.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{marginBottom: '24px'}}>
                    <h3 style={cardTitleStyle}>🎨 SEO та Брендинг</h3>
                    <p style={cardSubtitleStyle}>Налаштування вигляду у пошукових системах та браузері</p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px' 
                }}>
                    <div>
                        <label style={labelStyle}>Favicon (Іконка сайту)</label>
                        <div style={{ 
                            display: 'flex', 
                            gap: '16px', 
                            alignItems: 'flex-start' 
                        }}>
                            <ImageUploader aspect={1} onUpload={handleFaviconUpload}>
                                <div style={{
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '12px',
                                    border: `2px dashed ${data.favicon_url ? 'var(--platform-border-color)' : 'var(--platform-accent)'}`,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: 'pointer', 
                                    overflow: 'hidden', 
                                    background: 'var(--platform-bg)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {data.favicon_url ? (
                                        <img 
                                            src={`http://localhost:5000${data.favicon_url}`} 
                                            alt="Favicon" 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover' 
                                            }} 
                                        />
                                    ) : (
                                        <div style={{textAlign: 'center'}}>
                                            <span style={{
                                                fontSize: '1.5rem', 
                                                display: 'block', 
                                                marginBottom: '4px'
                                            }}>🖼️</span>
                                            <span style={{
                                                fontSize: '0.7rem', 
                                                color: 'var(--platform-text-secondary)'
                                            }}>Завантажити</span>
                                        </div>
                                    )}
                                </div>
                            </ImageUploader>
                            <div style={{flex: 1}}>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--platform-text-secondary)', 
                                    lineHeight: '1.4' 
                                }}>
                                    Завантажте квадратне зображення (PNG або ICO). Воно буде відображатися у вкладці браузера.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>SEO Заголовок (Title Tag)</label>
                            <input 
                                type="text" 
                                style={inputStyle}
                                value={data.site_title_seo}
                                onChange={(e) => handleChange('site_title_seo', e.target.value)}
                                placeholder="Головна | Мій Магазин"
                                onFocus={(e) => { 
                                    e.target.style.borderColor = 'var(--platform-accent)'; 
                                    e.target.style.boxShadow = '0 0 0 2px var(--platform-accent)'; 
                                }}
                                onBlur={(e) => { 
                                    e.target.style.borderColor = 'var(--platform-border-color)'; 
                                    e.target.style.boxShadow = 'none'; 
                                }}
                            />
                            <div style={{ 
                                color: 'var(--platform-text-secondary)', 
                                fontSize: '0.8rem', 
                                marginTop: '6px' 
                            }}>
                                Заголовок, який відображається у пошукових системах та вкладці браузера.
                            </div>
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
                            🔄 Зміна дизайну (Reset)
                        </h3>
                        <p style={{ 
                            margin: 0, 
                            color: 'var(--platform-text-secondary)', 
                            fontSize: '0.9rem'
                        }}>
                            Скинути поточну структуру сайту та застосувати інший шаблон. 
                            <strong> Всі поточні сторінки будуть втрачені.</strong>
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsTemplateModalOpen(true)} 
                        style={warningButton}
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
                            Ці дії є незворотними. Будьте обережні.
                        </p>
                    </div>
                    <button 
                        onClick={handleDeleteSite} 
                        style={dangerButton}
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
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default GeneralSettingsTab;
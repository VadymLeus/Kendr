// frontend/src/features/sites/tabs/SiteSettingsTab.jsx
import React, { useState, useEffect } from 'react';

const SiteSettingsTab = ({ siteData, onUpdate }) => {
    const [settings, setSettings] = useState({
        title: siteData.title || '',
        site_path: siteData.site_path || '',
        logo_url: siteData.logo_url || '',
        status: siteData.status || 'draft',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        setSettings({
            title: siteData.title || '',
            site_path: siteData.site_path || '',
            logo_url: siteData.logo_url || '',
            status: siteData.status || 'draft',
        });
    }, [siteData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            await onUpdate(settings);
            setMessage({ 
                type: 'success', 
                text: 'Налаштування сайту успішно оновлено!' 
            });
        } catch (error) {
            console.error('Помилка оновлення налаштувань:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Помилка оновлення налаштувань' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '600px', 
            margin: '0 auto', 
            padding: '2rem',
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '12px', 
            backgroundColor: 'var(--platform-card-bg)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        },
        title: {
            color: 'var(--platform-text-primary)',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block', 
            marginBottom: '0.5rem',
            color: 'var(--platform-text-primary)',
            fontWeight: '500',
            fontSize: '0.9rem'
        },
        input: {
            width: '100%', 
            padding: '0.75rem',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '6px',
            backgroundColor: 'var(--platform-card-bg)',
            color: 'var(--platform-text-primary)',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
        },
        inputDisabled: {
            backgroundColor: 'var(--platform-bg)',
            color: 'var(--platform-text-secondary)',
            cursor: 'not-allowed'
        },
        select: {
            width: '100%', 
            padding: '0.75rem',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '6px',
            backgroundColor: 'var(--platform-card-bg)',
            color: 'var(--platform-text-primary)',
            fontSize: '0.9rem',
            cursor: 'pointer'
        },
        smallText: {
            color: 'var(--platform-text-secondary)',
            fontSize: '0.8rem',
            marginTop: '0.25rem',
            display: 'block'
        },
        logoPreview: {
            maxWidth: '120px', 
            marginTop: '0.75rem', 
            borderRadius: '6px',
            border: '1px solid var(--platform-border-color)'
        },
        submitButton: {
            backgroundColor: 'var(--platform-accent)', 
            color: 'var(--platform-accent-text)', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px', 
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        message: {
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
        },
        successMessage: {
            backgroundColor: 'rgba(56, 161, 105, 0.1)',
            color: 'var(--platform-success)',
            border: '1px solid var(--platform-success)'
        },
        errorMessage: {
            backgroundColor: 'rgba(229, 62, 62, 0.1)',
            color: 'var(--platform-danger)',
            border: '1px solid var(--platform-danger)'
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>
                ⚙️ Основні налаштування сайту
            </h3>
            
            {message.text && (
                <div style={{
                    ...styles.message,
                    ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
                }}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Заголовок сайту (Title):</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={settings.title} 
                        onChange={handleChange} 
                        required 
                        style={styles.input}
                        placeholder="Введіть назву вашого сайту"
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Шлях (URL Path):</label>
                    <input 
                        type="text" 
                        name="site_path" 
                        value={settings.site_path} 
                        onChange={handleChange} 
                        required 
                        pattern="[a-z0-9-]+" 
                        title="Дозволені лише малі латинські літери, цифри та дефіси."
                        style={{
                            ...styles.input,
                            ...styles.inputDisabled
                        }}
                        disabled
                    />
                    <small style={styles.smallText}>
                        Повний шлях: /site/{siteData.site_path}
                    </small>
                    <small style={styles.smallText}>
                        ℹ️ Шлях сайту не можна змінити після створення
                    </small>
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>URL Логотипу (Logo URL):</label>
                    <input 
                        type="text" 
                        name="logo_url" 
                        value={settings.logo_url} 
                        onChange={handleChange} 
                        placeholder="https://example.com/logo.png"
                        style={styles.input}
                    />
                    {settings.logo_url && (
                        <div style={{ marginTop: '0.75rem' }}>
                            <div style={styles.smallText}>Попередній перегляд:</div>
                            <img 
                                src={settings.logo_url} 
                                alt="Прев'ю логотипу" 
                                style={styles.logoPreview}
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/120x120/AAAAAA/FFFFFF?text=Немає+Фото" 
                                }}
                            />
                        </div>
                    )}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Статус сайту:</label>
                    <select 
                        name="status" 
                        value={settings.status} 
                        onChange={handleChange}
                        style={styles.select}
                    >
                        <option value="draft">📝 Чернетка (Draft)</option>
                        <option value="published">🌐 Опубліковано (Published)</option>
                        <option value="suspended" disabled>⏸️ Призупинено (Suspended)</option>
                    </select>
                    <small style={styles.smallText}>
                        {settings.status === 'draft' && 'Сайт видимий тільки вам в редакторі'}
                        {settings.status === 'published' && 'Сайт опублікований і доступний за посиланням'}
                        {settings.status === 'suspended' && 'Сайт призупинений і не доступний для перегляду'}
                    </small>
                </div>

                <button 
                    type="submit" 
                    disabled={isSaving}
                    style={{
                        ...styles.submitButton,
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSaving ? '⏳ Збереження...' : '💾 Зберегти налаштування'}
                </button>
            </form>

            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: 'var(--platform-bg)',
                borderRadius: '8px',
                border: '1px solid var(--platform-border-color)'
            }}>
                <h4 style={{
                    color: 'var(--platform-text-primary)',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    ℹ️ Інформація про сайт
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '0.75rem',
                    fontSize: '0.8rem'
                }}>
                    <div>
                        <div style={{ color: 'var(--platform-text-secondary)' }}>ID сайту</div>
                        <div style={{ color: 'var(--platform-text-primary)', fontWeight: '500' }}>
                            {siteData.id}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--platform-text-secondary)' }}>Дата створення</div>
                        <div style={{ color: 'var(--platform-text-primary)', fontWeight: '500' }}>
                            {siteData.created_at ? new Date(siteData.created_at).toLocaleDateString('uk-UA') : 'Невідомо'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteSettingsTab;
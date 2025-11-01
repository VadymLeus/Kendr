// frontend/src/features/sites/tabs/SiteSettingsTab.jsx
import React, { useState, useEffect } from 'react';

const SiteSettingsTab = ({ siteData, onUpdate }) => {
    // Локальний стан для редагування налаштувань
    const [settings, setSettings] = useState({
        title: siteData.title || '',
        site_path: siteData.site_path || '',
        logo_url: siteData.logo_url || '',
        status: siteData.status || 'draft',
    });
    const [isSaving, setIsSaving] = useState(false);

    // Синхронізація локального стану, якщо siteData змінилися ззовні
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            // Викликаємо функцію оновлення, передану з батьківського компонента (SiteDashboardPage)
            await onUpdate(settings);
            // TODO: Додати повідомлення про успіх
            console.log('Налаштування сайту успішно оновлено!');
        } catch (error) {
            console.error('Помилка оновлення налаштувань:', error);
            // TODO: Відобразити помилку користувачеві
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="site-settings-tab" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid var(--platform-border-color)', borderRadius: '8px', backgroundColor: 'var(--platform-card-bg)' }}>
            <h3>Основні налаштування сайту</h3>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Заголовок сайту (Title):</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={settings.title} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Шлях (URL Path):</label>
                    <input 
                        type="text" 
                        name="site_path" 
                        value={settings.site_path} 
                        onChange={handleChange} 
                        required 
                        pattern="[a-z0-9-]+" 
                        title="Дозволені лише малі латинські літери, цифри та дефіси."
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: 'var(--platform-input-bg-disabled)' }}
                        disabled // Зазвичай site_path не можна редагувати після створення
                    />
                    <small style={{ color: 'var(--platform-text-secondary)' }}>Повний шлях: /site/{siteData.site_path}</small>
                </div>
                
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>URL Логотипу (Logo URL):</label>
                    <input 
                        type="text" 
                        name="logo_url" 
                        value={settings.logo_url} 
                        onChange={handleChange} 
                        placeholder="https://..."
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                    {settings.logo_url && (
                        <img src={settings.logo_url} alt="Прев'ю логотипу" style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/AAAAAA/FFFFFF?text=Немає+Фото" }}/>
                    )}
                </div>
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Статус сайту:</label>
                    <select 
                        name="status" 
                        value={settings.status} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    >
                        <option value="draft">Чернетка (Draft)</option>
                        <option value="published">Опубліковано (Published)</option>
                        <option value="suspended" disabled>Призупинено (Suspended) - лише для адміна</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={isSaving}
                    style={{ 
                        backgroundColor: 'var(--platform-accent)', 
                        color: 'white', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        border: 'none',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    {isSaving ? 'Збереження...' : 'Зберегти налаштування'}
                </button>
            </form>
        </div>
    );
};

export default SiteSettingsTab;
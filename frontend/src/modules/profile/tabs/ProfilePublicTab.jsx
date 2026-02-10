// frontend/src/modules/profile/tabs/ProfilePublicTab.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../../shared/ui/elements'; 
import { Globe, Send, Instagram, Copy, ExternalLink, Eye, EyeOff, Check } from 'lucide-react';

const PublicProfileTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        social_telegram: user.social_telegram || '',
        social_instagram: user.social_instagram || '',
        social_website: user.social_website || '',
        is_profile_public: user.is_profile_public
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiClient.put('/users/profile', formData);
            updateUser(response.data.user);
            toast.success('Публічний профіль оновлено!');
        } catch (e) {
            console.error(e);
            toast.error('Помилка збереження');
        } finally { 
            setIsLoading(false); 
        }
    };

    const profileUrl = `${window.location.origin}/profile/${user.username}`;
    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        toast.info('Посилання скопійовано');
    };

    const openLink = () => {
        window.open(profileUrl, '_blank');
    };

    return (
        <div className="public-profile-container">
            <style>{STYLES}</style>
            <div className="profile-card">
                <div className="status-header">
                    <div className="status-text">
                        <h3 className="section-title">
                            {formData.is_profile_public ? <Eye size={20} className="accent-icon" /> : <EyeOff size={20} />}
                            Статус профілю
                        </h3>
                        <p className="section-desc">
                            {formData.is_profile_public 
                                ? 'Ваш профіль видимий для всіх користувачів.' 
                                : 'Ваш профіль прихований. Його бачите лише ви.'}
                        </p>
                    </div>

                    <label className="toggle-switch">
                        <input 
                            type="checkbox" 
                            name="is_profile_public" 
                            checked={formData.is_profile_public} 
                            onChange={handleChange} 
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                {formData.is_profile_public && (
                    <div className="link-box">
                        <a href={profileUrl} target="_blank" rel="noreferrer" className="profile-link">
                            {profileUrl}
                        </a>
                        <div className="link-actions">
                            <Button 
                                variant="square-accent" 
                                onClick={copyLink} 
                                title="Копіювати посилання"
                                icon={<Copy size={18} />}
                            />
                            <Button 
                                variant="square-accent" 
                                onClick={openLink} 
                                title="Відкрити у новій вкладці"
                                icon={<ExternalLink size={18} />}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="profile-card">
                <h3 className="section-title">
                    <Globe size={20} className="accent-icon" />
                    Соціальні мережі та Біо
                </h3>
                <p className="section-desc">
                    Ця інформація буде відображена на вашій публічній сторінці.
                </p>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="input-group">
                        <label className="input-label">Про себе (Bio)</label>
                        <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange}
                            className="bio-textarea"
                            placeholder="Розкажіть трохи про себе, ваші навички та інтереси..."
                        />
                    </div>
                    
                    <div className="social-grid">
                        <Input 
                            name="social_telegram" 
                            label="Telegram" 
                            value={formData.social_telegram} 
                            onChange={handleChange}
                            icon={<Send size={18} />}
                            placeholder="@username"
                        />
                        <Input 
                            name="social_instagram" 
                            label="Instagram" 
                            value={formData.social_instagram} 
                            onChange={handleChange}
                            icon={<Instagram size={18} />}
                            placeholder="@username"
                        />
                    </div>

                    <Input 
                        name="social_website" 
                        label="Особистий сайт" 
                        value={formData.social_website} 
                        onChange={handleChange}
                        icon={<Globe size={18} />}
                        placeholder="https://mysite.com"
                    />

                    <div className="form-footer">
                        <Button type="submit" disabled={isLoading} icon={isLoading ? null : <Check size={18} />}>
                            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const STYLES = `
    .public-profile-container {
        max-width: 900px;
        margin: 0 auto;
        width: 100%;
    }
    .profile-card {
        background: var(--platform-card-bg);
        border: 1px solid var(--platform-border-color);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--platform-text-primary);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .accent-icon {
        color: var(--platform-accent);
    }
    .section-desc {
        font-size: 0.9rem;
        color: var(--platform-text-secondary);
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }
    
    .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-bottom: 10px;
    }
    .status-text .section-desc {
        margin-bottom: 0;
    }

    .link-box {
        background: var(--platform-bg);
        border: 1px solid var(--platform-border-color);
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        gap: 10px;
    }
    .profile-link {
        font-family: monospace;
        font-size: 0.9rem;
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
        color: var(--platform-accent);
        text-decoration: none;
        flex: 1;
    }
    .link-actions {
        display: flex;
        gap: 8px;
    }

    .profile-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .social-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
    }
    .input-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--platform-text-primary);
        margin-left: 4px;
    }

    .form-footer {
        margin-top: 10px;
        padding-top: 24px;
        border-top: 1px solid var(--platform-border-color);
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .bio-textarea {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid var(--platform-border-color);
        background: var(--platform-input-bg);
        color: var(--platform-text-primary);
        font-size: 0.95rem;
        resize: vertical;
        min-height: 100px;
        max-height: 300px;
        outline: none;
        font-family: inherit;
        transition: border-color 0.2s;
        overflow-y: auto;
        scrollbar-gutter: stable;
    }
    .bio-textarea:focus {
        border-color: var(--platform-accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--platform-accent), transparent 85%);
    }
    
    .bio-textarea::-webkit-scrollbar { width: 8px; height: 8px; }
    .bio-textarea::-webkit-scrollbar-track { background: var(--platform-sidebar-bg); border-radius: 4px; }
    .bio-textarea::-webkit-scrollbar-thumb {
        background-color: var(--platform-text-secondary);
        opacity: 0.5;
        border-radius: 4px;
        border: 2px solid var(--platform-sidebar-bg);
    }
    .bio-textarea::-webkit-scrollbar-thumb:hover { background-color: var(--platform-accent); }

    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .slider {
        position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
        background-color: var(--platform-border-color); transition: .4s; border-radius: 24px;
    }
    .slider:before {
        position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
        background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    input:checked + .slider { background-color: var(--platform-accent); }
    input:checked + .slider:before { transform: translateX(20px); }

    @media (max-width: 600px) {
        .social-grid { grid-template-columns: 1fr; }
    }
`;

export default PublicProfileTab;
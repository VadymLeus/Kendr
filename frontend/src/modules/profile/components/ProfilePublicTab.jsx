// frontend/src/modules/profile/components/ProfilePublicTab.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { 
    Globe, Send, Instagram, Copy, 
    ExternalLink, Eye, EyeOff, Check 
} from 'lucide-react';
import { Input, Button } from '../../../shared/ui/elements';

const PublicProfileTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        social_telegram: user.social_telegram || '',
        social_instagram: user.social_instagram || '',
        social_website: user.social_website || '',
        is_profile_public: user.is_profile_public
    });
    const [isLoading, setIsLoading] = useState(false);

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

    const containerStyle = {
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
    };

    const cardStyle = {
        background: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column'
    };

    const sectionTitleStyle = {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: 'var(--platform-text-primary)',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const sectionDescStyle = {
        fontSize: '0.9rem',
        color: 'var(--platform-text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.5'
    };

    const linkBoxStyle = {
        background: 'var(--platform-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        fontSize: '0.9rem',
        color: 'var(--platform-text-secondary)',
        fontFamily: 'monospace',
        gap: '10px'
    };

    const textareaWrapperStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%'
    };

    const textareaStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.95rem',
        resize: 'vertical',
        minHeight: '100px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--platform-text-primary)',
        marginLeft: '4px'
    };

    return (
        <div style={containerStyle}>
            <style>{`
                .social-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                @media (max-width: 600px) {
                    .social-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .custom-textarea:focus {
                    border-color: var(--platform-accent) !important;
                }
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--platform-border-color);
                    transition: .4s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input:checked + .slider {
                    background-color: var(--platform-accent);
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }
            `}</style>
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                    <div>
                        <h3 style={sectionTitleStyle}>
                            {formData.is_profile_public ? <Eye size={20} color="var(--platform-accent)" /> : <EyeOff size={20} />}
                            Статус профілю
                        </h3>
                        <p style={{...sectionDescStyle, marginBottom: 0}}>
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
                    <div style={linkBoxStyle}>
                        <a 
                            href={profileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                color: 'var(--platform-accent)',
                                textDecoration: 'none',
                                flex: 1
                            }}
                        >
                            {profileUrl}
                        </a>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={copyLink} 
                                title="Копіювати"
                                style={{ padding: '8px', background: 'var(--platform-card-bg)', border: '1px solid var(--platform-border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center' }}
                            >
                                <Copy size={16} />
                            </button>
                            <a 
                                href={profileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Відкрити"
                                style={{ padding: '8px', background: 'var(--platform-card-bg)', border: '1px solid var(--platform-border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center' }}
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                )}
            </div>
            <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>
                    <Globe size={20} style={{ color: 'var(--platform-accent)' }} />
                    Соціальні мережі та Біо
                </h3>
                <p style={sectionDescStyle}>
                    Ця інформація буде відображена на вашій публічній сторінці.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={textareaWrapperStyle}>
                        <label style={labelStyle}>
                            Про себе (Bio)
                        </label>
                        <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange}
                            style={textareaStyle}
                            className="custom-textarea"
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

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            icon={isLoading ? null : <Check size={18} />}
                        >
                            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublicProfileTab;
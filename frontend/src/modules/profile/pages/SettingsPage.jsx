// frontend/src/modules/profile/pages/SettingsPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import ProfileGeneralTab from '../tabs/ProfileGeneralTab';
import ProfileSecurityTab from '../tabs/ProfileSecurityTab';
import ProfileAppearanceTab from '../tabs/ProfileAppearanceTab';
import ProfilePublicTab from '../tabs/ProfilePublicTab';
import { User, Shield, Palette, Globe, Play } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('settings_active_tab');
        return savedTab || 'general';
    });

    useEffect(() => {
        localStorage.setItem('settings_active_tab', activeTab);
    }, [activeTab]);

    const tabs = [
        { id: 'general', label: 'Загальні', icon: <User /> },
        { id: 'security', label: 'Безпека', icon: <Shield /> },
        { id: 'public', label: 'Публічність', icon: <Globe /> },
        { id: 'appearance', label: 'Вигляд', icon: <Palette /> },
    ];

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'var(--platform-bg)', 
            width: '100%',
            margin: 0, 
            padding: 0 
        }}>
            <header className="settings-header">
                <div className="header-left">
                    <div className="page-title">
                        Налаштування
                    </div>
                </div>
                <div className="header-center">
                    <nav className="header-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                title={tab.label}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-text">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="header-right">
                    {user && (
                        <Link 
                            to={`/profile/${user.username}`} 
                            target="_blank"
                            className="preview-btn"
                            title="Переглянути профіль"
                        >
                            <Play />
                            <span className="preview-text">Переглянути</span>
                        </Link>
                    )}
                </div>
            </header>

            <div className="settings-content-wrapper">
                <div className="settings-content-container">
                    {activeTab === 'general' && <ProfileGeneralTab />}
                    {activeTab === 'security' && <ProfileSecurityTab />}
                    {activeTab === 'appearance' && <ProfileAppearanceTab />}
                    {activeTab === 'public' && <ProfilePublicTab />}
                </div>
            </div>

            <style>{`
                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 24px;
                    height: 64px;
                    background-color: var(--platform-card-bg);
                    border-bottom: 1px solid var(--platform-border-color);
                    gap: 20px;
                    position: sticky;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    width: 100%;
                    box-sizing: border-box;
                    color: var(--platform-text-primary);
                }

                .header-left {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    min-width: 200px;
                }

                .page-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--platform-text-primary);
                }

                .header-center {
                    flex-grow: 1;
                    display: flex;
                    justify-content: center;
                    min-width: 0;
                }

                .header-tabs {
                    display: flex;
                    background: var(--platform-bg);
                    padding: 4px;
                    border-radius: 8px;
                    gap: 4px;
                    border: 1px solid var(--platform-border-color);
                }

                .tab-btn {
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 6px;
                    color: var(--platform-text-secondary);
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 36px;
                }

                .tab-btn:hover {
                    color: var(--platform-text-primary);
                    background: rgba(128, 128, 128, 0.1);
                }

                .tab-btn.active {
                    background: var(--platform-card-bg);
                    color: var(--platform-accent);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    font-weight: 600;
                }

                .tab-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                }
                
                .tab-icon svg {
                    width: 100%;
                    height: 100%;
                    fill: currentColor;
                }

                .header-right {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 200px;
                    justify-content: flex-end;
                    }

                .preview-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 20px;
                    height: 40px;
                    background-color: var(--platform-accent);
                    color: var(--platform-accent-text);
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .preview-btn:hover {
                    opacity: 0.9;
                    text-decoration: none;
                    color: var(--platform-accent-text);
                }

                .preview-btn svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .preview-text {
                    font-weight: 500;
                }

                .settings-content-wrapper {
                    flex: 1;
                    width: 100%;
                    background-color: var(--platform-bg);
                    padding: 0;
                    margin: 0;
                }

                .settings-content-container {
                    max-width: 100%;
                    padding: 24px;
                    margin: 0 auto;
                }

                @media (max-width: 1400px) {
                    .header-left, .header-right {
                        min-width: auto;
                        width: auto;
                    }
                    .tab-text { display: none; }
                    .tab-btn { padding: 8px 12px; }
                    .preview-btn span { display: none; }
                    .preview-btn { padding: 0 12px; }
                }

                @media (max-width: 768px) {
                    .settings-header {
                        padding: 0 12px;
                        height: 56px;
                    }
                    .preview-btn {
                        height: 36px;
                        padding: 0 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
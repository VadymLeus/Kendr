// frontend/src/modules/profile/pages/SettingsPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import ProfileGeneralTab from '../tabs/ProfileGeneralTab';
import ProfileSecurityTab from '../tabs/ProfileSecurityTab';
import ProfileAppearanceTab from '../tabs/ProfileAppearanceTab';
import ProfilePublicTab from '../tabs/ProfilePublicTab';
import { User, Shield, Palette, Globe, ExternalLink } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useContext(AuthContext);
    const { isCollapsed } = useOutletContext(); 
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('settings_active_tab');
        return ['general', 'security', 'public', 'appearance'].includes(savedTab) ? savedTab : 'general';
    });

    useEffect(() => {
        localStorage.setItem('settings_active_tab', activeTab);
    }, [activeTab]);

    const tabs = [
        { id: 'general', label: 'Загальні', icon: <User size={18} /> },
        { id: 'security', label: 'Безпека', icon: <Shield size={18} /> },
        { id: 'public', label: 'Публічність', icon: <Globe size={18} /> },
        { id: 'appearance', label: 'Вигляд', icon: <Palette size={18} /> },
    ];
    const leftOffset = isCollapsed ? 'var(--sidebar-collapsed-width, 80px)' : 'var(--sidebar-width, 280px)';
    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'var(--platform-bg)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'left 0.3s cubic-bezier(0.2, 0, 0, 1)',
                zIndex: 10,
                left: leftOffset,
            }}
        >
            <header style={{
                flexShrink: 0,
                height: '64px',
                backgroundColor: 'var(--platform-card-bg)',
                borderBottom: '1px solid var(--platform-border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', minWidth: '150px' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--platform-text-primary)', margin: 0 }}>
                        Налаштування
                    </h1>
                </div>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0, margin: '0 16px', overflowX: 'auto' }} className="hide-scrollbar">
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', backgroundColor: 'var(--platform-bg)', borderRadius: '10px', border: '1px solid var(--platform-border-color)' }}>
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 16px',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: isActive ? 'var(--platform-card-bg)' : 'transparent',
                                        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                        boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if(!isActive) {
                                            e.currentTarget.style.backgroundColor = 'var(--platform-hover-bg)';
                                            e.currentTarget.style.color = 'var(--platform-text-primary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if(!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--platform-text-secondary)';
                                        }
                                    }}
                                >
                                    {tab.icon}
                                    <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }} className="sm:inline">{tab.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '150px', gap: '12px' }}>
                    {user && (
                        <Link 
                            to={`/profile/${user.username}`} 
                            target="_blank"
                            className="btn btn-primary"
                            style={{ 
                                textDecoration: 'none', 
                                height: '36px',
                                fontSize: '0.875rem'
                            }}
                            title="Відкрити профіль у новій вкладці"
                        >
                            <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }} className="sm:inline">Мій профіль</span>
                            <ExternalLink size={16} />
                        </Link>
                    )}
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                <div style={{ maxWidth: '896px', margin: '0 auto', padding: '24px 32px' }}>
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        {activeTab === 'general' && <ProfileGeneralTab />}
                        {activeTab === 'security' && <ProfileSecurityTab />}
                        {activeTab === 'appearance' && <ProfileAppearanceTab />}
                        {activeTab === 'public' && <ProfilePublicTab />}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .sm\\:inline { display: inline !important; }
                @media (max-width: 640px) {
                    .sm\\:inline { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
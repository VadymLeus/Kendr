// frontend/src/modules/profile/pages/SettingsPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import ProfileGeneralTab from '../tabs/ProfileGeneralTab';
import ProfileSecurityTab from '../tabs/ProfileSecurityTab';
import ProfileAppearanceTab from '../tabs/ProfileAppearanceTab';
import ProfilePublicTab from '../tabs/ProfilePublicTab';
import { User, Shield, Palette, Globe, ExternalLink } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useContext(AuthContext);
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('settings_active_tab');
        const allowedTabs = isStaff 
            ? ['general', 'security', 'appearance'] 
            : ['general', 'security', 'public', 'appearance'];
            
        return allowedTabs.includes(savedTab) ? savedTab : 'general';
    });

    useEffect(() => {
        localStorage.setItem('settings_active_tab', activeTab);
    }, [activeTab]);

    const tabs = [
        { id: 'general', label: 'Загальні', icon: <User /> },
        { id: 'security', label: 'Безпека', icon: <Shield /> },
        ...(isStaff ? [] : [{ id: 'public', label: 'Публічність', icon: <Globe /> }]),
        { id: 'appearance', label: 'Вигляд', icon: <Palette /> },
    ];

    return (
        <div className="-m-4 sm:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] min-h-[calc(100vh-64px+4rem)] flex flex-col bg-(--platform-bg)"> 
            <header className="sticky top-0 z-50 bg-(--platform-card-bg) border-b border-(--platform-border-color) h-(--header-height,60px) px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-300">
                <div className="flex-1 min-w-0"></div>
                <div className="flex-initial flex justify-center min-w-0">
                    <nav className="flex bg-(--platform-bg) p-1 rounded-lg gap-1 border border-(--platform-border-color) overflow-hidden shadow-sm">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium border-none cursor-pointer transition-all duration-200 min-h-8 sm:min-h-9 whitespace-nowrap outline-none
                                        ${isActive 
                                            ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-[0_1px_3px_rgba(0,0,0,0.1)] font-semibold' 
                                            : 'bg-transparent text-(--platform-text-secondary) hover:bg-(--platform-hover-bg) hover:text-(--platform-text-primary)'
                                        }
                                    `}
                                    title={tab.label}
                                >
                                    <span className="flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0">
                                        {React.cloneElement(tab.icon, { 
                                            className: 'w-full h-full fill-none stroke-current stroke-2' 
                                        })}
                                    </span>
                                    <span className="hidden xl:inline-block mt-px">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-1 flex items-center justify-end min-w-0 gap-2">
                    {user && !isStaff && (
                        <Link 
                            to={`/profile/${user.slug}`} 
                            target="_blank"
                            title="Мій профіль"
                            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-secondary) hover:bg-(--platform-card-bg) hover:text-(--platform-accent) hover:border-(--platform-accent) transition-all no-underline shrink-0"
                        >
                            <ExternalLink className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                        </Link>
                    )}
                </div>
            </header>
            <div className="flex-1 pb-8">
                <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8">
                    <div className="animate-fade-in-up">
                        {activeTab === 'general' && <ProfileGeneralTab />}
                        {activeTab === 'security' && <ProfileSecurityTab />}
                        {activeTab === 'appearance' && <ProfileAppearanceTab />}
                        {!isStaff && activeTab === 'public' && <ProfilePublicTab />}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-in-out;
                }
                @media (max-width: 1100px) {
                    .xl\\:inline-block {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .sticky {
                        height: 56px;
                        padding: 0 12px;
                        gap: 8px;
                    }
                }
                @media (max-width: 480px) {
                    .sticky {
                        padding: 0 8px;
                        gap: 4px;
                    }
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
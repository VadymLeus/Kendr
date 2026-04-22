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
        { id: 'general', label: 'Загальні', icon: <User size={18} className="md:w-4 md:h-4" /> },
        { id: 'security', label: 'Безпека', icon: <Shield size={18} className="md:w-4 md:h-4" /> },
        ...(isStaff ? [] : [{ id: 'public', label: 'Публічність', icon: <Globe size={18} className="md:w-4 md:h-4" /> }]),
        { id: 'appearance', label: 'Вигляд', icon: <Palette size={18} className="md:w-4 md:h-4" /> },
    ];

    return (
        <div className="flex flex-col -m-6 md:-m-8 min-h-[calc(100%+3rem)] md:min-h-[calc(100%+4rem)]">
            <header className="shrink-0 bg-(--platform-card-bg) border-b border-(--platform-border-color) sticky top-0 z-20 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-0 min-h-18 md:min-h-16 gap-4 md:gap-0 shadow-sm md:shadow-none">
                <div className="relative flex items-center justify-center w-full md:w-auto md:flex-1 md:justify-start min-h-11 md:min-h-auto">
                    <h1 className="text-xl font-bold text-(--platform-text-primary) m-0 leading-none text-center w-full md:text-left md:w-auto">
                        Налаштування
                    </h1>
                    {user && !isStaff && (
                        <Link 
                            to={`/profile/${user.slug}`} 
                            target="_blank"
                            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-xl bg-(--platform-accent) text-white no-underline shadow-sm transition-opacity hover:opacity-90"
                        >
                            <ExternalLink size={20} />
                        </Link>
                    )}
                </div>
                <div className="w-full md:w-auto flex justify-start md:justify-center overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                    <nav className="flex items-center gap-1 md:gap-1.5 p-1.5 md:p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color) min-w-max mx-auto shadow-inner">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 md:gap-1.5 px-4 md:px-4 py-2.5 md:py-1.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer whitespace-nowrap min-h-11 md:min-h-9 ${
                                        isActive 
                                            ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
                                            : 'bg-transparent text-(--platform-text-secondary) hover:bg-(--platform-hover-bg) hover:text-(--platform-text-primary)'
                                    }`}
                                    title={tab.label}
                                >
                                    <span className="flex items-center justify-center">{tab.icon}</span>
                                    <span className="hidden sm:inline-block mt-px">{tab.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>
                <div className="hidden md:flex items-center justify-end md:flex-1">
                    {user && !isStaff && (
                        <Link 
                            to={`/profile/${user.slug}`} 
                            target="_blank"
                            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-(--platform-accent) hover:opacity-90 text-white text-sm font-medium no-underline transition-opacity shadow-sm"
                        >
                            <span className="hidden lg:inline-block">Мій профіль</span>
                            <ExternalLink size={16} />
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
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
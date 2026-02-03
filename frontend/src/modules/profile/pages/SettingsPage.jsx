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

    return (
        <div 
            className="fixed top-0 right-0 bottom-0 bg-(--platform-bg) flex flex-col transition-[left] duration-300 ease-in-out z-10"
            style={{
                left: 'var(--sidebar-width, 80px)',
            }}
        >
            <header className="shrink-0 h-16 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex items-center justify-between px-6 shadow-sm z-20">
                <div className="flex items-center min-w-37.5">
                    <h1 className="text-xl font-bold text-(--platform-text-primary) m-0">
                        Налаштування
                    </h1>
                </div>
                <div className="flex-1 flex justify-center min-w-0 mx-4 overflow-x-auto hide-scrollbar">
                    <nav className="flex items-center gap-1 p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-sm' 
                                        : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary) hover:bg-gray-100 dark:hover:bg-white/5'
                                    }
                                `}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center justify-end min-w-37.5 gap-3">
                    {user && (
                        <Link 
                            to={`/profile/${user.username}`} 
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 h-9 rounded-lg bg-(--platform-accent) text-white! no-underline! text-sm font-semibold hover:text-white! hover:opacity-90 transition-opacity"
                            title="Відкрити профіль у новій вкладці"
                        >
                            <span className="hidden sm:inline">Мій профіль</span>
                            <ExternalLink size={16} />
                        </Link>
                    )}
                </div>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-6 md:p-8">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'general' && <ProfileGeneralTab />}
                        {activeTab === 'security' && <ProfileSecurityTab />}
                        {activeTab === 'appearance' && <ProfileAppearanceTab />}
                        {activeTab === 'public' && <ProfilePublicTab />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
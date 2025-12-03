// frontend/src/modules/profile/pages/SettingsPage.jsx
import React, { useState } from 'react';
import ProfileSettingsTab from '../components/ProfileSettingsTab';
import InterfaceSettingsTab from '../components/InterfaceSettingsTab';
const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const containerStyle = {
        maxWidth: '1000px',
        margin: 'auto',
        padding: '2rem 1rem'
    };

    const tabsContainerStyle = {
        borderBottom: '1px solid var(--platform-border-color)',
        marginBottom: '2rem',
        display: 'flex'
    };

    const tabStyle = (isActive) => ({
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: isActive ? 'bold' : 'normal',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        borderBottom: isActive ? '3px solid var(--platform-accent)' : '3px solid transparent',
        marginBottom: '-1px',
        transition: 'all 0.2s ease'
    });

    return (
        <div style={containerStyle}>
            <h1 style={{ color: 'var(--platform-text-primary)', marginBottom: '2rem' }}>
                Налаштування
            </h1>

            <div style={tabsContainerStyle}>
                <button 
                    style={tabStyle(activeTab === 'profile')} 
                    onClick={() => setActiveTab('profile')}
                >
                    Профіль
                </button>
                <button 
                    style={tabStyle(activeTab === 'interface')} 
                    onClick={() => setActiveTab('interface')}
                >
                    Інтерфейс
                </button>
            </div>

            <div>
                {activeTab === 'profile' && <ProfileSettingsTab />}
                {activeTab === 'interface' && <InterfaceSettingsTab />}
            </div>
        </div>
    );
};

export default SettingsPage;
// frontend/src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import ProfileSettingsTab from '../features/profile/tabs/ProfileSettingsTab';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            <h1>Налаштування</h1>

            {/* Навігація по вкладках */}
            <div style={{ borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
                <button 
                    style={tabStyle(activeTab === 'profile')} 
                    onClick={() => setActiveTab('profile')}
                >
                    Профіль
                </button>
                {/* Тут у майбутньому можна додати інші вкладки, наприклад, "Інтерфейс" */}
            </div>

            {/* Вміст вкладок */}
            <div>
                {activeTab === 'profile' && <ProfileSettingsTab />}
            </div>
        </div>
    );
};

const tabStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#242060' : '#555',
    borderBottom: isActive ? '3px solid #242060' : '3px solid transparent',
});

export default SettingsPage;
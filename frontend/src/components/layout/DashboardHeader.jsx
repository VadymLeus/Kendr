// frontend/src/components/layout/DashboardHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const tabStyle = (isActive, isMobile) => ({
    padding: isMobile ? '1rem' : '1rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
    borderBottom: isActive ? '3px solid var(--platform-accent)' : '3px solid transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 0 : '0.5rem'
});

const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem 0 1.5rem',
    background: 'var(--platform-card-bg)',
    borderBottom: '1px solid var(--platform-border-color)',
    height: '65px',
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    width: '100%',
    boxSizing: 'border-box'
};

const DashboardHeader = ({ siteData, activeTab, onTabChange }) => {
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { key: 'editor', icon: '📝', text: 'Редактор сторінок' },
        { key: 'pages', icon: '📄', text: 'Сторінки' },
        { key: 'shop', icon: '🛒', text: 'Товари' },
        { key: 'theme', icon: '🎨', text: 'Тема' },
        { key: 'submissions', icon: '✉️', text: 'Заявки' },
        { key: 'settings', icon: '⚙️', text: 'Налаштування' }
    ];

    return (
        <header style={headerStyle}>
            <nav style={{ display: 'flex', height: '100%', overflowX: 'auto', flex: 1, justifyContent: 'center' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        style={tabStyle(activeTab === tab.key, isMobile)}
                        onClick={() => onTabChange(tab.key)}
                        title={tab.text}
                    >
                        <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                        {!isMobile && <span>{tab.text}</span>}
                    </button>
                ))}
            </nav>

            <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '150px' }}>
                <a
                    href={`/site/${siteData.site_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}
                >
                    <span style={{lineHeight: 1}}>👁️</span>
                    <span>Переглянути</span>
                </a>
            </div>
        </header>
    );
};

export default DashboardHeader;
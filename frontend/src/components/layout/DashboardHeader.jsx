// frontend/src/components/layout/DashboardHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const tabStyle = (isActive, isMobile) => ({
    padding: isMobile ? '1rem' : '1rem 1.2rem',
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
    const [isCompactMode, setIsCompactMode] = useState(window.innerWidth < 1280);

    useEffect(() => {
        const handleResize = () => {
            setIsCompactMode(window.innerWidth < 1280);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { key: 'editor', icon: '📝', text: 'Редактор' },
        { key: 'pages', icon: '📄', text: 'Сторінки' },
        { key: 'shop', icon: '🛒', text: 'Товари' },
        { key: 'theme', icon: '🎨', text: 'Тема' },
        { key: 'submissions', icon: '✉️', text: 'Заявки' },
        { key: 'settings', icon: '⚙️', text: 'Налаштування' }
    ];

    const viewButtonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        background: 'linear-gradient(135deg, var(--platform-accent) 0%, var(--platform-accent-hover) 100%)',
        color: '#ffffff',
        borderRadius: '30px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.9rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: 'none'
    };

    return (
        <header style={headerStyle}>
            <nav 
                className="no-scrollbar"
                style={{ 
                    display: 'flex', 
                    height: '100%', 
                    overflowX: 'auto', 
                    flex: 1, 
                    alignItems: 'center'
                }}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        style={tabStyle(activeTab === tab.key, isCompactMode)}
                        onClick={() => onTabChange(tab.key)}
                        title={tab.text}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                        {!isCompactMode && <span>{tab.text}</span>}
                    </button>
                ))}
            </nav>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '1rem' }}>
                <a
                    href={`/site/${siteData.site_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={viewButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>👁️</span>
                    {!isCompactMode && <span>Переглянути</span>}
                </a>
            </div>
        </header>
    );
};

export default DashboardHeader;
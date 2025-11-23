// frontend/src/components/layout/DashboardHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ siteData, activeTab, onTabChange }) => {
    
    const tabs = [
        { key: 'editor', icon: '🖥️', text: 'Редактор' },
        { key: 'pages', icon: '📄', text: 'Сторінки' },
        { key: 'store', icon: '🛍️', text: 'Магазин' },
        { key: 'theme', icon: '🎨', text: 'Тема' },
        { key: 'crm', icon: '📬', text: 'Заявки' },
        { key: 'settings', icon: '⚙️', text: 'Налаштування' }
    ];

    return (
        <div className="dashboard-tabs-container">
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid var(--platform-border-color)'
            }}>
                <div style={{ fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                    {siteData.title}
                </div>
                <a
                    href={`/site/${siteData.site_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                    style={{ 
                        padding: '4px 12px', 
                        fontSize: '0.8rem',
                        borderRadius: '20px',
                        textDecoration: 'none'
                    }}
                >
                    👁️ Переглянути
                </a>
            </div>

            <nav className="dashboard-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`dashboard-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.key)}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.text}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default DashboardHeader;

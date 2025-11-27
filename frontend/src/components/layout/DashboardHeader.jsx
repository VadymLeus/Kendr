// frontend/src/components/layout/DashboardHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ 
    siteData, 
    activeTab, 
    onTabChange,
    // Нові пропси
    undo,
    redo,
    canUndo,
    canRedo
}) => {
    
    const tabs = [
        { key: 'editor', icon: '🖥️', text: 'Редактор' },
        { key: 'pages', icon: '📄', text: 'Сторінки' },
        { key: 'store', icon: '🛍️', text: 'Магазин' },
        { key: 'theme', icon: '🎨', text: 'Тема' },
        { key: 'crm', icon: '📬', text: 'Заявки' },
        { key: 'settings', icon: '⚙️', text: 'Налаштування' }
    ];

    const historyButtonStyle = (disabled) => ({
        background: 'transparent',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '4px',
        color: disabled ? 'var(--platform-text-secondary)' : 'var(--platform-text-primary)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
        padding: '4px 8px',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    });

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {activeTab === 'editor' && (
                        <div style={{ display: 'flex', gap: '4px', marginRight: '10px', borderRight: '1px solid var(--platform-border-color)', paddingRight: '14px' }}>
                            <button 
                                style={historyButtonStyle(!canUndo)}
                                onClick={undo}
                                disabled={!canUndo}
                                title="Скасувати (Ctrl+Z)"
                            >
                                ↩️
                            </button>
                            <button 
                                style={historyButtonStyle(!canRedo)}
                                onClick={redo}
                                disabled={!canRedo}
                                title="Повернути (Ctrl+Y)"
                            >
                                ↪️
                            </button>
                        </div>
                    )}

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
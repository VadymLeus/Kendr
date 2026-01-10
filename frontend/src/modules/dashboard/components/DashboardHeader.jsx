// frontend/src/modules/dashboard/components/DashboardHeader.jsx
import React from 'react';
import { 
    IconUndo, 
    IconRedo, 
    IconPlay, 
    IconEdit, 
    IconPages, 
    IconShop, 
    IconPalette, 
    IconMail, 
    IconSettings 
} from '../../../shared/ui/elements/Icons';

const DashboardHeader = ({ 
    siteData, 
    activeTab, 
    onTabChange,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving 
}) => {
    
    const tabs = [
        { key: 'editor', icon: <IconEdit />, text: 'Редактор' },
        { key: 'pages', icon: <IconPages />, text: 'Сторінки' },
        { key: 'store', icon: <IconShop />, text: 'Магазин' },
        { key: 'theme', icon: <IconPalette />, text: 'Тема' },
        { key: 'crm', icon: <IconMail />, text: 'Заявки' },
        { key: 'settings', icon: <IconSettings />, text: 'Налаштування' }
    ];

    return (
        <header className="editor-header">
            
            <div className="header-left">
                <div style={{display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '150px'}}>
                    <div className="site-title" title={siteData.title}>
                        {siteData.title || 'Мій сайт'}
                    </div>
                    
                    <div className="save-indicator">
                        {isSaving ? (
                             <div className="saving-state">
                                <span className="animate-spin">⟳</span> 
                                <span className="indicator-text">Збереження...</span>
                             </div>
                        ) : (
                             <div className="saved-state">
                                <span className="check-icon">✓</span> 
                                <span className="indicator-text">Збережено</span>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="header-center">
                <nav className="editor-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.key)}
                            title={tab.text}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-text">{tab.text}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="header-right">
                
                {activeTab === 'editor' && (
                    <div className="undo-redo-container">
                        <button 
                            className="action-btn" 
                            onClick={undo} 
                            disabled={!canUndo} 
                            title="Скасувати (Ctrl+Z)"
                        >
                            <IconUndo />
                        </button>
                        <button 
                            className="action-btn" 
                            onClick={redo} 
                            disabled={!canRedo} 
                            title="Повернути (Ctrl+Y)"
                        >
                            <IconRedo />
                        </button>
                    </div>
                )}

                <a 
                    href={`/site/${siteData.site_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="preview-btn"
                    title="Відкрити сайт у новій вкладці"
                >
                    <IconPlay />
                    <span className="preview-text">Переглянути</span>
                </a>
            </div>

            <style>{`
                .editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 24px;
                    height: 64px;
                    background-color: var(--platform-card-bg);
                    border-bottom: 1px solid var(--platform-border-color);
                    gap: 20px;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    color: var(--platform-text-primary);
                    transition: background-color 0.3s ease, border-color 0.3s ease;
                }

                .header-left {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    min-width: 200px;
                }

                .site-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--platform-text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 180px;
                }

                .save-indicator {
                    margin-top: 2px;
                    min-width: 120px;
                }

                .saving-state, .saved-state {
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                    height: 18px;
                }

                .saving-state {
                    color: var(--platform-accent);
                }

                .saved-state {
                    color: var(--platform-text-secondary);
                    opacity: 0.8;
                }

                .check-icon {
                    color: var(--platform-success);
                    font-weight: bold;
                }

                .indicator-text {
                    white-space: nowrap;
                }

                .animate-spin {
                    display: inline-block;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    100% { 
                        transform: rotate(360deg); 
                    }
                }

                .header-center {
                    flex-grow: 1;
                    display: flex;
                    justify-content: center;
                    min-width: 0;
                }

                .editor-tabs {
                    display: flex;
                    background: var(--platform-bg);
                    padding: 4px;
                    border-radius: 8px;
                    gap: 4px;
                    border: 1px solid var(--platform-border-color);
                }

                .tab-btn {
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 6px;
                    color: var(--platform-text-secondary);
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 36px;
                }

                .tab-btn:hover {
                    color: var(--platform-text-primary);
                    background: rgba(128, 128, 128, 0.1);
                }

                .tab-btn.active {
                    background: var(--platform-card-bg);
                    color: var(--platform-accent);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    font-weight: 600;
                }

                .tab-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                }

                .tab-icon svg {
                    width: 100%;
                    height: 100%;
                    fill: currentColor;
                }

                .tab-text {
                    font-weight: 500;
                }

                .header-right {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 200px;
                    justify-content: flex-end;
                }

                .undo-redo-container {
                    display: flex;
                    gap: 4px;
                    margin-right: 12px;
                    padding-right: 12px;
                    border-right: 1px solid var(--platform-border-color);
                    min-width: 86px;
                    justify-content: center;
                }

                .action-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid var(--platform-border-color);
                    background: var(--platform-bg);
                    color: var(--platform-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 0;
                }

                .action-btn:hover:not(:disabled) {
                    background: var(--platform-card-bg);
                    border-color: var(--platform-text-primary);
                    color: var(--platform-text-primary);
                }

                .action-btn:disabled {
                    opacity: 0.4;
                    cursor: default;
                }

                .action-btn svg {
                    width: 18px;
                    height: 18px;
                    fill: currentColor;
                }

                .preview-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 20px;
                    height: 40px;
                    background-color: var(--platform-accent);
                    color: var(--platform-accent-text);
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .preview-btn:hover {
                    opacity: 0.9;
                    text-decoration: none;
                }

                .preview-btn svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .preview-text {
                    font-weight: 500;
                }

                @media (max-width: 1600px) {
                    .header-left,
                    .header-right {
                        width: auto;
                        min-width: auto;
                    }
                    
                    .tab-text {
                        display: none;
                    }
                    
                    .tab-btn {
                        padding: 8px 12px;
                        font-size: 1.2rem;
                    }
                    
                    .preview-btn span {
                        display: none;
                    }
                    
                    .preview-btn {
                        padding: 0 12px;
                    }
                }

                @media (max-width: 600px) {
                    .site-title {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .editor-header {
                        padding: 0 12px;
                        height: 56px;
                    }

                    .tab-btn {
                        padding: 6px 10px;
                        font-size: 12px;
                    }

                    .preview-btn {
                        height: 36px;
                        padding: 0 10px;
                    }

                    .action-btn {
                        width: 32px;
                        height: 32px;
                    }

                    .undo-redo-container {
                        min-width: 72px;
                        margin-right: 8px;
                        padding-right: 8px;
                    }
                }

                @media (max-width: 480px) {
                    .editor-header {
                        padding: 0 8px;
                        gap: 8px;
                    }

                    .tab-btn {
                        padding: 4px 8px;
                    }

                    .tab-icon {
                        width: 16px;
                        height: 16px;
                    }

                    .preview-btn svg {
                        width: 14px;
                        height: 14px;
                    }

                    .action-btn svg {
                        width: 16px;
                        height: 16px;
                    }
                }
            `}</style>
        </header>
    );
};

export default DashboardHeader;
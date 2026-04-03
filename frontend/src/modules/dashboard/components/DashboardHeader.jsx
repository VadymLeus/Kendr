// frontend/src/modules/dashboard/components/DashboardHeader.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import { Undo, Redo, Play, Edit, FileText, Palette, Mail, Settings, ShoppingBag, Monitor, Smartphone, PenTool, Eye, BarChart2 } from 'lucide-react';
import Switch from '../../../shared/ui/elements/Switch';

const DashboardHeader = ({ 
    siteData, 
    activeTab, 
    onTabChange,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    viewMode,
    onViewModeChange,
    onUpdateConfig,
    isReadOnly 
}) => {
    const { user } = useContext(AuthContext);
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const hiddenTabs = siteData?.dashboard_config?.hiddenTabs || [];
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allTabs = [
        { key: 'editor', icon: <Edit />, text: 'Редактор', unhideable: true },
        { key: 'pages', icon: <FileText />, text: 'Сторінки' },
        { key: 'theme', icon: <Palette />, text: 'Стилі' },
        { key: 'store', icon: <ShoppingBag />, text: 'Комерція' },
        { key: 'analytics', icon: <BarChart2 />, text: 'Аналітика' },
        { key: 'crm', icon: <Mail />, text: 'Заявки' },
        { key: 'settings', icon: <Settings />, text: 'Налаштування', unhideable: true }
    ];

    const tabs = allTabs.filter(tab => {
        if (!tab.unhideable && hiddenTabs.includes(tab.key)) return false;
        return true;
    });

    const handleToggleTab = (tabKey) => {
        const newHiddenTabs = hiddenTabs.includes(tabKey)
            ? hiddenTabs.filter(k => k !== tabKey)
            : [...hiddenTabs, tabKey];
            
        onUpdateConfig({ 
            dashboard_config: { ...(siteData.dashboard_config || {}), hiddenTabs: newHiddenTabs } 
        });
    };

    return (
        <header className="editor-header relative">
            <div className="header-left">
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px'}}>
                    <div className="site-title" title={siteData.title}>
                        {siteData.title || 'Мій сайт'}
                    </div>
                    <div className="save-indicator">
                        {isSaving ? (
                             <div className="saving-state" title="Зберігаємо ваші зміни...">
                                <span className="animate-spin">⟳</span> 
                                <span className="indicator-text">Збереження...</span>
                             </div>
                        ) : (
                             <div className="saved-state" title="Всі зміни збережено">
                                <span className="check-icon">✓</span> 
                                <span className="indicator-text">Збережено</span>
                             </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="header-center relative">
                <div className="flex items-center gap-2" ref={menuRef}>
                    <button 
                        className={`visibility-btn ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        title="Налаштувати видимість вкладок"
                    >
                        <Eye size={18} />
                    </button>
                    {isMenuOpen && (
                        <div className="visibility-menu animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-(--platform-border-color)">
                                <h4 className="m-0 text-sm font-semibold text-(--platform-text-primary)">Видимість вкладок</h4>
                            </div>
                            <div className="p-2 flex flex-col gap-1 max-h-96 overflow-y-auto">
                                {allTabs.map(tab => {
                                    if (tab.unhideable) return null;
                                    return (
                                        <div key={tab.key} className="flex items-center justify-between p-2 hover:bg-(--platform-hover-bg) rounded-lg transition-colors">
                                            <div className="flex items-center gap-2 text-sm text-(--platform-text-primary)">
                                                <span className="opacity-70 flex items-center justify-center w-4 h-4">{tab.icon}</span>
                                                {tab.text}
                                            </div>
                                            <Switch 
                                                checked={!hiddenTabs.includes(tab.key)} 
                                                onChange={() => handleToggleTab(tab.key)} 
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
            </div>
            <div className="header-right">
                {activeTab === 'editor' && (
                    <>
                        <div className="view-mode-toggle">
                            <button
                                className={`mode-btn ${viewMode === 'editor' ? 'active' : ''}`}
                                onClick={() => onViewModeChange('editor')}
                                title="Режим редактора"
                            >
                                <PenTool size={16} />
                            </button>
                            <button
                                className={`mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
                                onClick={() => onViewModeChange('desktop')}
                                title="ПК версія"
                            >
                                <Monitor size={16} />
                            </button>
                            <button
                                className={`mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
                                onClick={() => onViewModeChange('mobile')}
                                title="Мобільна версія"
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>
                        <div className="undo-redo-container">
                            <button className="action-btn" onClick={undo} disabled={!canUndo} title="Скасувати (Ctrl+Z)"><Undo /></button>
                            <button className="action-btn" onClick={redo} disabled={!canRedo} title="Повернути (Ctrl+Y)"><Redo /></button>
                        </div>
                    </>
                )}
                <a href={`/site/${siteData.site_path}`} target="_blank" rel="noopener noreferrer" className="preview-btn" title="Відкрити сайт у новій вкладці">
                    <Play size={16} />
                    <span className="preview-text">Переглянути</span>
                </a>
            </div>
            <style>{`
                .visibility-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid var(--platform-border-color);
                    background: var(--platform-bg);
                    color: var(--platform-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .visibility-btn:hover, .visibility-btn.active {
                    color: var(--platform-accent);
                    border-color: var(--platform-accent);
                    background: var(--platform-card-bg);
                }
                .visibility-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    width: 240px;
                    background: var(--platform-card-bg);
                    border: 1px solid var(--platform-border-color);
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    z-index: 100;
                    text-align: left;
                }
                .editor-header { display: flex; justify-content: space-between; align-items: center; padding: 0 24px; height: var(--header-height); background-color: var(--platform-card-bg); border-bottom: 1px solid var(--platform-border-color); gap: 20px; position: sticky; top: 0; z-index: 90; color: var(--platform-text-primary); transition: background-color 0.3s ease, border-color 0.3s ease; }
                .header-left { flex-shrink: 0; display: flex; align-items: center; min-width: 200px; }
                .site-title { font-size: 16px; font-weight: 600; color: var(--platform-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
                .save-indicator { min-width: 120px; display: flex; align-items: center; }
                .saving-state, .saved-state { 
                    font-size: 11.5px; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 4px; 
                    font-weight: 600; 
                    height: 22px; 
                    padding: 0 8px;
                    border-radius: 12px;
                    letter-spacing: 0.2px;
                    transition: all 0.3s ease;
                }
                .saving-state { 
                    color: var(--platform-accent); 
                    background: color-mix(in srgb, var(--platform-accent), transparent 90%); 
                    border: 1px solid color-mix(in srgb, var(--platform-accent), transparent 80%);
                }
                .saved-state { 
                    color: var(--platform-accent); 
                    background: color-mix(in srgb, var(--platform-accent), transparent 90%);
                    border: 1px solid color-mix(in srgb, var(--platform-accent), transparent 85%);
                }
                .check-icon { font-weight: bold; font-size: 13px; }
                .animate-spin { display: inline-block; animation: spin 1s linear infinite; font-size: 14px; margin-bottom: 1px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .header-center { flex-grow: 1; display: flex; justify-content: center; min-width: 0; }
                .editor-tabs { display: flex; background: var(--platform-bg); padding: 4px; border-radius: 8px; gap: 4px; border: 1px solid var(--platform-border-color); }
                .tab-btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 6px; color: var(--platform-text-secondary); border: none; background: transparent; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 36px; }
                .tab-btn:hover { color: var(--platform-text-primary); background: var(--platform-hover-bg); }
                .tab-btn.active { background: var(--platform-card-bg); color: var(--platform-accent); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); font-weight: 600; }
                .tab-icon { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; }
                .tab-icon svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
                .tab-text { font-weight: 500; }
                .header-right { flex-shrink: 0; display: flex; align-items: center; gap: 12px; min-width: 200px; justify-content: flex-end; }
                .view-mode-toggle { display: flex; background: var(--platform-bg); padding: 4px; border-radius: 8px; gap: 2px; border: 1px solid var(--platform-border-color); margin-right: 12px; }
                .mode-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s ease; }
                .mode-btn:hover { color: var(--platform-text-primary); background: var(--platform-hover-bg); }
                .mode-btn.active { background: var(--platform-card-bg); color: var(--platform-accent); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
                .undo-redo-container { display: flex; gap: 4px; margin-right: 12px; padding-right: 12px; border-right: 1px solid var(--platform-border-color); min-width: 86px; justify-content: center; }
                .action-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--platform-border-color); background: var(--platform-bg); color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s; padding: 0; }
                .action-btn:hover:not(:disabled) { background: var(--platform-card-bg); border-color: var(--platform-accent); color: var(--platform-accent); }
                .action-btn:disabled { opacity: 0.4; cursor: default; }
                .action-btn svg { width: 18px; height: 18px; }
                .preview-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 12px; height: 38px; background-color: var(--platform-accent); color: var(--platform-accent-text); border-radius: 8px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; text-decoration: none; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: background-color 0.2s ease; }
                .preview-btn:hover { text-decoration: none; background-color: var(--platform-accent-hover); color: var(--platform-accent-text); }
                .preview-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; }
                .preview-text { font-weight: 600; }
                @media (max-width: 1800px) { .header-left, .header-right { width: auto; min-width: auto; } .tab-text { display: none; } .tab-btn { padding: 8px 12px; font-size: 1.2rem; } .preview-btn span { display: none; } .preview-btn { padding: 0 12px; width: 38px; } }
                @media (max-width: 600px) { .site-title { display: none; } }
                @media (max-width: 768px) { .editor-header { padding: 0 12px; height: 56px; } .tab-btn { padding: 6px 10px; font-size: 12px; } .action-btn { width: 32px; height: 32px; } .undo-redo-container { min-width: 72px; margin-right: 8px; padding-right: 8px; } .preview-btn { height: 32px; width: 32px; padding: 0; } .view-mode-toggle { display: none; } .visibility-btn { display: none; } }
                @media (max-width: 480px) { .editor-header { padding: 0 8px; gap: 8px; } .tab-btn { padding: 4px 8px; } .tab-icon { width: 16px; height: 16px; } .action-btn svg { width: 16px; height: 16px; } }
            `}</style>
        </header>
    );
};

export default DashboardHeader;
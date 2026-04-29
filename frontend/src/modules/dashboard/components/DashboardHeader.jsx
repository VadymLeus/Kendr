// frontend/src/modules/dashboard/components/DashboardHeader.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import Switch from '../../../shared/ui/elements/Switch';
import { Undo, Redo, Play, Edit, Palette, Settings, ShoppingBag, Monitor, Smartphone, PenTool, Eye, BarChart2, Save, RotateCcw, Loader2 } from 'lucide-react';

const DashboardHeader = ({ 
    siteData, 
    activeTab, 
    onTabChange,
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    hasChanges,
    onSave,
    onDiscardChanges,
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
        { key: 'theme', icon: <Palette />, text: 'Стилі' },
        { key: 'commerce', icon: <ShoppingBag />, text: 'Комерція' },
        { key: 'overview', icon: <BarChart2 />, text: 'Огляд' }, 
        { key: 'settings', icon: <Settings />, text: 'Загальні', unhideable: true }
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
                <div className="site-info-wrapper">
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
            <div className="header-center">
                <div className="flex items-center gap-2 relative" ref={menuRef}>
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
                    <nav className="main-header-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                className={`main-header-tab-btn main-header-tab-btn-${tab.key} ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => onTabChange(tab.key)}
                                title={typeof tab.text === 'string' ? tab.text : ''}
                            >
                                <span className="main-header-tab-icon">{tab.icon}</span>
                                <span className="main-header-tab-text">{tab.text}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="header-right">
                <div className={`editor-tools-wrapper ${activeTab === 'editor' ? 'is-active' : ''}`}>
                    <div className="view-mode-toggle shrink-0">
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
                    <div className="editor-actions-group shrink-0">
                        <button className="action-btn history-btn" onClick={undo} disabled={!canUndo} title="Скасувати (Ctrl+Z)">
                            <Undo />
                        </button>
                        <button className="action-btn history-btn" onClick={redo} disabled={!canRedo} title="Повернути (Ctrl+Y)">
                            <Redo />
                        </button>
                        <div className="action-divider history-divider" />
                        <button 
                            className="action-btn hover-danger" 
                            onClick={onDiscardChanges} 
                            disabled={!hasChanges || isSaving} 
                            title="Скинути до збереженого"
                        >
                            <RotateCcw />
                        </button>
                        <button 
                            className={`action-btn save-btn ${hasChanges ? 'active' : ''}`} 
                            onClick={onSave} 
                            disabled={!hasChanges || isSaving} 
                            title="Зберегти (Ctrl+S)"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => window.open(`/site/${siteData.site_path}`, '_blank', 'noopener,noreferrer')}
                    className="preview-site-btn" 
                    title="Відкрити сайт у новій вкладці"
                >
                    <Play size={18} />
                </button>
            </div>
            <style>{`
                .visibility-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--platform-border-color); background: var(--platform-bg); color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s ease; }
                .visibility-btn:hover, .visibility-btn.active { color: var(--platform-accent); border-color: var(--platform-accent); background: var(--platform-card-bg); }
                .visibility-menu { position: absolute; top: calc(100% + 8px); left: 0; width: 240px; background: var(--platform-card-bg); border: 1px solid var(--platform-border-color); border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); z-index: 100; text-align: left; }
                .editor-header { display: flex; justify-content: space-between; align-items: center; padding: 0 24px; height: var(--header-height); background-color: var(--platform-card-bg); border-bottom: 1px solid var(--platform-border-color); gap: 16px; position: sticky; top: 0; z-index: 90; color: var(--platform-text-primary); transition: background-color 0.3s ease, border-color 0.3s ease; }
                .header-left { flex: 1 1 0%; display: flex; align-items: center; min-width: 0; }
                .header-center { flex: 0 1 auto; display: flex; justify-content: center; min-width: 0; }
                .header-right { flex: 1 1 0%; display: flex; align-items: center; justify-content: flex-end; min-width: 0; gap: 8px; }
                .site-info-wrapper { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex-shrink: 1; }
                .site-title { font-size: 16px; font-weight: 600; color: var(--platform-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.3s ease; }
                .save-indicator { display: flex; align-items: center; }
                .saving-state, .saved-state { font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 12px; letter-spacing: 0.2px; transition: all 0.3s ease; white-space: nowrap; }
                .saving-state { color: var(--platform-accent); background: color-mix(in srgb, var(--platform-accent), transparent 90%); border: 1px solid color-mix(in srgb, var(--platform-accent), transparent 80%); }
                .saved-state { color: var(--platform-accent); background: color-mix(in srgb, var(--platform-accent), transparent 90%); border: 1px solid color-mix(in srgb, var(--platform-accent), transparent 85%); }
                .check-icon { font-weight: bold; font-size: 13px; }
                .indicator-text { display: inline; }
                .animate-spin { display: inline-block; animation: spin 1s linear infinite; font-size: 14px; margin-bottom: 1px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .main-header-tabs { display: flex; background: var(--platform-bg); padding: 4px; border-radius: 8px; gap: 4px; border: 1px solid var(--platform-border-color); overflow: hidden; }
                .main-header-tab-btn { padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 6px; color: var(--platform-text-secondary); border: none; background: transparent; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 36px; }
                .main-header-tab-btn:hover { color: var(--platform-text-primary); background: var(--platform-hover-bg); }
                .main-header-tab-btn.active { background: var(--platform-card-bg); color: var(--platform-accent); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); font-weight: 600; }
                .main-header-tab-icon { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; }
                .main-header-tab-icon svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
                .main-header-tab-text { font-weight: 500; }
                .editor-tools-wrapper { display: flex; align-items: center; overflow: hidden; max-width: 0; opacity: 0; pointer-events: none; transition: max-width 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease; }
                .editor-tools-wrapper.is-active { max-width: 500px; opacity: 1; pointer-events: auto; }
                .shrink-0 { flex-shrink: 0; }
                .view-mode-toggle { display: flex; background: var(--platform-bg); padding: 2px; border-radius: 8px; gap: 2px; border: 1px solid var(--platform-border-color); height: 36px; }
                .mode-btn { width: 32px; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s ease; }
                .mode-btn:hover { color: var(--platform-text-primary); background: var(--platform-hover-bg); }
                .mode-btn.active { background: var(--platform-card-bg); color: var(--platform-accent); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
                .editor-actions-group { display: flex; align-items: center; gap: 6px; margin: 0 12px; padding-right: 12px; border-right: 1px solid var(--platform-border-color); }
                .action-divider { width: 1px; height: 16px; background: var(--platform-border-color); margin: 0 2px; opacity: 0.5; }
                .action-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--platform-border-color); background: var(--platform-bg); color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s; padding: 0; text-decoration: none; }
                .action-btn:hover:not(:disabled) { background: var(--platform-card-bg); border-color: var(--platform-accent); color: var(--platform-accent); }
                .action-btn.hover-danger:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.05); }
                .action-btn.save-btn.active { color: var(--platform-accent); border-color: var(--platform-accent); background: color-mix(in srgb, var(--platform-accent), transparent 90%); }
                .action-btn.save-btn.active:hover { background: color-mix(in srgb, var(--platform-accent), transparent 80%); }
                .action-btn:disabled { opacity: 0.4; cursor: default; }
                .action-btn svg { width: 18px; height: 18px; display: block; }
                .preview-site-btn { display: flex !important; align-items: center !important; justify-content: center !important; width: 36px !important; height: 36px !important; min-width: 36px !important; min-height: 36px !important; border-radius: 8px !important; border: 1px solid var(--platform-border-color) !important; background: var(--platform-bg) !important; color: var(--platform-text-secondary) !important; cursor: pointer !important; transition: all 0.2s !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important; flex-shrink: 0 !important; }
                .preview-site-btn:hover { background: var(--platform-card-bg) !important; border-color: var(--platform-accent) !important; color: var(--platform-accent) !important; }
                .preview-site-btn svg { width: 18px !important; height: 18px !important; display: block !important; flex-shrink: 0 !important; }
                @media (max-width: 1800px) { .main-header-tab-text { display: none; } .main-header-tab-btn { padding: 8px 12px; font-size: 1.2rem; } }
                @media (max-width: 1100px) {
                    .site-info-wrapper { flex-direction: row; align-items: center; gap: 12px; }
                    .site-title { max-width: 160px; }
                    .editor-header { padding: 0 16px; gap: 12px; }
                }
                @media (max-width: 1000px) { .visibility-btn, .history-btn, .history-divider { display: none !important; } }
                @media (max-width: 900px) { .main-header-tab-btn-overview { display: none !important; } }
                @media (max-width: 800px) { .main-header-tab-btn-commerce { display: none !important; } }
                @media (max-width: 768px) { 
                    .editor-header { padding: 0 12px; height: 56px; gap: 8px; } 
                    .main-header-tab-btn { padding: 6px 10px; font-size: 12px; } 
                    .action-btn, .preview-site-btn { width: 32px !important; height: 32px !important; min-width: 32px !important; min-height: 32px !important; } 
                    .editor-actions-group { gap: 4px; margin: 0 6px; padding-right: 6px; border-right: none; } 
                    .view-mode-toggle { display: none; }
                    .site-title { display: none !important; }
                    .indicator-text { display: none !important; }
                    .saving-state, .saved-state { height: 32px; width: 32px; padding: 0; justify-content: center; border-radius: 8px; }
                    .check-icon, .animate-spin { font-size: 16px; }
                    .main-header-tab-btn-editor,
                    .main-header-tab-btn-theme,
                    .main-header-tab-btn-commerce,
                    .main-header-tab-btn-overview {
                        display: none !important;
                    }
                    .editor-tools-wrapper { display: none !important; }
                } 
                @media (max-width: 650px) { .main-header-tab-btn-theme { display: none !important; } }
                @media (max-width: 480px) { 
                    .editor-header { padding: 0 8px; gap: 4px; } 
                    .site-info-wrapper { gap: 6px; }
                    .main-header-tab-btn { padding: 4px 8px; } 
                    .main-header-tab-icon { width: 16px; height: 16px; } 
                    .action-btn svg, .preview-site-btn svg { width: 16px !important; height: 16px !important; } 
                }
            `}</style>
        </header>
    );
};

export default DashboardHeader;
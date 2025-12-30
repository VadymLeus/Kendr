// frontend/src/modules/site-editor/components/EditorSidebar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AddBlocksTab from '../tabs/AddBlocksTab';
import LayersTab from '../tabs/LayersTab';
import SettingsTab from '../tabs/SettingsTab';
import CustomSelect from '../../../common/components/ui/CustomSelect';

import { 
    IconSave, 
    IconPlus, 
    IconLayers, 
    IconSettings, 
    IconArrowLeft,
    IconStar,
    IconLayoutHeader,
    IconLayoutFooter,
    IconFile
} from '../../../common/components/ui/Icons';

const EditorSidebar = ({
    blocks,
    siteData,
    onMoveBlock,
    onDeleteBlock,
    selectedBlockPath,
    onSelectBlock,
    onUpdateBlockData,
    onSave,
    allPages,
    currentPageId,
    onSelectPage,
    savedBlocksUpdateTrigger,
    isHeaderMode
}) => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('editorActiveTab') || 'add';
    });

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        localStorage.setItem('editorActiveTab', tabName);
    };

    useEffect(() => {
        if (isHeaderMode) {
            setActiveTab('settings');
        } else if (activeTab === 'settings' && !selectedBlockPath) {
            handleTabChange('add');
        }
    }, [isHeaderMode, selectedBlockPath]);

    useEffect(() => {
        if (selectedBlockPath) {
            setActiveTab('settings');
        }
    }, [selectedBlockPath]);
    
    const handleSave = () => {
        onSave(blocks);
    };

    const pageOptions = useMemo(() => {
        return (allPages || []).map(page => {
            let icon = IconFile;
            let iconStyle = {};
            let iconProps = {};
            let label = page.name;

            if (page.id === 'header') {
                icon = IconLayoutHeader;
            } else if (page.id === 'footer') {
                icon = IconLayoutFooter;
            } else if (page.is_homepage) {
                icon = IconStar;
                iconStyle = { color: 'var(--platform-accent)', fill: 'var(--platform-accent)' };
                iconProps = { filled: true };
            }

            return {
                value: page.id,
                label: label,
                icon: icon,
                iconStyle: iconStyle,
                iconProps: iconProps
            };
        });
    }, [allPages]);


    const saveButtonStyle = {
        width: '100%',
        backgroundColor: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    };

    const saveButtonHoverStyle = {
        backgroundColor: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };
    
    const tabStyle = (tabName) => ({
        flex: 1,
        padding: '0.75rem',
        background: activeTab === tabName ? 'var(--platform-card-bg)' : 'var(--platform-sidebar-bg)',
        border: 'none',
        borderBottom: activeTab === tabName ? '2px solid var(--platform-accent)' : '2px solid transparent',
        cursor: 'pointer',
        color: activeTab === tabName ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        fontWeight: activeTab === tabName ? '600' : '400',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
    });

    const tabHoverStyle = (tabName) => ({
        background: activeTab !== tabName ? 'var(--platform-hover-bg)' : 'var(--platform-card-bg)',
        color: activeTab !== tabName ? 'var(--platform-text-primary)' : 'var(--platform-accent)'
    });
    
    const pageSwitcherStyle = {
        padding: '1rem',
        borderBottom: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };
    
    return (
        <div style={{
            width: '300px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--platform-sidebar-bg)',
            borderLeft: '1px solid var(--platform-border-color)',
        }}>
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--platform-border-color)',
                background: 'var(--platform-card-bg)'
            }}>
                <button
                    onClick={handleSave}
                    style={saveButtonStyle}
                    onMouseOver={(e) => handleMouseOver(e.currentTarget, saveButtonHoverStyle)}
                    onMouseOut={(e) => handleMouseOut(e.currentTarget, saveButtonStyle)}
                >
                    <IconSave size={18} /> Зберегти зміни
                </button>
            </div>

            <div style={pageSwitcherStyle}>
                <label style={{
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    color: 'var(--platform-text-secondary)',
                    marginBottom: '0.5rem',
                    display: 'block'
                }}>
                    Поточна сторінка:
                </label>
                
                <CustomSelect 
                    value={currentPageId || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'footer' || val === 'header') {
                            onSelectPage(val);
                        } else {
                            onSelectPage(parseInt(val, 10));
                        }
                    }}
                    options={pageOptions}
                    placeholder="Оберіть сторінку"
                    disabled={!allPages || allPages.length === 0}
                />
            </div>

            <nav style={{ 
                display: 'flex', 
                borderBottom: '1px solid var(--platform-border-color)',
                background: 'var(--platform-sidebar-bg)'
            }}>
                {!isHeaderMode && (
                    <>
                        <button 
                            style={tabStyle('add')} 
                            onClick={() => handleTabChange('add')}
                            onMouseOver={(e) => handleMouseOver(e.currentTarget, tabHoverStyle('add'))}
                            onMouseOut={(e) => handleMouseOut(e.currentTarget, tabStyle('add'))}
                        >
                            <IconPlus size={16} /> Додати
                        </button>
                        <button 
                            style={tabStyle('layers')} 
                            onClick={() => handleTabChange('layers')}
                            onMouseOver={(e) => handleMouseOver(e.currentTarget, tabHoverStyle('layers'))}
                            onMouseOut={(e) => handleMouseOut(e.currentTarget, tabStyle('layers'))}
                        >
                            <IconLayers size={16} /> Шари
                        </button>
                    </>
                )}
                <button 
                    style={tabStyle('settings')} 
                    onClick={() => handleTabChange('settings')}
                    onMouseOver={(e) => handleMouseOver(e.currentTarget, tabHoverStyle('settings'))}
                    onMouseOut={(e) => handleMouseOut(e.currentTarget, tabStyle('settings'))}
                >
                    <IconSettings size={16} /> Налаш.
                </button>
            </nav>

            <div style={{ 
                 overflowY: 'auto', 
                 flex: 1, 
                 padding: '1rem',
                 background: 'var(--platform-sidebar-bg)',
             }}
                 className="custom-scrollbar"
            >
                {activeTab === 'add' && !isHeaderMode && (
                    <AddBlocksTab 
                        savedBlocksUpdateTrigger={savedBlocksUpdateTrigger} 
                    />
                )}
                
                {activeTab === 'layers' && !isHeaderMode && (
                    <LayersTab
                        blocks={blocks}
                        siteData={siteData}
                        onMoveBlock={onMoveBlock}
                        onSelectBlock={onSelectBlock}
                        onDeleteBlock={onDeleteBlock}
                    />
                )}
                
                {activeTab === 'settings' && (
                    <>
                        {isHeaderMode && !selectedBlockPath && (
                            <div style={{ 
                                textAlign: 'center', 
                                color: 'var(--platform-text-secondary)', 
                                padding: '1rem',
                                border: '1px dashed var(--platform-border-color)',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                background: 'var(--platform-card-bg)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--platform-accent)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                                <p style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                                    <IconArrowLeft size={16} /> Натисніть на блок хедера зліва, щоб налаштувати його.
                                </p>
                            </div>
                        )}
                        <SettingsTab 
                            blocks={blocks}
                            selectedBlockPath={selectedBlockPath}
                            onUpdateBlockData={onUpdateBlockData}
                            siteData={siteData}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default EditorSidebar;
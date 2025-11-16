// frontend/src/features/editor/EditorSidebar.jsx
import React, { useState, useEffect } from 'react';
import AddBlocksTab from '../../../src/features/editor/tabs/AddBlocksTab';
import LayersTab from '../../../src/features/editor/tabs/LayersTab';
import SettingsTab from '../../../src/features/editor/tabs/SettingsTab';

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
    onSelectPage
}) => {
    const [activeTab, setActiveTab] = useState('add');
    useEffect(() => {
        if (selectedBlockPath) {
            setActiveTab('settings');
        }
    }, [selectedBlockPath]);
    
    const handleSave = () => {
        onSave(blocks);
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
    });
    
    const pageSwitcherStyle = {
        padding: '1rem',
        borderBottom: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)'
    };
    
    const selectStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '6px',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontWeight: '500',
        cursor: 'pointer'
    };
    
    return (
        <div style={{
            width: '300px',
            height: 'calc(100vh - 65px)',
            position: 'sticky',
            top: '65px',
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
                    style={{
                        width: '100%',
                        backgroundColor: 'var(--platform-accent)',
                        color: 'var(--platform-accent-text)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    💾 Зберегти зміни
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
                <select
                    style={selectStyle}
                    value={currentPageId || ''}
                    onChange={(e) => onSelectPage(parseInt(e.target.value, 10))}
                    disabled={!allPages || allPages.length === 0}
                >
                    {(allPages || []).map(page => (
                        <option key={page.id} value={page.id}>
                            {page.is_homepage ? `🏠 ${page.name}` : page.name}
                        </option>
                    ))}
                </select>
            </div>

            <nav style={{ display: 'flex', borderBottom: '1px solid var(--platform-border-color)' }}>
                <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>➕ Додати</button>
                <button style={tabStyle('layers')} onClick={() => setActiveTab('layers')}>🗂️ Шари</button>
                <button style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>⚙️ Налаш.</button>
            </nav>

            <div style={{ 
                 overflowY: 'auto', flex: 1, padding: '1rem' }}
                 className="custom-scrollbar"
            >
                {activeTab === 'add' && <AddBlocksTab />}
                
                {activeTab === 'layers' && (
                    <LayersTab
                        blocks={blocks}
                        siteData={siteData}
                        onMoveBlock={onMoveBlock}
                        onSelectBlock={onSelectBlock}
                        onDeleteBlock={onDeleteBlock}
                    />
                )}
                
                {activeTab === 'settings' && (
                    <SettingsTab 
                        blocks={blocks}
                        selectedBlockPath={selectedBlockPath}
                        onUpdateBlockData={onUpdateBlockData}
                        siteData={siteData}
                    />
                )}
            </div>
        </div>
    );
};

export default EditorSidebar;
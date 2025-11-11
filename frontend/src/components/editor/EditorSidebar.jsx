// frontend/src/components/editor/EditorSidebar.jsx
import React, { useState, useEffect } from 'react';
import AddBlocksTab from './tabs/AddBlocksTab';
import LayersTab from './tabs/LayersTab';
import SettingsTab from './tabs/SettingsTab';

const EditorSidebar = ({
    blocks,
    siteData,
    onMoveBlock,
    onDeleteBlock,
    selectedBlockPath,
    onSelectBlock,
    onUpdateBlockData,
    onSave
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
        background: activeTab === tabName ? 'var(--site-card-bg)' : 'var(--site-bg)',
        border: 'none',
        borderBottom: activeTab === tabName ? '2px solid var(--site-accent)' : '2px solid transparent',
        cursor: 'pointer',
        color: 'var(--site-text-primary)',
        fontWeight: activeTab === tabName ? '600' : '400',
    });

    return (
        <div style={{
            width: '300px',
            height: 'calc(100vh - 60px)', 
            position: 'sticky',
            top: '60px', 
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--site-bg)',
            borderLeft: '1px solid var(--site-border-color)',
        }}>
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--site-border-color)',
                background: 'var(--site-card-bg)'
            }}>
                <button
                    onClick={handleSave}
                    style={{
                        width: '100%',
                        backgroundColor: 'var(--site-accent)',
                        color: 'var(--site-accent-text)',
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

            <nav style={{ display: 'flex', borderBottom: '1px solid var(--site-border-color)' }}>
                <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>➕ Додати</button>
                <button style={tabStyle('layers')} onClick={() => setActiveTab('layers')}>🗂️ Шари</button>
                <button style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>⚙️ Налаш.</button>
            </nav>

            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
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
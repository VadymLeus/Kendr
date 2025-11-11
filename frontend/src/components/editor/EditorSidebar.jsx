// frontend/src/components/editor/EditorSidebar.jsx
import React, { useState } from 'react';
import AddBlocksTab from './tabs/AddBlocksTab';
import LayersTab from './tabs/LayersTab';
import SettingsTab from './tabs/SettingsTab';

const EditorSidebar = ({ blocks, siteData }) => {
    const [activeTab, setActiveTab] = useState('add');

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
            <nav style={{ display: 'flex', borderBottom: '1px solid var(--site-border-color)' }}>
                <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>➕ Додати</button>
                <button style={tabStyle('layers')} onClick={() => setActiveTab('layers')}>🗂️ Шари</button>
                <button style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>⚙️ Налаш.</button>
            </nav>

            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                {activeTab === 'add' && <AddBlocksTab />}
                {activeTab === 'layers' && <LayersTab blocks={blocks} siteData={siteData} />}
                {activeTab === 'settings' && <SettingsTab />}
            </div>
        </div>
    );
};

export default EditorSidebar;
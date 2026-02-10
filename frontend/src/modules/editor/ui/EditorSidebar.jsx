// frontend/src/modules/editor/ui/EditorSidebar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AddBlocksTab from './tabs/AddBlocksTab';
import LayersTab from './tabs/LayersTab';
import SettingsTab from './tabs/SettingsTab';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Save, Plus, Layers, Settings, Star, PanelTop, PanelBottom, File } from 'lucide-react';

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
            let icon = File;
            let iconStyle = { flexShrink: 0 }; 
            let iconProps = {};
            let label = page.name;

            if (page.id === 'header') {
                icon = PanelTop;
            } else if (page.id === 'footer') {
                icon = PanelBottom;
            } else if (page.is_homepage) {
                icon = Star;
                iconStyle = { ...iconStyle, color: 'var(--platform-accent)', fill: 'var(--platform-accent)' };
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

    const TabButton = ({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
            <button 
                onClick={() => handleTabChange(id)}
                className={`
                    flex-1 py-2.5 bg-transparent border-none border-b-2 cursor-pointer 
                    flex flex-col items-center justify-center gap-1 min-w-0 
                    text-[11px] leading-tight transition-all duration-200
                    ${isActive 
                        ? 'border-(--platform-accent) text-(--platform-accent) bg-(--platform-card-bg) font-semibold' 
                        : 'border-transparent text-(--platform-text-secondary) font-medium hover:bg-black/5 hover:text-(--platform-text-primary)'}
                `}
            >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <Icon size={20} />
                </div>
                <span>{label}</span>
            </button>
        );
    };
    
    return (
        <div className="w-75 min-w-75 h-full flex flex-col bg-(--platform-sidebar-bg) border-l border-(--platform-border-color) shrink-0">
            <div className="p-3 border-b border-(--platform-border-color) bg-(--platform-card-bg) flex items-center gap-2 shrink-0">
                <div className="flex-1 min-w-0">
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
                        placeholder="Сторінка"
                        disabled={!allPages || allPages.length === 0}
                        style={{ width: '100%', margin: 0 }} 
                    />
                </div>

                <button
                    onClick={handleSave}
                    title="Зберегти зміни"
                    className={`
                        bg-(--platform-accent) text-(--platform-accent-text) px-3 h-9.5 rounded-lg 
                        border-none text-[13px] font-semibold cursor-pointer transition-all duration-200 
                        shadow-sm flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden
                        hover:bg-(--platform-accent-hover) hover:-translate-y-px hover:shadow-md
                    `}
                >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <Save size={16} />
                    </div>
                    <span>Зберегти</span>
                </button>
            </div>
            <nav className="flex border-b border-(--platform-border-color) bg-(--platform-sidebar-bg) shrink-0">
                {!isHeaderMode && (
                    <>
                        <TabButton id="add" label="Додати блок" icon={Plus} />
                        <TabButton id="layers" label="Шари" icon={Layers} />
                    </>
                )}
                <TabButton id="settings" label="Налаштування" icon={Settings} />
            </nav>
            <div className="overflow-y-auto flex-1 p-0 bg-(--platform-sidebar-bg) custom-scrollbar">
                {activeTab === 'add' && !isHeaderMode && (
                    <div className="p-4">
                        <AddBlocksTab 
                            savedBlocksUpdateTrigger={savedBlocksUpdateTrigger} 
                        />
                    </div>
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
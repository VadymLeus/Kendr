// frontend/src/modules/editor/ui/EditorSidebar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AddBlocksTab from './tabs/AddBlocksTab';
import LayersTab from './tabs/LayersTab';
import SettingsTab from './tabs/SettingsTab';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Save, Plus, Layers, Settings, Star, File, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react';

const EditorSidebar = ({
    blocks,
    siteData,
    onMoveBlock,
    onDeleteBlock,
    selectedBlockPath,
    onSelectBlock,
    onUpdateBlockData,
    onAddBlock,
    onSave,
    allPages,
    currentPageId,
    onSelectPage,
    savedBlocksUpdateTrigger,
    isSaving = false,
    hasChanges = false,
    onDiscardChanges
}) => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('editorActiveTab') || 'add';
    });

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        localStorage.setItem('editorActiveTab', tabName);
    };

    useEffect(() => {
        if (activeTab === 'settings' && !selectedBlockPath) {
            handleTabChange('add');
        }
    }, [selectedBlockPath]);

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
            if (page.is_homepage) {
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
                            onSelectPage(parseInt(val, 10));
                        }}
                        options={pageOptions}
                        placeholder="Сторінка"
                        disabled={!allPages || allPages.length === 0}
                        style={{ width: '100%', margin: 0 }} 
                    />
                </div>
                <div className="flex items-center gap-1 h-9.5">
                    {hasChanges ? (
                        <>
                            <button
                                onClick={onDiscardChanges}
                                title="Скинути до збереженого"
                                className="h-full px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center border border-red-200 dark:border-red-500/20"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-3 h-full bg-(--platform-accent) text-(--platform-accent-text) rounded-lg border-none text-[13px] font-semibold cursor-pointer hover:bg-(--platform-accent-hover) transition-all shadow-sm flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span>{isSaving ? 'Збереження...' : 'Зберегти'}</span>
                            </button>
                        </>
                    ) : (
                        <div 
                            title="Всі зміни збережено"
                            className="flex items-center justify-center w-9.5 h-full rounded-lg text-(--platform-accent) cursor-default"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' }}
                        >
                            <CheckCircle2 size={20} />
                        </div>
                    )}
                </div>
            </div>
            <nav className="flex border-b border-(--platform-border-color) bg-(--platform-sidebar-bg) shrink-0">
                <TabButton id="add" label="Додати блок" icon={Plus} />
                <TabButton id="layers" label="Шари" icon={Layers} />
                <TabButton id="settings" label="Налаштування" icon={Settings} />
            </nav>
            <div className="overflow-y-auto flex-1 p-0 bg-(--platform-sidebar-bg) custom-scrollbar">
                {activeTab === 'add' && (
                    <div className="p-4">
                        <AddBlocksTab 
                            savedBlocksUpdateTrigger={savedBlocksUpdateTrigger} 
                            blocks={blocks}
                            onAddBlock={onAddBlock}
                        />
                    </div>
                )}
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
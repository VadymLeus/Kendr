// frontend/src/modules/editor/blocks/Footer/FooterEditorModal.jsx
import React, { useState, useCallback } from 'react';
import BlockEditor from '../../core/BlockEditor';
import EditorSidebar from '../../components/EditorSidebar';
import { Button } from '../../../../shared/ui/elements/Button';
import { toast } from 'react-toastify';
import { PanelBottom, Save, X, AlertTriangle } from 'lucide-react';
import { generateBlockId, getDefaultBlockData } from '../../core/editorConfig';
import { updateBlockDataByPath, removeBlockByPath, addBlockByPath, moveBlock, handleDrop, cloneBlockWithNewIds } from '../../core/blockUtils';

const FooterEditorModal = ({ isOpen, onClose, initialBlocks, onSave, siteData }) => {
    const [blocks, setBlocks] = useState(initialBlocks || []);
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);
    const [collapsedBlocks, setCollapsedBlocks] = useState([]);
    const [saving, setSaving] = useState(false);
    const toggleCollapse = (blockId) => {
        setCollapsedBlocks(prev => prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]);
    };

    const handleAddBlock = useCallback((path, type, presetData = {}) => {
        let blockData;
        if (presetData && presetData.isSavedBlock && presetData.content) {
             blockData = cloneBlockWithNewIds(presetData.content);
        } else {
            blockData = getDefaultBlockData(type, presetData);
        }
        const newBlock = { block_id: generateBlockId(), type, data: blockData };
        setBlocks(prev => addBlockByPath(prev, newBlock, path));
    }, []);

    const handleMoveBlock = useCallback((dragPath, hoverPath) => {
        setBlocks(prev => moveBlock(prev, dragPath, hoverPath));
    }, []);

    const handleDropBlock = useCallback((dragItem, dropZonePath) => {
        setBlocks(prev => handleDrop(prev, dragItem, dropZonePath));
    }, []);
    
    const handleDeleteBlock = useCallback((path) => {
        setBlocks(prev => removeBlockByPath(prev, path));
        setSelectedBlockPath(null);
    }, []);

    const handleUpdateBlockData = useCallback((path, updatedData) => {
        setBlocks(prev => updateBlockDataByPath(prev, path, updatedData));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(blocks);
            toast.success('Футер успішно збережено!');
            onClose();
        } catch (error) {
            console.error('Помилка збереження футера:', error);
            toast.error('Помилка збереження');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/85 z-2000 flex justify-center items-center backdrop-blur-xs">
            <div className="w-[95%] h-[90%] bg-(--platform-bg) rounded-xl flex flex-col overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2.5">
                         <div className="w-8 h-8 rounded-md bg-(--platform-accent) text-white flex items-center justify-center">
                            <PanelBottom size={20} />
                         </div>
                        <h3 className="m-0 text-(--platform-text-primary) text-lg font-semibold">
                            Редактор Футера
                        </h3>
                    </div>

                    <div className="flex gap-2.5">
                        <Button 
                            variant="secondary"
                            onClick={onClose} 
                            disabled={saving}
                            icon={<X size={16}/>}
                        >
                            Скасувати
                        </Button>
                        <Button 
                            variant="primary"
                            onClick={handleSave} 
                            disabled={saving}
                            icon={<Save size={16}/>}
                            isLoading={saving}
                        >
                            Зберегти Футер
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 bg-(--platform-bg) flex flex-col">
                        <div className="max-w-full min-h-75 bg-transparent flex-1">
                            <BlockEditor 
                                blocks={blocks}
                                siteData={siteData}
                                onAddBlock={handleAddBlock}
                                onMoveBlock={handleMoveBlock}
                                onDropBlock={handleDropBlock}
                                onDeleteBlock={handleDeleteBlock}
                                onSelectBlock={setSelectedBlockPath}
                                selectedBlockPath={selectedBlockPath}
                                collapsedBlocks={collapsedBlocks}
                                onToggleCollapse={toggleCollapse}
                            />
                            
                            {blocks.length === 0 && (
                                <div className="text-center text-(--platform-text-secondary) mt-10 p-12 border-2 border-dashed border-(--platform-border-color) rounded-xl bg-(--platform-card-bg) flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-orange-500/10 text-(--platform-warning) flex items-center justify-center">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-(--platform-text-primary) m-0 mb-2 font-medium">
                                            Футер порожній
                                        </h4>
                                        <p className="m-0 text-sm max-w-75">
                                            Перетягніть сюди блоки з панелі зліва або натисніть "Додати", щоб наповнити футер.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-90 border-l border-(--platform-border-color) bg-(--platform-sidebar-bg) flex flex-col shrink-0">
                        <EditorSidebar 
                            blocks={blocks}
                            siteData={siteData}
                            onMoveBlock={handleMoveBlock}
                            onDeleteBlock={handleDeleteBlock}
                            selectedBlockPath={selectedBlockPath}
                            onSelectBlock={setSelectedBlockPath}
                            onUpdateBlockData={handleUpdateBlockData}
                            onSave={handleSave}
                            allPages={[]} 
                            currentPageId={null}
                            onSelectPage={() => {}}
                        />
                    </div>
                </div>
                <div className="px-6 py-3 bg-(--platform-card-bg) border-t border-(--platform-border-color) flex justify-between items-center text-xs text-(--platform-text-secondary) shrink-0">
                    <span className="flex items-center gap-1.5">
                        <PanelBottom size={14} /> Глобальний футер (відображається скрізь)
                    </span>
                    <span>Блоків: <strong>{blocks.length}</strong></span>
                </div>
            </div>
        </div>
    );
};

export default FooterEditorModal;
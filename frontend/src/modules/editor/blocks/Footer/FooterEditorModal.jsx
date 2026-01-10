// frontend/src/modules/site-editor/blocks/Footer/FooterEditorModal.jsx
import React, { useState, useCallback } from 'react';
import BlockEditor from '../../core/BlockEditor';
import EditorSidebar from '../components/EditorSidebar';
import { Button } from '../../../../common/components/ui/Button';
import { toast } from 'react-toastify';
import { 
    IconLayoutFooter, IconSave, IconX, IconAlertTriangle 
} from '../../../../common/components/ui/Icons';
import { 
    generateBlockId, 
    getDefaultBlockData 
} from '../../core/editorConfig';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop,
    cloneBlockWithNewIds
} from '../../core/blockUtils';

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
            toast.success('✅ Футер успішно збережено!');
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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 2000, 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                width: '95%', height: '90%', background: 'var(--platform-bg)',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    padding: '1rem 1.5rem', background: 'var(--platform-card-bg)', 
                    borderBottom: '1px solid var(--platform-border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <div style={{ 
                            width: '32px', height: '32px', borderRadius: '6px', 
                            background: 'var(--platform-accent)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                         }}>
                            <IconLayoutFooter size={20} />
                         </div>
                        <h3 style={{ margin: 0, color: 'var(--platform-text-primary)', fontSize: '1.1rem' }}>
                            Редактор Футера
                        </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button 
                            variant="secondary"
                            onClick={onClose} 
                            disabled={saving}
                            icon={<IconX size={16}/>}
                        >
                            Скасувати
                        </Button>
                        <Button 
                            variant="primary"
                            onClick={handleSave} 
                            disabled={saving}
                            icon={<IconSave size={16}/>}
                            isLoading={saving}
                        >
                            Зберегти Футер
                        </Button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '2rem', 
                        background: 'var(--platform-bg)', 
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ 
                            maxWidth: '100%', 
                            minHeight: '300px',
                            background: 'transparent',
                            flex: 1
                        }}>
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
                                <div style={{ 
                                    textAlign: 'center', 
                                    color: 'var(--platform-text-secondary)', 
                                    marginTop: '40px',
                                    padding: '3rem',
                                    border: '2px dashed var(--platform-border-color)',
                                    borderRadius: '12px',
                                    background: 'var(--platform-card-bg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{ 
                                        width: '64px', height: '64px', borderRadius: '50%', 
                                        background: 'rgba(237, 137, 54, 0.1)', color: 'var(--platform-warning)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <IconAlertTriangle size={32} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--platform-text-primary)', margin: '0 0 8px 0' }}>
                                            Футер порожній
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px' }}>
                                            Перетягніть сюди блоки з панелі зліва або натисніть "Додати", щоб наповнити футер.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ 
                        width: '360px', 
                        borderLeft: '1px solid var(--platform-border-color)', 
                        background: 'var(--platform-sidebar-bg)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
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

                <div style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--platform-card-bg)',
                    borderTop: '1px solid var(--platform-border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--platform-text-secondary)'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconLayoutFooter size={14} /> Глобальний футер (відображається скрізь)
                    </span>
                    <span>Блоків: <strong>{blocks.length}</strong></span>
                </div>
            </div>
        </div>
    );
};

export default FooterEditorModal;
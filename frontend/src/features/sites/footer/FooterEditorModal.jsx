import React, { useState, useCallback } from 'react';
import BlockEditor from '../../editor/BlockEditor';
import EditorSidebar from '../../editor/EditorSidebar';
import { 
    generateBlockId, 
    getDefaultBlockData 
} from '../../editor/editorConfig';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop,
    cloneBlockWithNewIds
} from '../../editor/blockUtils';

const FooterEditorModal = ({ isOpen, onClose, initialBlocks, onSave, siteData }) => {
    const [blocks, setBlocks] = useState(initialBlocks || []);
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);
    const [collapsedBlocks, setCollapsedBlocks] = useState([]);

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
        if (window.confirm('Видалити цей блок з футера?')) {
            setBlocks(prev => removeBlockByPath(prev, path));
            setSelectedBlockPath(null);
        }
    }, []);

    const handleUpdateBlockData = useCallback((path, updatedData) => {
        setBlocks(prev => updateBlockDataByPath(prev, path, updatedData));
    }, []);

    const handleSave = () => {
        onSave(blocks);
    };

    if (!isOpen) return null;

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                width: '95%', height: '90%', background: 'var(--platform-bg)',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    padding: '1rem 2rem', background: 'var(--platform-card-bg)', borderBottom: '1px solid var(--platform-border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--platform-text-primary)' }}>🛠 Редагування Глобального Футера</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={onClose} 
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = 'var(--platform-accent)';
                                e.target.style.color = 'var(--platform-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = 'var(--platform-border-color)';
                                e.target.style.color = 'var(--platform-text-primary)';
                            }}
                        >
                            Скасувати
                        </button>
                        <button 
                            onClick={handleSave} 
                            style={primaryButtonStyle}
                            onMouseEnter={(e) => e.target.style.background = 'var(--platform-accent-hover)'}
                            onMouseLeave={(e) => e.target.style.background = 'var(--platform-accent)'}
                        >
                            💾 Зберегти Футер
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '2rem', 
                        background: 'var(--platform-bg)'
                    }}>
                        <div style={{ maxWidth: '100%', minHeight: '300px' }}>
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
                                <p style={{ 
                                    textAlign: 'center', 
                                    color: 'var(--platform-text-secondary)', 
                                    marginTop: '20px',
                                    padding: '2rem'
                                }}>
                                    Футер порожній. Додайте блоки з панелі зліва.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ 
                        width: '350px', 
                        borderLeft: '1px solid var(--platform-border-color)', 
                        background: 'var(--platform-sidebar-bg)' 
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
            </div>
        </div>
    );
};

export default FooterEditorModal;
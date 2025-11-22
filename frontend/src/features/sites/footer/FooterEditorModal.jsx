import React, { useState, useCallback } from 'react';
import BlockEditor from '../../editor/BlockEditor';
import EditorSidebar from '../../editor/EditorSidebar';
import { toast } from 'react-toastify';
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
        if (window.confirm('Видалити цей блок з футера?')) {
            setBlocks(prev => removeBlockByPath(prev, path));
            setSelectedBlockPath(null);
            toast.info('🗑️ Блок видалено з футера');
        }
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
        } finally {
            setSaving(false);
        }
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
        color: 'var(--platform-accent-text)',
        opacity: saving ? 0.6 : 1
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
                    <h3 style={{ 
                        margin: 0, 
                        color: 'var(--platform-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🛠 Редагування Глобального Футера
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={onClose} 
                            disabled={saving}
                            style={{
                                ...secondaryButtonStyle,
                                opacity: saving ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!saving) {
                                    e.target.style.borderColor = 'var(--platform-accent)';
                                    e.target.style.color = 'var(--platform-accent)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!saving) {
                                    e.target.style.borderColor = 'var(--platform-border-color)';
                                    e.target.style.color = 'var(--platform-text-primary)';
                                }
                            }}
                        >
                            ❌ Скасувати
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            style={primaryButtonStyle}
                            onMouseEnter={(e) => {
                                if (!saving) {
                                    e.target.style.background = 'var(--platform-accent-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!saving) {
                                    e.target.style.background = 'var(--platform-accent)';
                                }
                            }}
                        >
                            {saving ? '⏳ Збереження...' : '💾 Зберегти Футер'}
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
                                <div style={{ 
                                    textAlign: 'center', 
                                    color: 'var(--platform-text-secondary)', 
                                    marginTop: '20px',
                                    padding: '3rem',
                                    border: '2px dashed var(--platform-border-color)',
                                    borderRadius: '12px',
                                    background: 'var(--platform-card-bg)'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔻</div>
                                    <h4 style={{ 
                                        color: 'var(--platform-text-primary)', 
                                        marginBottom: '0.5rem' 
                                    }}>
                                        Футер порожній
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                        Додайте блоки з панелі зліва, щоб створити футер
                                    </p>
                                </div>
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

                <div style={{
                    padding: '1rem 2rem',
                    background: 'var(--platform-card-bg)',
                    borderTop: '1px solid var(--platform-border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--platform-text-secondary)'
                }}>
                    <span>🔻 Глобальний футер - відображається на всіх сторінках сайту</span>
                    <span>📊 Блоків: <strong>{blocks.length}</strong></span>
                </div>
            </div>
        </div>
    );
};

export default FooterEditorModal;
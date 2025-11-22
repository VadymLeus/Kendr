// frontend/src/features/editor/EditableBlockWrapper.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import BlockRenderer from './blocks/BlockRenderer';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';
import apiClient from '../../services/api';
import SaveBlockModal from './SaveBlockModal';
import { toast } from 'react-toastify';
import { useConfirm } from '../../hooks/useConfirm';

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';

const EditableBlockWrapper = ({ 
    block, 
    siteData, 
    path, 
    onMoveBlock, 
    onDropBlock, 
    onDeleteBlock,
    onAddBlock,
    onSelectBlock,
    selectedBlockPath,
    isCollapsed,
    onToggleCollapse,
    onBlockSaved
}) => {
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1024);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const { confirm } = useConfirm();

    useEffect(() => {
        const handleResize = () => setIsCompact(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [{ isDragging }, drag] = useDrag({
        type: DRAG_ITEM_TYPE_EXISTING,
        item: { path, type: DRAG_ITEM_TYPE_EXISTING },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: [DRAG_ITEM_TYPE_EXISTING, DND_TYPE_NEW_BLOCK],
        hover(item, monitor) {
            if (!monitor.canDrop()) return;
            if (item.type === DRAG_ITEM_TYPE_EXISTING) {
                const dragPath = item.path;
                const hoverPath = path;
                if (dragPath.join(',') === hoverPath.join(',')) return;
                const dragParentPath = dragPath.slice(0, -1).join(',');
                const hoverParentPath = hoverPath.slice(0, -1).join(',');
                if (dragParentPath !== hoverParentPath) return;
                onMoveBlock(dragPath, hoverPath);
                item.path = hoverPath;
            }
        },
        drop(item, monitor) {
            if (monitor.didDrop()) return;
            const dragType = monitor.getItemType();
            if (!monitor.isOver({ shallow: true })) return;

            if (dragType === DND_TYPE_NEW_BLOCK) {
                onAddBlock(path, item.blockType, item.presetData);
                return { name: 'EditableBlockWrapper - New', path };
            }

            if (dragType === DRAG_ITEM_TYPE_EXISTING) {
                const dragPath = item.path;
                const hoverPath = path;
                if (dragPath.join(',') === hoverPath.join(',')) return;
                const isDroppingOnSelf = hoverPath.join(',').startsWith(dragPath.join(',')) && hoverPath.length > dragPath.length;
                if (isDroppingOnSelf) return;

                onMoveBlock(dragPath, hoverPath);
                item.path = hoverPath;
                return { name: 'EditableBlockWrapper - Move', path };
            }
        },
        collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) })
    });

    const wrapperRef = useCallback(node => drag(drop(node)), [drag, drop]);
    const opacity = isDragging ? 0.4 : 1;
    const blockType = { name: block.type, icon: '⚙️' };
    const blockDomId = `block-${block.block_id}`;
    const isSelected = selectedBlockPath && selectedBlockPath.join(',') === path.join(',');
    const isHeaderBlock = block.type === 'header';

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelectBlock(path);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        const isConfirmed = await confirm({
            title: "Видалення блоку",
            message: "Ви впевнені, що хочете видалити цей блок? Цю дію не можна буде скасувати.",
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            onDeleteBlock(path);
            toast.info("🗑️ Блок видалено");
        }
    };

    const handleSaveBlock = async (name, mode, targetOverrideId = null) => {
        try {
            const targetId = targetOverrideId || block._library_origin_id;

            if (mode === 'overwrite' && targetId) {
                 await apiClient.put(`/saved-blocks/${targetId}`, {
                    content: block.data
                });
                toast.success(`✅ Блок успішно оновлено в бібліотеці!`);
            } else {
                await apiClient.post('/saved-blocks', {
                    name: name,
                    type: block.type,
                    content: block.data
                });
                toast.success('✅ Блок успішно збережено в бібліотеку!');
            }

            if (onBlockSaved) {
                onBlockSaved();
            }

        } catch (error) {
            console.error(error);
        }
    };

    const originBlockInfo = block._library_origin_id ? { 
        id: block._library_origin_id, 
        name: block._library_name 
    } : null;

    const themeSettings = siteData?.theme_settings || {};

    const styles = {
        wrapper: {
            opacity,
            cursor: 'move',
            position: 'relative',
            margin: '20px 0',
            border: isSelected 
                ? '2px solid var(--platform-accent)' 
                : (isOver ? '2px dashed var(--platform-accent)' : '2px dashed var(--platform-border-color)'),
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            background: block.type === 'layout' ? 'transparent' : 'var(--platform-card-bg)',
            boxShadow: block.type === 'layout' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
            maxWidth: '100%',
            overflowX: 'hidden'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'var(--platform-card-bg)',
            borderBottom: '1px solid var(--platform-border-color)',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease',
            gap: '10px'
        },
        headerText: {
            fontSize: '14px', 
            fontWeight: '500', 
            color: 'var(--platform-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0
        },
        buttonGroup: {
            display: 'flex', 
            gap: '6px',
            flexShrink: 0
        },
        actionButton: {
            padding: isCompact ? '6px' : '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: isCompact ? '30px' : 'auto'
        }
    };

    return (
        <div
            id={blockDomId}
            ref={wrapperRef}
            onClick={handleSelect}
            style={styles.wrapper}
            className="editable-block-wrapper"
        >
            <div style={styles.header} className="editable-block-header">
                <span style={styles.headerText} title={blockType?.name}>
                    <span>{blockType?.icon}</span>
                    <span>{blockType?.name}</span>
                </span>
                
                <div style={styles.buttonGroup}>
                    {!isHeaderBlock && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }}
                            style={{
                                ...styles.actionButton,
                                background: 'var(--platform-card-bg)',
                                color: 'var(--platform-accent)',
                                border: '1px solid var(--platform-border-color)'
                            }}
                            title={originBlockInfo ? `Оновити "${originBlockInfo.name}"` : "Зберегти в бібліотеку"}
                        >
                            💾
                        </button>
                    )}

                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleCollapse(block.block_id); }}
                        style={{
                            ...styles.actionButton,
                            background: 'var(--platform-text-secondary)',
                            color: 'white',
                        }}
                        title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
                    >
                        {isCollapsed ? '🔽' : '🔼'}
                    </button>

                    <button 
                        onClick={handleSelect}
                        style={{
                            ...styles.actionButton,
                            background: 'var(--platform-accent)',
                            color: 'var(--platform-accent-text)',
                        }}
                        title="Налаштування"
                    >
                        {isCompact ? '⚙️' : 'Налаштування'}
                    </button>

                    {!isHeaderBlock && (
                        <button 
                            onClick={handleDelete}
                            title="Видалити блок"
                            style={{
                                ...styles.actionButton,
                                background: 'var(--platform-danger)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            {isCollapsed ? (
                <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'var(--platform-bg)',
                    color: 'var(--platform-text-secondary)',
                    borderRadius: '0 0 8px 8px'
                }}>
                    <small>Вміст блоку згорнуто</small>
                </div>
            ) : (
                <div
                    className="site-theme-context"
                    data-site-mode={siteData?.site_theme_mode || 'light'}
                    data-site-accent={siteData?.site_theme_accent || 'orange'}
                    style={{
                        background: 'var(--platform-card-bg)',
                        color: 'var(--platform-text-primary)',
                        ...(block.type === 'layout' && { background: 'transparent' }),
                        '--font-heading': themeSettings.font_heading || "'Inter', sans-serif",
                        '--font-body': themeSettings.font_body || "'Inter', sans-serif",
                        '--btn-radius': themeSettings.button_radius || '8px',
                        borderRadius: '0 0 8px 8px',
                    }}
                >
                    <BlockRenderer 
                        blocks={[block]} 
                        siteData={siteData} 
                        isEditorPreview={true} 
                        path={path}
                        onMoveBlock={onMoveBlock}
                        onDropBlock={onDropBlock}
                        onDeleteBlock={onDeleteBlock}
                        onAddBlock={onAddBlock}
                        onSelectBlock={onSelectBlock}
                        selectedBlockPath={selectedBlockPath}
                    />
                </div>
            )}

            {!isHeaderBlock && (
                <SaveBlockModal 
                    isOpen={isSaveModalOpen} 
                    onClose={() => setIsSaveModalOpen(false)} 
                    onSave={handleSaveBlock} 
                    originBlockInfo={originBlockInfo}
                />
            )}
        </div>
    );
};

export default EditableBlockWrapper;
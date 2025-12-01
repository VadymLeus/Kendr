// frontend/src/features/editor/EditableBlockWrapper.jsx
import React, { useCallback, useState, useEffect, useRef } from 'react';
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
    onBlockSaved,
    onContextMenu
}) => {
    const ref = useRef(null);
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1024);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { confirm } = useConfirm();

    useEffect(() => {
        const handleResize = () => setIsCompact(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [{ isDragging }, drag] = useDrag({
        type: DRAG_ITEM_TYPE_EXISTING,
        item: () => {
            return { path, type: DRAG_ITEM_TYPE_EXISTING, id: block.block_id };
        },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [{ handlerId }, drop] = useDrop({
        accept: [DRAG_ITEM_TYPE_EXISTING, DND_TYPE_NEW_BLOCK],
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }

            const dragPath = item.path;
            const hoverPath = path;
            if (!dragPath || item.type === DND_TYPE_NEW_BLOCK) return;

            if (dragPath.join(',') === hoverPath.join(',')) {
                return;
            }

            const dragParentPath = dragPath.slice(0, -1).join(',');
            const hoverParentPath = hoverPath.slice(0, -1).join(',');

            if (dragParentPath === hoverParentPath) {
                const dragIndex = dragPath[dragPath.length - 1];
                const hoverIndex = hoverPath[hoverPath.length - 1];

                const hoverBoundingRect = ref.current?.getBoundingClientRect();
                
                const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                
                const clientOffset = monitor.getClientOffset();
            
                const hoverClientY = clientOffset.y - hoverBoundingRect.top;


                if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                    return;
                }

                if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                    return;
                }
            }

            onMoveBlock(dragPath, hoverPath);
            
            item.path = hoverPath;
        },
        drop(item, monitor) {
            if (monitor.didDrop()) return;
            
            const dragType = monitor.getItemType();
            
            if (dragType === DND_TYPE_NEW_BLOCK && monitor.isOver({ shallow: true })) {
                onAddBlock(path, item.blockType, item.presetData);
                return { name: 'EditableBlockWrapper - New', path };
            }
        },
    });

    drag(drop(ref));

    const opacity = isDragging ? 0 : 1;
    const blockType = { name: block.type, icon: '⚙️' };
    const blockDomId = `block-${block.block_id}`;
    const isSelected = selectedBlockPath && Array.isArray(selectedBlockPath) && Array.isArray(path) && selectedBlockPath.join(',') === path.join(',');
    const isHeaderBlock = block.type === 'header';
    const anchorId = block.data && block.data.anchorId;

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
            toast.error('Помилка при збереженні');
        }
    };

    const originBlockInfo = block._library_origin_id ? { 
        id: block._library_origin_id, 
        name: block._library_name 
    } : null;

    const themeSettings = siteData?.theme_settings || {};

    const actionButtonStyle = {
        padding: isCompact ? '6px' : '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: isCompact ? '30px' : 'auto',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    };

    const saveButtonStyle = {
        ...actionButtonStyle,
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-accent)',
        border: '1px solid var(--platform-border-color)'
    };

    const saveButtonHoverStyle = {
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    };

    const collapseButtonStyle = {
        ...actionButtonStyle,
        background: 'var(--platform-text-secondary)',
        color: 'white'
    };

    const collapseButtonHoverStyle = {
        background: 'var(--platform-text-primary)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    };

    const settingsButtonStyle = {
        ...actionButtonStyle,
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)'
    };

    const settingsButtonHoverStyle = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    };

    const deleteButtonStyle = {
        ...actionButtonStyle,
        background: 'var(--platform-danger)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px'
    };

    const deleteButtonHoverStyle = {
        background: 'var(--platform-danger-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(229, 62, 62, 0.2)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

    const styles = {
        wrapper: {
            opacity,
            cursor: 'grab',
            position: 'relative',
            margin: '20px 0',
            border: isSelected 
                ? '2px solid var(--platform-accent)' 
                : '2px dashed transparent',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            background: block.type === 'layout' ? 'transparent' : 'var(--platform-card-bg)',
            boxShadow: isDragging ? 'none' : (block.type === 'layout' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'),
            maxWidth: '100%',
            overflowX: 'hidden'
        },
        wrapperHover: {
            borderColor: 'var(--platform-accent)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
        }
    };

    return (
        <div
            id={blockDomId}
            ref={ref}
            onClick={handleSelect}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, path, block.block_id)}
            style={{
                ...styles.wrapper,
                border: isSelected 
                    ? '2px solid var(--platform-accent)' 
                    : isHovered 
                    ? '2px dashed var(--platform-accent)' 
                    : '2px dashed var(--platform-border-color)',
                boxShadow: isHovered && !isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : styles.wrapper.boxShadow
            }}
            className="editable-block-wrapper"
            data-handler-id={handlerId}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.header} className="editable-block-header">
                <span style={styles.headerText} title={blockType?.name}>
                    <span style={{cursor: 'grab'}}>⠿</span>
                    <span>{blockType?.icon}</span>
                    <span>{blockType?.name}</span>
                    {anchorId && (
                        <span style={{
                            fontSize: '0.75rem',
                            background: 'rgba(var(--platform-accent-rgb), 0.1)',
                            color: 'var(--platform-accent)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            border: '1px solid var(--platform-accent)'
                        }}>
                            #{anchorId}
                        </span>
                    )}
                </span>
                
                <div style={styles.buttonGroup}>
                    {!isHeaderBlock && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }}
                            style={saveButtonStyle}
                            title={originBlockInfo ? `Оновити "${originBlockInfo.name}"` : "Зберегти в бібліотеку"}
                            onMouseOver={(e) => handleMouseOver(e.target, saveButtonHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, saveButtonStyle)}
                        >
                            💾
                        </button>
                    )}

                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleCollapse(block.block_id); }}
                        style={collapseButtonStyle}
                        title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
                        onMouseOver={(e) => handleMouseOver(e.target, collapseButtonHoverStyle)}
                        onMouseOut={(e) => handleMouseOut(e.target, collapseButtonStyle)}
                    >
                        {isCollapsed ? '🔽' : '🔼'}
                    </button>

                    <button 
                        onClick={handleSelect}
                        style={settingsButtonStyle}
                        title="Налаштування"
                        onMouseOver={(e) => handleMouseOver(e.target, settingsButtonHoverStyle)}
                        onMouseOut={(e) => handleMouseOut(e.target, settingsButtonStyle)}
                    >
                        {isCompact ? '⚙️' : 'Налаштування'}
                    </button>

                    {!isHeaderBlock && (
                        <button 
                            onClick={handleDelete}
                            title="Видалити блок"
                            style={deleteButtonStyle}
                            onMouseOver={(e) => handleMouseOver(e.target, deleteButtonHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, deleteButtonStyle)}
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
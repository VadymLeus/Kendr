// frontend/src/modules/site-editor/components/EditableBlockWrapper.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import BlockRenderer from '../core/BlockRenderer';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';
import apiClient from '../../../common/services/api';
import SaveBlockModal from './SaveBlockModal';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../common/hooks/useConfirm';
import { 
    IconSettings, 
    IconTrash, 
    IconSave, 
    IconGripVertical, 
    IconChevronDown, 
    IconChevronUp,
    IconHelpCircle
} from '../../../common/components/ui/Icons';

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
            if (!ref.current) return;
            const dragPath = item.path;
            const hoverPath = path;
            if (!dragPath || item.type === DND_TYPE_NEW_BLOCK) return;
            if (dragPath.join(',') === hoverPath.join(',')) return;

            const dragParentPath = dragPath.slice(0, -1).join(',');
            const hoverParentPath = hoverPath.slice(0, -1).join(',');

            if (dragParentPath === hoverParentPath) {
                const dragIndex = dragPath[dragPath.length - 1];
                const hoverIndex = hoverPath[hoverPath.length - 1];
                const hoverBoundingRect = ref.current?.getBoundingClientRect();
                const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                const clientOffset = monitor.getClientOffset();
                const hoverClientY = clientOffset.y - hoverBoundingRect.top;

                if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
                if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
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
    const blockType = { name: block.type, icon: <IconSettings size={14} /> };
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
            toast.info("Блок видалено");
        }
    };

    const handleSaveBlock = async (name, mode, targetOverrideId = null) => {
        try {
            const targetId = targetOverrideId || block._library_origin_id;

            if (mode === 'overwrite' && targetId) {
                 await apiClient.put(`/saved-blocks/${targetId}`, { content: block.data });
                toast.success(`Блок успішно оновлено в бібліотеці!`);
            } else {
                await apiClient.post('/saved-blocks', {
                    name: name,
                    type: block.type,
                    content: block.data
                });
                toast.success('Блок успішно збережено в бібліотеку!');
            }
            if (onBlockSaved) onBlockSaved();
        } catch (error) {
            console.error(error);
            toast.error('Помилка при збереженні');
        }
    };

    const originBlockInfo = block._library_origin_id ? { id: block._library_origin_id, name: block._library_name } : null;
    const themeSettings = siteData?.theme_settings || {};

    const baseBtnStyle = {
        background: 'transparent',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-secondary)',
        padding: isCompact ? '6px' : '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        fontSize: '12px',
        fontWeight: '500',
        gap: '6px'
    };

    const handleBtnHover = (e, type) => {
        const style = e.currentTarget.style;
        if (type === 'danger') {
            style.background = 'var(--platform-danger)';
            style.color = '#fff';
            style.borderColor = 'var(--platform-danger)';
        } else if (type === 'primary') {
            style.background = 'var(--platform-accent)';
            style.color = 'var(--platform-accent-text)';
            style.borderColor = 'var(--platform-accent)';
        } else {
            style.background = 'var(--platform-hover-bg)';
            style.color = 'var(--platform-text-primary)';
            style.borderColor = 'var(--platform-accent)';
        }
        style.transform = 'translateY(-1px)';
    };

    const handleBtnOut = (e) => {
        const style = e.currentTarget.style;
        style.background = 'transparent';
        style.borderColor = 'var(--platform-border-color)';
        style.color = 'var(--platform-text-secondary)';
        style.transform = 'translateY(0)';
    };

    const styles = {
        wrapper: {
            opacity,
            cursor: 'grab',
            position: 'relative',
            margin: '20px 0',
            border: isSelected ? '2px solid var(--platform-accent)' : 
                   isHovered ? '2px dashed var(--platform-accent)' : 
                   '2px dashed var(--platform-border-color)',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            background: block.type === 'layout' ? 'transparent' : 'var(--platform-card-bg)',
            boxShadow: isHovered && !isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
            maxWidth: '100%',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: 'var(--platform-card-bg)',
            borderBottom: '1px solid var(--platform-border-color)',
            borderRadius: '8px 8px 0 0',
            gap: '10px'
        },
        headerText: {
            fontSize: '14px', 
            fontWeight: '500', 
            color: 'var(--platform-text-primary)',
            display: 'flex', alignItems: 'center', gap: '8px',
            flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
        }
    };

    return (
        <div
            id={blockDomId}
            ref={ref}
            onClick={handleSelect}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, path, block.block_id)}
            style={styles.wrapper}
            className="editable-block-wrapper"
            data-handler-id={handlerId}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.header} className="editable-block-header">
                <span style={styles.headerText} title={blockType?.name}>
                    <span style={{cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--platform-text-secondary)'}}>
                        <IconGripVertical size={16} />
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', color: 'var(--platform-accent)'}}>
                        {block.icon || <IconHelpCircle size={16} />} 
                    </span>
                    <span>{blockType?.name}</span>
                    {anchorId && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(var(--platform-accent-rgb), 0.1)', color: 'var(--platform-accent)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-accent)' }}>
                            #{anchorId}
                        </span>
                    )}
                </span>
                
                <div style={{display: 'flex', gap: '4px'}}>
                    {!isHeaderBlock && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }}
                            style={baseBtnStyle}
                            title={originBlockInfo ? `Оновити "${originBlockInfo.name}"` : "Зберегти в бібліотеку"}
                            onMouseEnter={(e) => handleBtnHover(e, 'default')}
                            onMouseLeave={handleBtnOut}
                        >
                            <IconSave size={16} />
                        </button>
                    )}

                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleCollapse(block.block_id); }}
                        style={baseBtnStyle}
                        title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
                        onMouseEnter={(e) => handleBtnHover(e, 'default')}
                        onMouseLeave={handleBtnOut}
                    >
                        {isCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
                    </button>

                    <button 
                        onClick={handleSelect}
                        style={baseBtnStyle}
                        title="Налаштування"
                        onMouseEnter={(e) => handleBtnHover(e, 'primary')}
                        onMouseLeave={handleBtnOut}
                    >
                        {isCompact ? <IconSettings size={16} /> : <><IconSettings size={16} /> Налаштування</>}
                    </button>

                    {!isHeaderBlock && (
                        <button 
                            onClick={handleDelete}
                            title="Видалити блок"
                            style={baseBtnStyle}
                            onMouseEnter={(e) => handleBtnHover(e, 'danger')}
                            onMouseLeave={handleBtnOut}
                        >
                            <IconTrash size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isCollapsed ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', borderRadius: '0 0 8px 8px' }}>
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
                        borderRadius: '0 0 8px 8px',
                        '--font-heading': themeSettings.font_heading || "'Inter', sans-serif",
                        '--font-body': themeSettings.font_body || "'Inter', sans-serif",
                        '--btn-radius': themeSettings.button_radius || '8px',
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
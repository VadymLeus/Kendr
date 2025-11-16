// frontend/src/features/editor/EditableBlockWrapper.jsx
import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import BlockRenderer from './blocks/BlockRenderer';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';

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
    selectedBlockPath
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: DRAG_ITEM_TYPE_EXISTING,
        item: { 
            path,
            type: DRAG_ITEM_TYPE_EXISTING
        },
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

                if (dragParentPath !== hoverParentPath) {
                    return;
                }
                
                onMoveBlock(dragPath, hoverPath);
                item.path = hoverPath;
            }
        },
        drop(item, monitor) {
            if (monitor.didDrop()) {
                return;
            }
            
            const dragType = monitor.getItemType();
            if (!monitor.isOver({ shallow: true })) {
                 return;
            }

            if (dragType === DND_TYPE_NEW_BLOCK) {
                onAddBlock(path, item.blockType, item.presetData);
                return { name: 'EditableBlockWrapper - New', path };
            }

            if (dragType === DRAG_ITEM_TYPE_EXISTING) {
                const dragPath = item.path;
                const hoverPath = path;

                if (dragPath.join(',') === hoverPath.join(',')) {
                    return;
                }

                const isDroppingOnSelf = hoverPath.join(',').startsWith(dragPath.join(',')) &&
                                        hoverPath.length > dragPath.length;
                if (isDroppingOnSelf) {
                    console.error("Заборонено: Не можна перемістити макет сам у себе.");
                    return;
                }

                onMoveBlock(dragPath, hoverPath);
                item.path = hoverPath;
                return { name: 'EditableBlockWrapper - Move', path };
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        })
    });

    const wrapperRef = useCallback(node => drag(drop(node)), [drag, drop]);
    const opacity = isDragging ? 0.4 : 1;
    const blockType = { name: block.type, icon: '⚙️' };

    const blockDomId = `block-${block.block_id}`;

    const isSelected = selectedBlockPath && selectedBlockPath.join(',') === path.join(',');

    const handleSelect = (e) => {
        e.stopPropagation(); 
        onSelectBlock(path);
    };

    const handleDelete = (e) => {
        e.stopPropagation(); 
        onDeleteBlock(path);
    };

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
            boxShadow: block.type === 'layout' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
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
        },
        headerText: {
            fontSize: '14px', 
            fontWeight: '500', 
            color: 'var(--platform-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        buttonGroup: {
            display: 'flex', 
            gap: '8px'
        },
        settingsButton: {
            padding: '6px 12px',
            background: 'var(--platform-accent)',
            color: 'var(--platform-accent-text)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
        },
        deleteButton: {
            padding: '6px 10px',
            background: 'var(--platform-danger)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s ease',
        },
        canvas: {
            background: 'var(--platform-card-bg)',
            color: 'var(--platform-text-primary)',
            ...(block.type === 'layout' && { background: 'transparent' }),
            '--font-heading': themeSettings.font_heading || 'sans-serif',
            '--font-body': themeSettings.font_body || 'sans-serif',
            '--btn-radius': themeSettings.button_radius || '4px',
            transition: 'all 0.2s ease',
            borderRadius: '0 0 8px 8px',
        }
    };

    const handleButtonHover = (e) => {
        e.target.style.opacity = '0.9';
        e.target.style.transform = 'translateY(-1px)';
    };

    const handleButtonLeave = (e) => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
    };

    return (
        <div
            id={blockDomId}
            ref={wrapperRef}
            onClick={handleSelect}
            style={styles.wrapper}
            className="editable-block-wrapper"
        >
            <div
                style={styles.header}
                className="editable-block-header"
            >
                <span style={styles.headerText}>
                    <span>{blockType?.icon}</span>
                    <span>{blockType?.name}</span>
                </span>
                <div style={styles.buttonGroup}>
                    <button 
                        onClick={handleSelect}
                        style={styles.settingsButton}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        Налаштування
                    </button>
                    <button 
                        onClick={handleDelete}
                        title="Видалити блок"
                        style={styles.deleteButton}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        &times;
                    </button>
                </div>
            </div>

            <div
                data-site-mode={siteData?.site_theme_mode || 'light'}
                data-site-accent={siteData?.site_theme_accent || 'orange'}
                style={styles.canvas}
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
        </div>
    );
};

export default EditableBlockWrapper;
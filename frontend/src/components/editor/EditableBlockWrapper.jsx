// frontend/src/components/editor/EditableBlockWrapper.jsx
import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import BlockRenderer from '../blocks/BlockRenderer';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';

const EditableBlockWrapper = ({ 
    block, 
    siteData, 
    path, 
    onMoveBlock, 
    onDropBlock,
    onDeleteBlock,
    onEditBlock,
    onAddBlock
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
                onMoveBlock(dragPath, hoverPath);
                item.path = hoverPath;
            }
        },
        drop(item, monitor) {
            if (monitor.didDrop()) return;
            
            if (item.type === DND_TYPE_NEW_BLOCK) {
                onAddBlock(path, item.blockType, item.presetData);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        })
    });

    const wrapperRef = useCallback(node => drag(drop(node)), [drag, drop]);
    const opacity = isDragging ? 0.4 : 1;

    const blockType = { name: block.type, icon: '⚙️' };

    return (
        <div
            ref={wrapperRef}
            style={{
                opacity,
                cursor: 'move',
                position: 'relative',
                margin: '20px 0',
                border: isOver ? '2px dashed var(--site-accent)' : '2px dashed var(--site-border-color)',
                borderRadius: '8px',
                transition: 'border-color 0.2s ease'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--site-bg-secondary)',
                    borderBottom: '1px solid var(--site-border-color)',
                    borderRadius: '8px 8px 0 0'
                }}
            >
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--site-text-primary)' }}>
                    {blockType?.icon} {blockType?.name}
                </span>
                <div>
                    <button 
                        onClick={() => onEditBlock(path)}
                        style={{
                            marginRight: '8px',
                            padding: '4px 8px',
                            background: 'var(--site-accent)',
                            color: 'var(--site-accent-text)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Налаштування
                    </button>
                    <button 
                        onClick={() => onDeleteBlock(path)}
                        style={{
                            padding: '4px 8px',
                            background: 'var(--site-error)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Видалити
                    </button>
                </div>
            </div>

            <div
                className="site-theme-context"
                data-site-mode={siteData.site_theme_mode || 'light'}
                data-site-accent={siteData.site_theme_accent || 'orange'}
                style={{
                    background: 'var(--site-bg)',
                    color: 'var(--site-text-primary)'
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
                    onEditBlock={onEditBlock}
                    onAddBlock={onAddBlock}
                />
            </div>
        </div>
    );
};

export default EditableBlockWrapper;
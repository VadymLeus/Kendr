// frontend/src/components/editor/EditableBlockWrapper.jsx
import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import BlockRenderer from '../blocks/BlockRenderer';

const DRAG_ITEM_TYPE = 'BLOCK';

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
        type: DRAG_ITEM_TYPE,
        item: { path },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: DRAG_ITEM_TYPE,
        hover(item, monitor) {
            if (!monitor.canDrop()) return;

            const dragPath = item.path;
            const hoverPath = path;

            if (dragPath.join(',') === hoverPath.join(',')) return;

            onMoveBlock(dragPath, hoverPath);
            item.path = hoverPath;
        },
    });

    const wrapperRef = useCallback(node => drag(drop(node)), [drag, drop]);
    const opacity = isDragging ? 0.4 : 1;

    const blockType = { name: block.type, icon: '⚙️' }; // Тимчасова заглушка

    return (
        <div
            ref={wrapperRef}
            style={{
                opacity,
                cursor: 'move',
                position: 'relative',
                margin: '20px 0',
                border: '2px dashed var(--site-border-color)',
                borderRadius: '8px'
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
                <button onClick={() => onEditBlock(path)}>
                    Налаштування
                </button>
                <button onClick={() => onDeleteBlock(path)}>
                    Видалити
                </button>
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
                {/* Рекурсивний рендер блоків */}
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

// frontend/src/components/editor/tabs/BlockLayerItem.jsx
import React, { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { BLOCK_LIBRARY } from "../editorConfig";

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';

const layerItemStyle = {
    padding: '0.5rem 0.75rem',
    margin: '0.25rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--site-card-bg)',
    border: '1px solid var(--site-border-color)',
    borderRadius: '4px',
    cursor: 'grab',
    transition: 'all 0.2s ease',
    color: 'var(--site-text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500
};

const nestedContainerStyle = {
    marginLeft: '1.5rem',
    paddingLeft: '0.5rem',
    borderLeft: '2px solid var(--site-border-color)'
};

const BlockLayerItem = ({
    block,
    path,
    onMoveBlock,
    onSelectBlock,
    onDeleteBlock
}) => {
    const ref = useRef(null);
    const blockInfo = BLOCK_LIBRARY.find(b => b.type === block.type) || { name: block.type, icon: '❓' };

    const [{ isDragging }, drag] = useDrag({
        type: DRAG_ITEM_TYPE_EXISTING,
        item: { path },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: DRAG_ITEM_TYPE_EXISTING,
        hover(item, monitor) {
            if (!ref.current) return;
            if (!monitor.canDrop()) return;

            const dragPath = item.path;
            const hoverPath = path;

            if (dragPath.join(',') === hoverPath.join(',')) return;

            onMoveBlock(dragPath, hoverPath);
            item.path = hoverPath;
        },
    });

    drag(drop(ref));

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelectBlock(path);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDeleteBlock(path);
    };

    let nestedBlocks = null;
    if (block.type === 'layout' && block.data.columns) {
        nestedBlocks = (
            <div style={nestedContainerStyle}>
                {block.data.columns.map((column, colIndex) => (
                    <div key={colIndex} style={{ padding: '5px', fontStyle: 'italic', color: 'var(--site-text-secondary)' }}>
                        <small>Колонка {colIndex + 1}</small>
                        {column.map((colBlock, colBlockIndex) => (
                            <BlockLayerItem
                                key={colBlock.block_id}
                                block={colBlock}
                                path={[...path, 'data', 'columns', colIndex, colBlockIndex]}
                                onMoveBlock={onMoveBlock}
                                onSelectBlock={onSelectBlock}
                                onDeleteBlock={onDeleteBlock}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div
                ref={ref}
                style={{
                    ...layerItemStyle,
                    opacity: isDragging ? 0.3 : 1,
                    border: isDragging ? '2px dashed var(--site-accent)' : layerItemStyle.border
                }}
            >
                <span style={{ fontSize: '1rem' }}>{blockInfo.icon}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {blockInfo.name}
                </span>
                
                <button title="Налаштування" onClick={handleSelect} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--site-text-secondary)'}}>⚙️</button>
                <button title="Видалити" onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-danger)'}}>❌</button>
            </div>
            {nestedBlocks}
        </>
    );
};

export default BlockLayerItem;
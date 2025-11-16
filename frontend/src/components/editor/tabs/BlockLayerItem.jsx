// frontend/src/components/editor/tabs/BlockLayerItem.jsx
import React, { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { BLOCK_LIBRARY } from "../editorConfig";

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';

const BlockLayerItem = ({
    block,
    path,
    onMoveBlock,
    onSelectBlock,
    onDeleteBlock
}) => {
    const ref = useRef(null);
    const blockInfo = BLOCK_LIBRARY.find(b => b.type === block.type) || { name: block.type, icon: '❓' };

    const styles = {
        layerItem: {
            padding: '0.75rem 1rem',
            margin: '0.25rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '8px',
            cursor: 'grab',
            transition: 'all 0.2s ease',
            color: 'var(--platform-text-primary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        },
        nestedContainer: {
            marginLeft: '1.5rem',
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--platform-border-color)',
            marginTop: '0.5rem'
        },
        columnLabel: {
            padding: '0.5rem',
            fontStyle: 'italic',
            color: 'var(--platform-text-secondary)',
            fontSize: '0.8rem',
            background: 'var(--platform-bg)',
            borderRadius: '4px',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        icon: {
            fontSize: '1rem',
            opacity: 0.8,
            flexShrink: 0
        },
        name: {
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0
        },
        button: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            flexShrink: 0
        },
        settingsButton: {
            color: 'var(--platform-text-secondary)'
        },
        deleteButton: {
            color: 'var(--platform-danger)'
        }
    };

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

    const handleDelete = (e) => {
        e.stopPropagation();
        onDeleteBlock(path);
    };

    const handleSelectAndScroll = (e) => {
        e.stopPropagation();
        onSelectBlock(path);

        const blockDomId = `block-${block.block_id}`;
        const element = document.getElementById(blockDomId);

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    };

    let nestedBlocks = null;
    if (block.type === 'layout' && block.data.columns) {
        nestedBlocks = (
            <div style={styles.nestedContainer}>
                {block.data.columns.map((column, colIndex) => (
                    <div key={colIndex}>
                        <div style={styles.columnLabel}>
                            <span>📑</span>
                            <span>Колонка {colIndex + 1}</span>
                            <small style={{ marginLeft: 'auto', opacity: 0.7 }}>
                                {column.length} блок(ів)
                            </small>
                        </div>
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
                    ...styles.layerItem,
                    opacity: isDragging ? 0.3 : 1,
                    border: isDragging ? '2px dashed var(--platform-accent)' : styles.layerItem.border,
                    transform: isDragging ? 'scale(0.98)' : 'scale(1)'
                }}
                onClick={handleSelectAndScroll}
                onMouseEnter={(e) => {
                    if (!isDragging) {
                        e.target.style.transform = 'translateX(4px)';
                        e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isDragging) {
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }
                }}
            >
                <span style={styles.icon}>{blockInfo.icon}</span>
                <span style={styles.name}>
                    {blockInfo.name}
                </span>
                
                <button 
                    title="Налаштування" 
                    onClick={handleSelectAndScroll}
                    style={{
                        ...styles.button,
                        ...styles.settingsButton
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--platform-bg)';
                        e.target.style.color = 'var(--platform-accent)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = 'var(--platform-text-secondary)';
                    }}
                >
                    ⚙️
                </button>
                <button 
                    title="Видалити" 
                    onClick={handleDelete} 
                    style={{
                        ...styles.button,
                        ...styles.deleteButton
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--platform-danger)';
                        e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = 'var(--platform-danger)';
                    }}
                >
                    ❌
                </button>
            </div>
            {nestedBlocks}
        </>
    );
};

export default BlockLayerItem;
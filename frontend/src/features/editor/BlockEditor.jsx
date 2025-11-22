// frontend/src/features/editor/BlockEditor.jsx
import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from './EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';

const BlockEditor = ({
    blocks,
    siteData,
    onAddBlock,
    onMoveBlock,
    onDropBlock,
    onDeleteBlock,
    onSelectBlock,
    selectedBlockPath,
    collapsedBlocks,
    onToggleCollapse,
    onBlockSaved,
    isHeaderMode
}) => {
    
    const [, dropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            onAddBlock([blocks.length], item.blockType, item.presetData); 
        },
    }), [blocks.length, onAddBlock]);

    const emptyDropRef = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            onAddBlock([blocks.length], item.blockType, item.presetData); 
        },
    }), [blocks.length, onAddBlock])[1];

    return (
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
            {blocks.length === 0 && (
                <div
                    ref={emptyDropRef}
                    style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '2px dashed var(--platform-border-color)',
                        borderRadius: '12px',
                        color: 'var(--platform-text-secondary)',
                        margin: '20px 0',
                        background: 'var(--platform-bg)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--platform-accent)';
                        e.target.style.color = 'var(--platform-accent)';
                        e.target.style.background = 'rgba(var(--platform-accent-rgb), 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--platform-border-color)';
                        e.target.style.color = 'var(--platform-text-secondary)';
                        e.target.style.background = 'var(--platform-bg)';
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <h3 style={{ 
                        color: 'inherit', 
                        marginBottom: '0.5rem',
                        fontSize: '1.2rem'
                    }}>
                        Початок роботи
                    </h3>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '0.95rem',
                        opacity: 0.8
                    }}>
                        Перетягніть блок з бібліотеки або натисніть "+" у панелі додавання блоків
                    </p>
                </div>
            )}

            <div className="blocks-container">
                {blocks.map((block, index) => (
                    <React.Fragment key={block.block_id}>
                        <EditableBlockWrapper
                            index={index}
                            block={block}
                            siteData={siteData}
                            path={[index]}
                            onMoveBlock={onMoveBlock}
                            onDropBlock={onDropBlock}
                            onDeleteBlock={onDeleteBlock}
                            onAddBlock={onAddBlock}
                            onSelectBlock={onSelectBlock}
                            selectedBlockPath={selectedBlockPath}
                            isCollapsed={collapsedBlocks.includes(block.block_id)}
                            onToggleCollapse={onToggleCollapse}
                            onBlockSaved={onBlockSaved}
                        />
                    </React.Fragment>
                ))}
            </div>

            {blocks.length > 0 && !isHeaderMode && (
                 <div
                    ref={dropRef}
                    style={{
                        padding: '2rem',
                        textAlign: 'center',
                        border: '2px dashed var(--platform-border-color)',
                        borderRadius: '8px',
                        color: 'var(--platform-text-secondary)',
                        margin: '20px 0',
                        opacity: 0.7,
                        transition: 'all 0.3s ease',
                        background: 'var(--platform-bg)',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--platform-accent)';
                        e.target.style.color = 'var(--platform-accent)';
                        e.target.style.opacity = '1';
                        e.target.style.background = 'rgba(var(--platform-accent-rgb), 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--platform-border-color)';
                        e.target.style.color = 'var(--platform-text-secondary)';
                        e.target.style.opacity = '0.7';
                        e.target.style.background = 'var(--platform-bg)';
                    }}
                >
                    <p style={{ 
                        margin: 0, 
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        Перетягніть блок сюди, щоб додати в кінець
                    </p>
                </div>
            )}

            {blocks.length > 0 && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    padding: '1rem',
                    color: 'var(--platform-text-secondary)',
                    fontSize: '0.8rem',
                    opacity: 0.6
                }}>
                </div>
            )}
        </div>
    );
};

export default BlockEditor;
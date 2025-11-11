// frontend/src/components/editor/BlockEditor.jsx
import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from './EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';

const BlockEditor = ({
    blocks,
    siteData,
    onSave,
    onAddBlock,
    onMoveBlock,
    onDropBlock,
    onDeleteBlock,
    onEditBlock
}) => {
    
    const handlePublish = () => onSave(blocks);
    
    const [, dropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            onAddBlock([blocks.length], item.blockType, item.presetData); 
        },
    }), [blocks.length, onAddBlock]);

    return (
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: 'var(--site-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--site-border-color)'
                }}
            >
                <button
                    onClick={handlePublish}
                    style={{
                        backgroundColor: 'var(--site-accent)',
                        color: 'var(--site-accent-text)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    💾 Зберегти зміни
                </button>
            </div>

            {blocks.length === 0 && (
                <div
                    ref={dropRef}
                    style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '2px dashed var(--site-border-color)',
                        borderRadius: '8px',
                        color: 'var(--site-text-secondary)',
                        margin: '20px 0'
                    }}
                >
                    Перетягніть сюди свій перший блок
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
                            onEditBlock={onEditBlock}
                            onAddBlock={onAddBlock}
                        />
                    </React.Fragment>
                ))}
            </div>

            {blocks.length > 0 && (
                 <div
                    ref={dropRef}
                    style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        border: '2px dashed var(--site-border-color)',
                        borderRadius: '8px',
                        color: 'var(--site-text-secondary)',
                        margin: '20px 0',
                        opacity: 0.7
                    }}
                >
                    Перетягніть блок сюди, щоб додати в кінець
                </div>
            )}
        </div>
    );
};

export default BlockEditor;
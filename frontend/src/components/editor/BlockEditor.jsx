// frontend/src/components/editor/BlockEditor.jsx
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
    selectedBlockPath
}) => {
    
    const [, dropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            onAddBlock([blocks.length], item.blockType, item.presetData); 
        },
    }), [blocks.length, onAddBlock]);

    return (
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
            {blocks.length === 0 && (
                <div
                    ref={dropRef}
                    style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '2px dashed var(--platform-border-color)',
                        borderRadius: '8px',
                        color: 'var(--platform-text-secondary)',
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
                            onAddBlock={onAddBlock}
                            onSelectBlock={onSelectBlock}
                            selectedBlockPath={selectedBlockPath}
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
                        border: '2px dashed var(--platform-border-color)',
                        borderRadius: '8px',
                        color: 'var(--platform-text-secondary)',
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
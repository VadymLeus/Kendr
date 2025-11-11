// frontend/src/components/blocks/LayoutBlock.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../editor/EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from '../editor/DraggableBlockItem';
import BlockRenderer from './BlockRenderer';

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';

const getLayoutStyles = (preset) => {
    const baseStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '20px'
    };

    switch (preset) {
        case '50-50':
            return { ...baseStyle, gridTemplateColumns: '1fr 1fr', display: 'grid' };
        case '33-33-33':
            return { ...baseStyle, gridTemplateColumns: '1fr 1fr 1fr', display: 'grid' };
        case '30-70':
            return { ...baseStyle, gridTemplateColumns: '0.3fr 0.7fr', display: 'grid' };
        case '100':
        default:
            return { ...baseStyle, gridTemplateColumns: '1fr', display: 'grid' };
    }
};

const ColumnDropZone = ({ children, onDrop, path, isEditorPreview, onAddBlock }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: [DRAG_ITEM_TYPE_EXISTING, DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            
            if (item.type === DRAG_ITEM_TYPE_EXISTING) {
                onDrop(item, path);
            } else if (item.type === DND_TYPE_NEW_BLOCK) {
                const newBlockPath = [...path, React.Children.count(children)];
                onAddBlock(newBlockPath, item.blockType, item.presetData);
            }
        },
        canDrop: () => isEditorPreview,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const columnStyle = {
        flex: 1,
        minHeight: '150px',
        padding: '10px',
        borderRadius: '8px',
        border: isOver && canDrop ? '2px dashed var(--site-accent)' : '2px dashed var(--site-border-color)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        backgroundColor: isOver && canDrop ? 'rgba(var(--site-accent-rgb), 0.1)' : 'transparent',
    };

    if (!isEditorPreview) {
        return <div style={{ flex: 1 }}>{children}</div>;
    }

    return (
        <div ref={drop} style={columnStyle}>
            {children}
            {React.Children.count(children) === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    color: 'var(--site-text-secondary)', 
                    paddingTop: '50px',
                    fontSize: '14px'
                }}>
                    Перетягніть блоки сюди
                </div>
            )}
        </div>
    );
};

const LayoutBlock = ({ 
    block, 
    siteData, 
    isEditorPreview, 
    path, 
    onMoveBlock, 
    onDropBlock, 
    onDeleteBlock, 
    onEditBlock, 
    onAddBlock 
}) => {
    const { preset, columns = [] } = block.data;
    const layoutStyle = getLayoutStyles(preset);

    if (!isEditorPreview) {
        return (
            <div style={layoutStyle}>
                {columns.map((columnBlocks, colIndex) => (
                    <div key={colIndex} style={{ flex: 1, minWidth: '250px' }}>
                        <BlockRenderer
                            blocks={columnBlocks}
                            siteData={siteData}
                            isEditorPreview={false}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={layoutStyle}>
            {columns.map((columnBlocks, colIndex) => {
                const columnPath = [...path, 'data', 'columns', colIndex];
                return (
                    <ColumnDropZone
                        key={colIndex}
                        isEditorPreview={isEditorPreview}
                        path={columnPath}
                        onDrop={onDropBlock}
                        onAddBlock={onAddBlock}
                    >
                        {columnBlocks.map((childBlock, childIndex) => (
                            <EditableBlockWrapper
                                key={childBlock.block_id}
                                block={childBlock}
                                siteData={siteData}
                                path={[...columnPath, childIndex]}
                                onMoveBlock={onMoveBlock}
                                onDropBlock={onDropBlock}
                                onDeleteBlock={onDeleteBlock}
                                onEditBlock={onEditBlock}
                                onAddBlock={onAddBlock}
                            />
                        ))}
                    </ColumnDropZone>
                );
            })}
        </div>
    );
};

export default LayoutBlock;
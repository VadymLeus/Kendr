// frontend/src/features/editor/blocks/LayoutBlock.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from '../DraggableBlockItem';
import BlockRenderer from './BlockRenderer';

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';

const getLayoutStyles = (direction = 'row', preset, verticalAlign = 'top', horizontalAlign = 'start') => {
    
    const verticalAlignMap = {
        top: 'start',
        middle: 'center',
        bottom: 'end'
    };
    const horizontalAlignMap = {
        start: 'start',
        center: 'center',
        end: 'end'
    };
    
    const baseStyle = {
        display: 'grid',
        gap: '20px',
        padding: '20px',
        backgroundColor: 'transparent',
        background: 'none',
        alignItems: verticalAlignMap[verticalAlign] || 'start',
        justifyItems: direction === 'column' ? (horizontalAlignMap[horizontalAlign] || 'stretch') : 'stretch',
    };

    if (direction === 'column') {
        baseStyle.gridTemplateColumns = '1fr';
        return baseStyle;
    }

    switch (preset) {
        case '50-50':
            baseStyle.gridTemplateColumns = '1fr 1fr';
            break;
        case '75-25':
            baseStyle.gridTemplateColumns = '3fr 1fr';
            break;
        case '25-75':
            baseStyle.gridTemplateColumns = '1fr 3fr';
            break;
        case '33-33-33':
            baseStyle.gridTemplateColumns = '1fr 1fr 1fr';
            break;
        case '25-25-25-25':
            baseStyle.gridTemplateColumns = '1fr 1fr 1fr 1fr';
            break;
        default: 
            baseStyle.gridTemplateColumns = '1fr 1fr';
    }
    
    return baseStyle;
};

const ColumnDropZone = ({ children, onDrop, path, isEditorPreview, onAddBlock }) => {
    const accent = isEditorPreview ? 'var(--platform-accent)' : 'var(--site-accent)';
    const borderColor = isEditorPreview ? 'var(--platform-border-color)' : 'var(--site-border-color)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: [DRAG_ITEM_TYPE_EXISTING, DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            const dragType = monitor.getItemType();
            
            if (dragType === DRAG_ITEM_TYPE_EXISTING) {
                const dragPath = item.path;
                const dropZonePath = path;
                const isDroppingOnSelf = dropZonePath.join(',').startsWith(dragPath.join(',')) &&
                                        dropZonePath.length > dragPath.length;
                if (isDroppingOnSelf) {
                    console.error("Помилка: Не можна перемістити макет сам у себе.");
                    return;
                }
                onDrop(item, path);
            } else if (dragType === DND_TYPE_NEW_BLOCK) {
                const newBlockPath = [...path, React.Children.count(children)];
                onAddBlock(newBlockPath, item.blockType, item.presetData);
            }
            return { name: 'ColumnDropZone', path };
        },
        canDrop: () => isEditorPreview,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const columnStyle = {
        minHeight: '150px',
        padding: '10px',
        borderRadius: '8px',
        border: isOver && canDrop ? `2px dashed ${accent}` : `2px dashed ${borderColor}`,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        backgroundColor: isOver && canDrop ? 'rgba(66, 153, 225, 0.1)' : 'transparent',
        width: '100%',
        boxSizing: 'border-box'
    };

    if (!isEditorPreview) {
        return <div style={{ backgroundColor: 'transparent' }}>{children}</div>;
    }

    return (
        <div ref={drop} style={columnStyle}>
            {children}
            {React.Children.count(children) === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    color: textSecondary, 
                    paddingTop: '50px',
                    fontSize: '14px',
                    pointerEvents: 'none',
                    backgroundColor: 'transparent'
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
    onSelectBlock, 
    selectedBlockPath,
    onAddBlock 
}) => {
    const { preset, columns = [], direction, verticalAlign, horizontalAlign } = block.data;
    const layoutStyle = getLayoutStyles(direction, preset, verticalAlign, horizontalAlign);

    if (!isEditorPreview) {
        return (
            <div style={layoutStyle}>
                {columns.map((columnBlocks, colIndex) => (
                    <div key={colIndex} style={{ 
                        minWidth: '0',
                        backgroundColor: 'transparent'
                    }}>
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
                                onAddBlock={onAddBlock}
                                onSelectBlock={onSelectBlock}
                                selectedBlockPath={selectedBlockPath}
                            />
                        ))}
                    </ColumnDropZone>
                );
            })}
        </div>
    );
};

export default LayoutBlock;
// frontend/src/modules/editor/blocks/Layout/LayoutBlock.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../../ui/EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from '../../ui/DraggableBlockItem';
import BlockRenderer from '../../core/BlockRenderer';
import { Plus } from 'lucide-react';

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
    const siteAccent = 'var(--platform-accent)'; 
    const siteBorderColor = 'var(--platform-border-color)';

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

    const columnRef = useRef(null);
    const contentRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!isEditorPreview) return;

        const calculateScale = () => {
            if (columnRef.current && contentRef.current) {
                const columnWidth = columnRef.current.offsetWidth;
                const MIN_COMFORTABLE_WIDTH = 250; 

                if (columnWidth < MIN_COMFORTABLE_WIDTH && columnWidth > 0) {
                    const newScale = columnWidth / MIN_COMFORTABLE_WIDTH;
                    setScale(newScale);
                } else {
                    setScale(1);
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            calculateScale();
        });

        if (columnRef.current) {
            resizeObserver.observe(columnRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [isEditorPreview, children]);

    const setRefs = useCallback((node) => {
        drop(node);
        columnRef.current = node;
    }, [drop]);

    const columnStyle = {
        minHeight: '150px',
        padding: '12px',
        borderRadius: '8px',
        border: isOver && canDrop 
            ? `2px dashed ${siteAccent}` 
            : `1px dashed ${siteBorderColor}`,
        transition: 'all 0.2s ease',
        backgroundColor: isOver && canDrop 
            ? 'rgba(66, 153, 225, 0.05)' 
            : 'transparent',
        width: '100%', 
        boxSizing: 'border-box',
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    };

    const contentWrapperStyle = {
        flex: 1,
        width: scale < 1 ? `${(1/scale) * 100}%` : '100%',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        marginBottom: scale < 1 ? `-${(1 - scale) * 100}%` : '0',
    };

    if (!isEditorPreview) {
        return <div style={{ backgroundColor: 'transparent' }}>{children}</div>;
    }

    return (
        <div ref={setRefs} style={columnStyle}>
            <div ref={contentRef} style={contentWrapperStyle}>
                {children}
                
                {React.Children.count(children) === 0 && (
                    <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '120px',
                        color: 'var(--platform-text-secondary)',
                        opacity: 0.6,
                        pointerEvents: 'none',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            border: '1px solid var(--platform-border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px',
                            background: 'var(--platform-bg)'
                        }}>
                            <Plus size={20} />
                        </div>
                        <span style={{ fontSize: '0.85rem' }}>Перетягніть блок сюди</span>
                    </div>
                )}
            </div>
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
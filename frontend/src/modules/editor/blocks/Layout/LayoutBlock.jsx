// frontend/src/modules/editor/blocks/Layout/LayoutBlock.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../../ui/EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from '../../ui/DraggableBlockItem';
import BlockRenderer from '../../core/BlockRenderer';
import { Plus } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';
const getGridStyles = (direction = 'row', preset, verticalAlign = 'top', gap = 20) => {
    
    const verticalAlignMap = {
        top: 'start',
        middle: 'center',
        bottom: 'end',
        stretch: 'stretch'
    };

    const baseStyle = {
        display: 'grid',
        gap: `${gap}px`,
        width: '100%',
        alignItems: verticalAlignMap[verticalAlign] || 'start', 
        zIndex: 2,
        position: 'relative'
    };

    if (direction === 'column') {
        baseStyle.gridTemplateColumns = '1fr';
        return baseStyle;
    }

    switch (preset) {
        case '50-50': baseStyle.gridTemplateColumns = '1fr 1fr'; break;
        case '75-25': baseStyle.gridTemplateColumns = '3fr 1fr'; break;
        case '25-75': baseStyle.gridTemplateColumns = '1fr 3fr'; break;
        case '33-33-33': baseStyle.gridTemplateColumns = '1fr 1fr 1fr'; break;
        case '25-25-25-25': baseStyle.gridTemplateColumns = '1fr 1fr 1fr 1fr'; break;
        default: baseStyle.gridTemplateColumns = '1fr 1fr';
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
                
                if (isDroppingOnSelf) return;
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
            if (columnRef.current) {
                const columnWidth = columnRef.current.offsetWidth;
                const MIN_COMFORTABLE_WIDTH = 250; 
                if (columnWidth < MIN_COMFORTABLE_WIDTH && columnWidth > 0) {
                    setScale(columnWidth / MIN_COMFORTABLE_WIDTH);
                } else {
                    setScale(1);
                }
            }
        };
        const observer = new ResizeObserver(calculateScale);
        if (columnRef.current) observer.observe(columnRef.current);
        return () => observer.disconnect();
    }, [isEditorPreview, children]);

    const setRefs = useCallback((node) => {
        drop(node);
        columnRef.current = node;
    }, [drop]);

    const columnStyle = {
        minHeight: '100px',
        padding: '10px',
        borderRadius: '8px',
        border: isOver && canDrop ? `2px dashed ${siteAccent}` : `1px dashed ${isEditorPreview ? siteBorderColor : 'transparent'}`,
        transition: 'all 0.2s ease',
        backgroundColor: isOver && canDrop ? 'rgba(66, 153, 225, 0.05)' : 'transparent',
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

    return (
        <div ref={setRefs} style={columnStyle}>
            <div ref={contentRef} style={contentWrapperStyle}>
                {children}
                {isEditorPreview && React.Children.count(children) === 0 && (
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '100px', color: 'var(--platform-text-secondary)', opacity: 0.6, pointerEvents: 'none'
                    }}>
                        <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--platform-border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', background: 'var(--platform-bg)'
                        }}>
                            <Plus size={16} />
                        </div>
                        <span style={{ fontSize: '0.75rem' }}>Сюди блок</span>
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
    path = [], 
    onMoveBlock, 
    onDropBlock, 
    onDeleteBlock, 
    onSelectBlock, 
    selectedBlockPath,
    onAddBlock 
}) => {
    const { 
        preset, 
        columns = [], 
        direction = 'row', 
        verticalAlign = 'top', 
        gap = 20,
        height = 'auto', 
        styles = {},
        minHeight: legacyMinHeight,
        padding: legacyPadding = '20px',
        bg_type = 'none', 
        bg_color = 'transparent',
        bg_image,
        bg_video,
        overlay_color = '#000000',
        overlay_opacity = 0
    } = block.data;

    const videoRef = useRef(null);
    const heightMap = { 
        small: '300px',
        medium: '500px',
        large: '700px',
        full: '100vh',
        auto: 'auto'
    };

    const activeMinHeight = heightMap[height] || (legacyMinHeight === 'screen' ? '100vh' : legacyMinHeight) || 'auto';
    const fullImageUrl = bg_image 
        ? (bg_image.startsWith('http') ? bg_image : `${API_URL}${bg_image}`)
        : null;
    const fullVideoUrl = bg_video 
        ? (bg_video.startsWith('http') ? bg_video : `${API_URL}${bg_video}`)
        : null;

    useEffect(() => {
        if (videoRef.current && bg_type === 'video') {
            videoRef.current.play().catch(e => console.error("Autoplay failed", e));
        }
    }, [bg_type, fullVideoUrl]);

    const containerStyle = {
        position: 'relative',
        minHeight: activeMinHeight,
        padding: legacyPadding,
        ...styles, 
        backgroundColor: bg_type === 'color' ? bg_color : 'var(--site-bg, #f7fafc)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: activeMinHeight !== 'auto' ? (
            verticalAlign === 'middle' ? 'center' : (verticalAlign === 'bottom' ? 'flex-end' : 'flex-start')
        ) : 'flex-start',
    };

    const renderBackground = () => {
        if (bg_type === 'image' && fullImageUrl) {
            return (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundImage: `url(${fullImageUrl})`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }} />
            );
        }
        if (bg_type === 'video' && fullVideoUrl) {
            return (
                <video
                    ref={videoRef}
                    src={fullVideoUrl}
                    poster={fullImageUrl}
                    autoPlay muted loop playsInline
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                />
            );
        }
        return null;
    };

    const gridStyle = getGridStyles(direction, preset, verticalAlign, gap);

    return (
        <div style={containerStyle} id={block.data.anchorId}>
            {renderBackground()}
            {(bg_type === 'image' || bg_type === 'video') && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    backgroundColor: overlay_color,
                    opacity: parseFloat(overlay_opacity) || 0
                }} />
            )}
            <div style={gridStyle}>
                {columns.map((columnBlocks, colIndex) => {
                    const safePath = path || [];
                    const columnPath = [...safePath, 'data', 'columns', colIndex];
                    
                    if (!isEditorPreview) {
                        return (
                            <div key={colIndex} style={{ minWidth: '0' }}>
                                <BlockRenderer
                                    blocks={columnBlocks}
                                    siteData={siteData}
                                    isEditorPreview={false}
                                />
                            </div>
                        );
                    }

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
        </div>
    );
};

export default LayoutBlock;
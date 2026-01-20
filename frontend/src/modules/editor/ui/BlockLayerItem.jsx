// frontend/src/modules/editor/ui/BlockLayerItem.jsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { BLOCK_LIBRARY } from '../core/editorConfig'; 
import { Settings, Trash2, PanelTop, HelpCircle } from 'lucide-react';

const DRAG_ITEM_TYPE_EXISTING = 'BLOCK';
const rigidIconWrapper = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '20px', height: '20px', minWidth: '20px', flexShrink: 0
};

const rigidButtonWrapper = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '24px', height: '24px', minWidth: '24px', flexShrink: 0,
    border: 'none', background: 'transparent', cursor: 'pointer',
    borderRadius: '4px', padding: 0, transition: 'all 0.2s'
};

const BlockLayerItem = ({
    block,
    path,
    onMoveBlock,
    onSelectBlock,
    onDeleteBlock
}) => {
    const ref = useRef(null);
    const blockInfo = BLOCK_LIBRARY.find(b => b.type === block.type) || { 
        name: block.type, 
        icon: <HelpCircle size={16} /> 
    };

    const styles = {
        layerItem: {
            padding: '0.6rem 0.8rem',
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        },
        nestedContainer: {
            marginLeft: '1.25rem',
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
        iconContainer: {
            ...rigidIconWrapper,
            color: 'var(--platform-accent)',
            opacity: 0.8
        },
        nameContainer: {
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
            lineHeight: '1.2'
        },
        actionsContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
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
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    };

    const handleBtnEnter = (e, color, bg) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.background = bg;
    };
    const handleBtnLeave = (e, color) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.background = 'transparent';
    };

    let nestedBlocks = null;
    if (block.type === 'layout' && block.data.columns) {
        nestedBlocks = (
            <div style={styles.nestedContainer}>
                {block.data.columns.map((column, colIndex) => (
                    <div key={colIndex}>
                        <div style={styles.columnLabel}>
                            <div style={{...rigidIconWrapper, width: '16px', height: '16px', minWidth: '16px'}}>
                                <PanelTop size={14} />
                            </div>
                            <span style={styles.nameContainer}>Колонка {colIndex + 1}</span>
                            <small style={{ marginLeft: 'auto', opacity: 0.7, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {column.length} ел.
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
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isDragging) {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }
                }}
            >
                <div style={styles.iconContainer}>
                    {blockInfo.icon}
                </div>

                <div style={styles.nameContainer}>
                    {blockInfo.name}
                </div>
                
                <div style={styles.actionsContainer}>
                    <button 
                        title="Налаштування" 
                        onClick={handleSelectAndScroll}
                        style={{ ...rigidButtonWrapper, color: 'var(--platform-text-secondary)' }}
                        onMouseEnter={(e) => handleBtnEnter(e, 'var(--platform-accent)', 'var(--platform-bg)')}
                        onMouseLeave={(e) => handleBtnLeave(e, 'var(--platform-text-secondary)')}
                    >
                        <Settings size={14} />
                    </button>
                    <button 
                        title="Видалити" 
                        onClick={handleDelete} 
                        style={{ ...rigidButtonWrapper, color: 'var(--platform-danger)' }}
                        onMouseEnter={(e) => handleBtnEnter(e, 'white', 'var(--platform-danger)')}
                        onMouseLeave={(e) => handleBtnLeave(e, 'var(--platform-danger)')}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            {nestedBlocks}
        </>
    );
};

export default BlockLayerItem;
// frontend/src/components/blocks/LayoutBlock.jsx
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../editor/EditableBlockWrapper';
import AddBlockMenu from '../editor/AddBlockMenu';
import { BLOCK_LIBRARY } from '../editor/BlockEditor';
import BlockRenderer from './BlockRenderer';

// Функція для визначення стилів макета
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

// Область для перетягування блоків
const ColumnDropZone = ({ children, onDrop, path, isEditorPreview }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'BLOCK',
        drop: (item) => onDrop(item, path),
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
        border: '2px dashed var(--site-border-color)',
        transition: 'background-color 0.2s ease',
        backgroundColor: isOver && canDrop ? 'rgba(0,0,0,0.1)' : 'transparent',
    };

    if (!isEditorPreview) {
        return <div style={{ flex: 1 }}>{children}</div>;
    }

    return (
        <div ref={drop} style={columnStyle}>
            {children}
            {React.Children.count(children) === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--site-text-secondary)', paddingTop: '50px' }}>
                    Перетягніть блок сюди
                </div>
            )}
        </div>
    );
};

// Кнопка для додавання нового блоку
const AddBlockButton = ({ path, onAddBlock }) => {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    return (
        <div style={{ textAlign: 'center', padding: '10px 0', position: 'relative' }}>
            <button
                onClick={() => setIsAddMenuOpen(true)}
                title="Додати блок у цю колонку"
                style={{
                    backgroundColor: 'var(--site-accent)',
                    color: 'var(--site-accent-text)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                }}
            >
                ➕ Додати блок
            </button>
            {isAddMenuOpen && (
                <AddBlockMenu
                    library={BLOCK_LIBRARY}
                    onSelect={(type, presetData) => {
                        onAddBlock(path, type, presetData);
                        setIsAddMenuOpen(false);
                    }}
                    onClose={() => setIsAddMenuOpen(false)}
                />
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
        // Публічний режим
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

    // Режим редагування
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
                        <AddBlockButton 
                            path={[...columnPath, columnBlocks.length]} 
                            onAddBlock={onAddBlock}
                        />
                    </ColumnDropZone>
                );
            })}
        </div>
    );
};

export default LayoutBlock;

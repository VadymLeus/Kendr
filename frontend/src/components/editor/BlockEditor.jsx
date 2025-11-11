// frontend/src/components/editor/BlockEditor.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import BlockSettingsModal from './BlockSettingsModal';
import EditableBlockWrapper from './EditableBlockWrapper';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop,
    findBlockByPath
} from './blockUtils';
import { DND_TYPE_NEW_BLOCK } from './DraggableBlockItem';

export const BLOCK_LIBRARY = [
    { type: 'hero', name: 'Обкладинка (Hero)', icon: '🖼️' },
    { type: 'text', name: 'Текстовий блок', icon: '📝' },
    { type: 'image', name: 'Зображення', icon: '🏞️' },
    { type: 'button', name: 'Кнопка', icon: '🔘' },
    { type: 'layout', name: 'Макет (Колонки)', icon: '📐', presets: [
        { preset: '100', name: '1 колонка (100%)', columns: 1 },
        { preset: '50-50', name: '2 колонки (50/50)', columns: 2 },
        { preset: '33-33-33', name: '3 колонки (33/33/33)', columns: 3 },
        { preset: '30-70', name: '2 колонки (30/70)', columns: 2 },
    ]},
    { type: 'categories', name: 'Сітка категорій', icon: '🗂️' },
    { type: 'catalog_grid', name: 'Сітка товарів', icon: '🛍️' },
    { type: 'features', name: 'Переваги', icon: '✅' },
];

const generateBlockId = () => {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getDefaultBlockData = (type, options = {}) => {
    switch (type) {
        case 'hero':
            return { 
                title: 'Нова обкладинка', 
                subtitle: 'Тут буде ваш заголовок', 
                buttonText: 'Докладніше', 
                buttonLink: '#', 
                imageUrl: 'https://placehold.co/1200x500/EFEFEF/31343C?text=Нова+обкладинка' 
            };
        case 'text':
            return { 
                headerTitle: 'Новий текстовий блок', 
                aboutText: 'Вставте сюди свій текст.' 
            };
        case 'image':
            return { 
                imageUrl: 'https://placehold.co/1000x500/EFEFEF/31343C?text=Ваше+зображення', 
                alt: 'Опис зображення' 
            };
        case 'button':
            return { 
                text: 'Натисніть тут', 
                link: '#' 
            };
        case 'layout':
            const columnCount = options.columns || 2;
            return { 
                preset: options.preset || '50-50', 
                columns: Array(columnCount).fill().map(() => []) 
            };
        case 'categories':
            return { title: 'Категорії товарів' };
        case 'catalog_grid':
            return { title: 'Нова сітка товарів', selectedProductIds: [] };
        case 'features':
            return { 
                title: 'Наші переваги', 
                items: [ 
                    { icon: '🌟', text: 'Особливість 1' }, 
                    { icon: '💡', text: 'Особливість 2' } 
                ] 
            };
        default:
            return {};
    }
};

const BlockEditor = ({ 
    blocks: initialBlocks, 
    siteData, 
    onSave,
    onAddBlockByPath,
    onMoveBlock: externalMoveBlock
}) => {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentBlockPath, setCurrentBlockPath] = useState(null);

    useEffect(() => {
        setBlocks(initialBlocks);
    }, [initialBlocks]);

    const handleMoveBlock = useCallback((dragPath, hoverPath) => {
        const updatedBlocks = moveBlock(blocks, dragPath, hoverPath);
        setBlocks(updatedBlocks);
        if (externalMoveBlock) {
            externalMoveBlock(dragPath, hoverPath);
        }
    }, [blocks, externalMoveBlock]);

    const handleDropBlock = useCallback((dragItem, dropZonePath) => {
        setBlocks(prevBlocks => handleDrop(prevBlocks, dragItem, dropZonePath));
    }, []);

    const handleEditBlock = useCallback((path) => {
        setCurrentBlockPath(path);
        setIsSettingsOpen(true);
    }, []);

    const handleSaveBlockSettings = useCallback((updatedData) => {
        if (!currentBlockPath) return;
        setBlocks(prevBlocks => updateBlockDataByPath(prevBlocks, currentBlockPath, updatedData));
        setCurrentBlockPath(null);
        setIsSettingsOpen(false);
    }, [currentBlockPath]);

    const handleAddBlock = useCallback((path, type, presetData = {}) => {
        const newBlock = {
            block_id: generateBlockId(),
            type,
            data: getDefaultBlockData(type, presetData),
        };
        setBlocks(prevBlocks => addBlockByPath(prevBlocks, newBlock, path));
        if (onAddBlockByPath) {
            onAddBlockByPath(type, path, presetData);
        }
    }, [onAddBlockByPath]);

    const handleDeleteBlock = useCallback((path) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей блок?')) return;
        setBlocks(prevBlocks => removeBlockByPath(prevBlocks, path));
    }, []);

    const handlePublish = () => onSave(blocks);

    const [, dropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            handleAddBlock([blocks.length], item.blockType, item.presetData);
        },
    }), [blocks.length, handleAddBlock]);

    const currentBlockToEdit = currentBlockPath ? findBlockByPath(blocks, currentBlockPath) : null;

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
                            onMoveBlock={handleMoveBlock}
                            onDropBlock={handleDropBlock}
                            onDeleteBlock={handleDeleteBlock}
                            onEditBlock={handleEditBlock}
                            onAddBlock={handleAddBlock}
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

            {isSettingsOpen && currentBlockToEdit && (
                <BlockSettingsModal
                    isOpen={isSettingsOpen}
                    block={currentBlockToEdit}
                    siteData={siteData}
                    onSave={handleSaveBlockSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
        </div>
    );
};

export default BlockEditor;
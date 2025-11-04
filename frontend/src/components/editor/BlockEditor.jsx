// frontend/src/components/editor/BlockEditor.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import BlockRenderer from '../blocks/BlockRenderer';
import BlockSettingsModal from './BlockSettingsModal';
import AddBlockMenu from './AddBlockMenu';

const DRAG_ITEM_TYPE = 'BLOCK';

const BLOCK_LIBRARY = [
    { type: 'hero', name: 'Обкладинка (Hero)', icon: '🖼️' },
    { type: 'text', name: 'Текстовий блок', icon: '📝' },
    { type: 'categories', name: 'Сітка категорій', icon: '🗂️' },
    { type: 'catalog_grid', name: 'Сітка товарів', icon: '🛍️' },
    { type: 'banner', name: 'Банер', icon: '🔖' },
    { type: 'features', name: 'Переваги', icon: '✅' },
];

const EditableBlockWrapper = ({ index, block, siteData, moveBlock, onEdit, onDelete }) => {
    const [{ isDragging }, drag] = useDrag({
        type: DRAG_ITEM_TYPE,
        item: { index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: DRAG_ITEM_TYPE,
        hover(item, monitor) {
            if (!monitor.canDrop() || item.index === index) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex !== hoverIndex) {
                moveBlock(dragIndex, hoverIndex);
                item.index = hoverIndex;
            }
        },
    });

    const wrapperRef = useCallback(node => drag(drop(node)), [drag, drop]);
    const opacity = isDragging ? 0.4 : 1;
    const blockType = BLOCK_LIBRARY.find(b => b.type === block.type);

    return (
        <div
            ref={wrapperRef}
            style={{
                opacity,
                cursor: 'move',
                position: 'relative',
                margin: '20px 0',
                border: '2px dashed var(--site-border-color)',
                borderRadius: '8px'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    backgroundColor: 'var(--site-card-bg)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid var(--site-border-color)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--site-text-primary)' }}>
                    {blockType?.icon} {blockType?.name || block.type}
                </span>
                <button
                    onClick={() => onEdit(block)}
                    style={{
                        background: 'var(--site-accent)',
                        color: 'var(--site-accent-text)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    Налаштування
                </button>
                <button
                    onClick={() => onDelete(block.block_id)}
                    style={{
                        background: 'var(--site-danger, #dc3545)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    Видалити
                </button>
            </div>

            <div
                className="site-theme-context"
                data-site-mode={siteData.site_theme_mode || 'light'}
                data-site-accent={siteData.site_theme_accent || 'orange'}
                style={{
                    background: 'var(--site-bg)',
                    color: 'var(--site-text-primary)'
                }}
            >
                <BlockRenderer blocks={[block]} siteData={siteData} isEditorPreview={true} />
            </div>
        </div>
    );
};

const generateBlockId = () => {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const BlockEditor = ({ blocks: initialBlocks, siteData, onSave }) => {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [currentBlockToEdit, setCurrentBlockToEdit] = useState(null);

    useEffect(() => {
        setBlocks(initialBlocks);
    }, [initialBlocks]);

    const moveBlock = useCallback((dragIndex, hoverIndex) => {
        setBlocks(prevBlocks => {
            const updated = [...prevBlocks];
            const [moved] = updated.splice(dragIndex, 1);
            updated.splice(hoverIndex, 0, moved);
            return updated;
        });
    }, []);

    const handleEditBlock = (block) => {
        setCurrentBlockToEdit(block);
        setIsSettingsOpen(true);
    };

    const handleSaveBlockSettings = (updatedData) => {
        const updated = blocks.map(b =>
            b.block_id === currentBlockToEdit.block_id
                ? { ...b, data: updatedData }
                : b
        );
        setBlocks(updated);
        setCurrentBlockToEdit(null);
        setIsSettingsOpen(false);
    };

    const handleAddBlock = (type, positionIndex) => {
        const template = BLOCK_LIBRARY.find(b => b.type === type);
        if (!template) return;

        const newBlock = {
            block_id: generateBlockId(),
            type,
            data: getDefaultBlockData(type),
        };

        const updated = [...blocks];
        updated.splice(positionIndex, 0, newBlock);
        setBlocks(updated);
        setIsAddMenuOpen(false);
    };

    const handleDeleteBlock = (blockId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей блок?')) return;
        setBlocks(prev => prev.filter(b => b.block_id !== blockId));
    };

    const handlePublish = () => onSave(blocks);

    const AddBlockButton = ({ index }) => (
        <div style={{ textAlign: 'center', padding: '20px 0', position: 'relative' }}>
            <button
                onClick={() => setIsAddMenuOpen(index)}
                style={{
                    backgroundColor: 'var(--site-accent)',
                    color: 'var(--site-accent-text)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                }}
            >
                ➕ Додати блок
            </button>
            {isAddMenuOpen === index && (
                <AddBlockMenu
                    library={BLOCK_LIBRARY}
                    onSelect={(type) => handleAddBlock(type, index)}
                    onClose={() => setIsAddMenuOpen(false)}
                />
            )}
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: 'var(--site-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--site-border-color)'
                }}
            >
                <h2 style={{ margin: 0, color: 'var(--site-text-primary)' }}>
                    Редактор сторінки
                </h2>
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

            <AddBlockButton index={0} />

            <div className="blocks-container">
                {blocks.map((block, index) => (
                    <React.Fragment key={block.block_id}>
                        <EditableBlockWrapper
                            index={index}
                            block={block}
                            siteData={siteData}
                            moveBlock={moveBlock}
                            onEdit={handleEditBlock}
                            onDelete={handleDeleteBlock}
                        />
                        <AddBlockButton index={index + 1} />
                    </React.Fragment>
                ))}
            </div>

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

const getDefaultBlockData = (type) => {
    switch (type) {
        case 'hero':
            return {
                title: 'Нова обкладинка',
                subtitle: 'Тут буде ваш заголовок',
                buttonText: 'Детальніше',
                buttonLink: '#',
                imageUrl: 'https://placehold.co/1200x500/EFEFEF/31343C?text=Нова+обкладинка'
            };
        case 'text':
            return {
                headerTitle: 'Новий текстовий блок',
                aboutText: 'Вставте сюди свій текст.'
            };
        case 'categories':
            return { title: 'Категорії товарів' };
        case 'catalog_grid':
            return { title: 'Нова сітка товарів', selectedProductIds: [] };
        case 'banner':
            return {
                imageUrl: 'https://placehold.co/1000x300/CCCCCC/777777?text=Новий+банер',
                link: '#'
            };
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

export default BlockEditor;

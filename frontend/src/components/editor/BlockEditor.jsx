// frontend/src/components/editor/BlockEditor.jsx
import React, { useState, useCallback, useEffect } from 'react';
import BlockSettingsModal from './BlockSettingsModal';
import AddBlockMenu from './AddBlockMenu';
import EditableBlockWrapper from './EditableBlockWrapper';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop,
    findBlockByPath
} from './blockUtils';

// Бібліотека доступних блоків
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

// Генерація унікального ID
const generateBlockId = () => {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Дані за замовчуванням для різних типів блоків
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

// Основний компонент редактора сторінки
const BlockEditor = ({ blocks: initialBlocks, siteData, onSave }) => {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentBlockPath, setCurrentBlockPath] = useState(null);

    useEffect(() => {
        setBlocks(initialBlocks);
    }, [initialBlocks]);

    const handleMoveBlock = useCallback((dragPath, hoverPath) => {
        setBlocks(prevBlocks => moveBlock(prevBlocks, dragPath, hoverPath));
    }, []);

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
    }, []);

    const handleDeleteBlock = useCallback((path) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей блок?')) return;
        setBlocks(prevBlocks => removeBlockByPath(prevBlocks, path));
    }, []);

    const handlePublish = () => onSave(blocks);

    // Кнопка додавання блоку
    const AddBlockButton = ({ path }) => {
        const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
        return (
            <div style={{ textAlign: 'center', padding: '20px 0', position: 'relative' }}>
                <button
                    onClick={() => setIsAddMenuOpen(true)}
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
                {isAddMenuOpen && (
                    <AddBlockMenu
                        library={BLOCK_LIBRARY}
                        onSelect={(type, presetData) => {
                            handleAddBlock(path, type, presetData);
                            setIsAddMenuOpen(false);
                        }}
                        onClose={() => setIsAddMenuOpen(false)}
                    />
                )}
            </div>
        );
    };

    const currentBlockToEdit = currentBlockPath ? findBlockByPath(blocks, currentBlockPath) : null;

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

            <AddBlockButton path={[0]} />

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
                        <AddBlockButton path={[index + 1]} />
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

export default BlockEditor;

// frontend/src/components/editor/LayersTab.jsx
import React from 'react';
import BlockLayerItem from './BlockLayerItem';

const LayersTab = ({
    blocks,
    siteData,
    onMoveBlock,
    onEditBlock,
    onDeleteBlock
}) => {
    
    if (typeof onMoveBlock !== 'function' || typeof onEditBlock !== 'function') {
        console.warn("LayersTab: Необхідні пропси (onMoveBlock, onEditBlock) не передані.");
        return (
             <div style={{ padding: '1rem', color: 'var(--site-danger)'}}>
                Помилка: Вкладка "Шари" не змогла ініціалізуватися.
            </div>
        )
    }

    return (
        <div>
            <h3 style={{ color: 'var(--site-text-primary)', marginBottom: '1rem' }}>
                🗂️ Шари сторінки
            </h3>
            
            {(!blocks || blocks.length === 0) ? (
                 <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px dashed var(--site-border-color)',
                    borderRadius: '8px',
                    color: 'var(--site-text-secondary)'
                }}>
                    <p>Сторінка порожня.</p>
                    <p>Перетягніть сюди блоки з вкладки "Додати".</p>
                </div>
            ) : (
                <div>
                    {blocks.map((block, index) => (
                        <BlockLayerItem
                            key={block.block_id}
                            block={block}
                            path={[index]}
                            onMoveBlock={onMoveBlock}
                            onEditBlock={onEditBlock}
                            onDeleteBlock={onDeleteBlock}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LayersTab;
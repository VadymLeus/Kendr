// frontend/src/modules/site-editor/core/LayersTab.jsx
import React from 'react';
import BlockLayerItem from '../components/BlockLayerItem';
import { IconLayers, IconAlertCircle } from '../../../common/components/ui/Icons';

const LayersTab = ({
    blocks,
    siteData,
    onMoveBlock,
    onSelectBlock,
    onDeleteBlock
}) => {
    
    if (typeof onMoveBlock !== 'function' || typeof onSelectBlock !== 'function') {
        return (
             <div style={{ padding: '1rem', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff5f5', borderRadius: '8px' }}>
                <IconAlertCircle size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Помилка ініціалізації шарів.</span>
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--platform-border-color)' }}>
                <IconLayers size={18} style={{ color: 'var(--platform-accent)' }} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                    Структура сторінки
                </h3>
            </div>
            
            {(!blocks || blocks.length === 0) ? (
                 <div style={{
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    border: '1px dashed var(--platform-border-color)',
                    borderRadius: '12px',
                    color: 'var(--platform-text-secondary)',
                    background: 'var(--platform-bg)',
                    marginTop: '1rem'
                }}>
                    <div style={{ marginBottom: '12px', opacity: 0.5 }}>
                        <IconLayers size={48} />
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--platform-text-primary)' }}>Порожньо</p>
                    <p style={{ fontSize: '0.85rem' }}>Додайте блоки з меню зліва.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {blocks.map((block, index) => (
                        <BlockLayerItem
                            key={block.block_id}
                            block={block}
                            path={[index]}
                            onMoveBlock={onMoveBlock}
                            onSelectBlock={onSelectBlock}
                            onDeleteBlock={onDeleteBlock}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LayersTab;
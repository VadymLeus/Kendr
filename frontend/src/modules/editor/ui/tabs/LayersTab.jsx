// frontend/src/modules/editor/ui/tabs/LayersTab.jsx
import React from 'react';
import BlockLayerItem from '../BlockLayerItem';
import { Layers, AlertCircle, PlusCircle } from 'lucide-react';

const LayersTab = ({
    blocks,
    siteData,
    onMoveBlock,
    onSelectBlock,
    onDeleteBlock
}) => {
    
    if (typeof onMoveBlock !== 'function' || typeof onSelectBlock !== 'function') {
        return (
             <div style={{ padding: '1rem', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff5f5', borderRadius: '8px', margin: '1rem' }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Помилка ініціалізації шарів.</span>
            </div>
        )
    }

    if (!blocks || blocks.length === 0) {
        return (
            <div style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '20px',
                textAlign: 'center',
                color: 'var(--platform-text-secondary)'
            }}>
                <div style={{ 
                    width: '72px', height: '72px', borderRadius: '50%', background: 'var(--platform-bg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                    border: '1px solid var(--platform-border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <Layers size={32} style={{ color: 'var(--platform-accent)', opacity: 0.9 }} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                    Сторінка порожня
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '240px' }}>
                    Додайте перші блоки з меню "Додати", щоб побачити структуру сторінки.
                </p>
                
                <div style={{ 
                    marginTop: '30px', 
                    padding: '12px 16px', 
                    background: 'var(--platform-bg)', 
                    border: '1px dashed var(--platform-border-color)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--platform-text-secondary)'
                }}>
                   <PlusCircle size={14} /> 
                   <span>Перейдіть у вкладку "Додати"</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--platform-border-color)' }}>
                <Layers size={18} style={{ color: 'var(--platform-accent)' }} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                    Структура сторінки
                </h3>
            </div>
            
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
        </div>
    );
};

export default LayersTab;
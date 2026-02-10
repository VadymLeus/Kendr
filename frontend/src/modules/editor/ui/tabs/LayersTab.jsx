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
             <div className="p-4 m-4 text-red-600 bg-red-50 rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">Помилка ініціалізації шарів.</span>
            </div>
        )
    }

    if (!blocks || blocks.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-5 text-center text-(--platform-text-secondary)">
                <div className="w-18 h-18 rounded-full bg-(--platform-bg) flex items-center justify-center mb-5 border border-(--platform-border-color) shadow-sm">
                    <Layers size={32} className="text-(--platform-accent) opacity-90" />
                </div>
                <h4 className="text-[1.05rem] font-semibold text-(--platform-text-primary) mb-2">
                    Сторінка порожня
                </h4>
                <p className="text-sm leading-relaxed max-w-60">
                    Додайте перші блоки з меню "Додати", щоб побачити структуру сторінки.
                </p>
                
                <div className="mt-7.5 py-3 px-4 bg-(--platform-bg) border border-dashed border-(--platform-border-color) rounded-lg text-xs flex items-center gap-2 text-(--platform-text-secondary)">
                    <PlusCircle size={14} /> 
                    <span>Перейдіть у вкладку "Додати"</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-(--platform-border-color)">
                <Layers size={18} className="text-(--platform-accent)" />
                <h3 className="m-0 text-[0.95rem] font-semibold text-(--platform-text-primary)">
                    Структура сторінки
                </h3>
            </div>
            
            <div className="flex flex-col gap-1">
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
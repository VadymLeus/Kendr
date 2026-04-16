// frontend/src/modules/editor/ui/DraggableBlockItem.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { Plus } from 'lucide-react';

export const DND_TYPE_NEW_BLOCK = 'NEW_BLOCK';
const DraggableBlockItem = ({ blockType, presetData = {}, name, icon, customStyle = {}, onClickAdd }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: DND_TYPE_NEW_BLOCK,
        item: { blockType, presetData },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));
    return (
        <div
            ref={drag}
            style={customStyle}
            className={`
                group p-3 px-4 border border-(--platform-border-color) rounded-lg bg-(--platform-card-bg) 
                cursor-grab mb-2 flex items-center justify-between text-(--platform-text-primary) 
                transition-all duration-200 shadow-sm
                hover:-translate-y-0.5 hover:shadow-md hover:border-(--platform-accent)
                active:cursor-grabbing
                ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <span className="flex items-center text-xl opacity-90 text-(--platform-accent) shrink-0">{icon}</span>
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
            </div>
            {onClickAdd && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickAdd(blockType, presetData);
                    }}
                    title="Додати на сторінку (Click-to-Add)"
                    className="
                        flex items-center justify-center w-7 h-7 min-w-7 rounded-md border-none cursor-pointer
                        bg-(--platform-bg) text-(--platform-text-secondary)
                        opacity-0 group-hover:opacity-100 transition-all duration-200
                        hover:bg-(--platform-accent) hover:text-white shrink-0 ml-2
                    "
                >
                    <Plus size={16} />
                </button>
            )}
        </div>
    );
};

export default DraggableBlockItem;
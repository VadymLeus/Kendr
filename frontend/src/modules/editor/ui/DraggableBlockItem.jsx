// frontend/src/modules/editor/ui/DraggableBlockItem.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
export const DND_TYPE_NEW_BLOCK = 'NEW_BLOCK';

const DraggableBlockItem = ({ blockType, presetData = {}, name, icon, customStyle = {} }) => {
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
                p-3 px-4 border border-(--platform-border-color) rounded-lg bg-(--platform-card-bg) 
                cursor-grab mb-2 flex items-center gap-3 text-(--platform-text-primary) 
                transition-all duration-200 shadow-sm
                hover:-translate-y-0.5 hover:shadow-md hover:border-(--platform-accent)
                active:cursor-grabbing
                ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
        >
            <span className="flex items-center text-xl opacity-90 text-(--platform-accent)">{icon}</span>
            <span className="text-sm font-medium">{name}</span>
        </div>
    );
};

export default DraggableBlockItem;
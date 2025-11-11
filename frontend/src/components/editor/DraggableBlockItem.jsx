// frontend/src/components/editor/DraggableBlockItem.jsx
import React from 'react';
import { useDrag } from 'react-dnd';

export const DND_TYPE_NEW_BLOCK = 'NEW_BLOCK';

const DraggableBlockItem = ({ blockType, presetData = {}, name, icon }) => {
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
            style={{
                padding: '0.75rem 1rem',
                border: '1px solid var(--site-border-color)',
                borderRadius: '8px',
                background: 'var(--site-card-bg)',
                cursor: 'grab',
                marginBottom: '0.5rem',
                opacity: isDragging ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--site-text-primary)'
            }}
        >
            <span style={{ fontSize: '1.25rem' }}>{icon}</span>
            <span>{name}</span>
        </div>
    );
};

export default DraggableBlockItem;
// frontend/src/features/editor/DraggableBlockItem.jsx
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

    const styles = {
        container: {
            padding: '0.75rem 1rem',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '8px',
            background: 'var(--platform-card-bg)',
            cursor: 'grab',
            marginBottom: '0.5rem',
            opacity: isDragging ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--platform-text-primary)',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        },
        icon: {
            fontSize: '1.25rem',
            opacity: 0.8
        },
        name: {
            fontSize: '0.9rem',
            fontWeight: '500'
        }
    };

    return (
        <div
            ref={drag}
            style={styles.container}
            onMouseEnter={(e) => {
                if (!isDragging) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    e.target.style.borderColor = 'var(--platform-accent)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isDragging) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    e.target.style.borderColor = 'var(--platform-border-color)';
                }
            }}
            onMouseDown={(e) => {
                e.target.style.cursor = 'grabbing';
            }}
            onMouseUp={(e) => {
                e.target.style.cursor = 'grab';
            }}
        >
            <span style={styles.icon}>{icon}</span>
            <span style={styles.name}>{name}</span>
        </div>
    );
};

export default DraggableBlockItem;
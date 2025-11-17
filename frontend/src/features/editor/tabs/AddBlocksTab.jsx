// frontend/src/features/editor/tabs/AddBlocksTab.jsx
import React, { useState } from 'react';
import DraggableBlockItem from "../DraggableBlockItem";
import { BLOCK_LIBRARY } from "../editorConfig";

const Section = ({ title, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--platform-text-secondary)',
        fontSize: '0.9rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        padding: '0.25rem 0',
        userSelect: 'none'
    };

    const toggleButtonStyle = {
        background: 'none',
        border: 'none',
        color: 'var(--platform-text-secondary)',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '0.25rem 0.5rem',
        transition: 'transform 0.2s ease',
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
    };

    return (
        <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--platform-border-color)', paddingBottom: '1rem' }}>
            <h4 
                style={headerStyle} 
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
            >
                {title}
                <button 
                    style={toggleButtonStyle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(!isCollapsed);
                    }}
                >
                    ▼
                </button>
            </h4>
            {!isCollapsed && children}
        </div>
    );
};

const layoutBlocks = BLOCK_LIBRARY.filter(b => b.type === 'layout');
const basicBlocks = BLOCK_LIBRARY.filter(b => ['hero', 'text', 'image', 'button', 'form', 'features', 'video'].includes(b.type));
const ecommerceBlocks = BLOCK_LIBRARY.filter(b => ['catalog_grid', 'categories'].includes(b.type));

const AddBlocksTab = () => {
    return (
        <div>
            <Section title="Макети">
                {layoutBlocks.map(block => (
                    block.presets.map(preset => (
                        <DraggableBlockItem
                            key={preset.preset}
                            name={preset.name}
                            icon={block.icon}
                            blockType="layout"
                            presetData={{ preset: preset.preset, columns: preset.columns }}
                        />
                    ))
                ))}
            </Section>

            <Section title="Базові блоки">
                {basicBlocks.map(block => (
                    <DraggableBlockItem
                        key={block.type}
                        name={block.name}
                        icon={block.icon}
                        blockType={block.type}
                    />
                ))}
            </Section>

            <Section title="E-commerce">
                {ecommerceBlocks.map(block => (
                    <DraggableBlockItem
                        key={block.type}
                        name={block.name}
                        icon={block.icon}
                        blockType={block.type}
                    />
                ))}
            </Section>
        </div>
    );
};

export default AddBlocksTab;
// frontend/src/components/editor/tabs/AddBlocksTab.jsx
import React from 'react';
import DraggableBlockItem from "../DraggableBlockItem";
import { BLOCK_LIBRARY } from "../editorConfig";

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
            color: 'var(--platform-text-secondary)',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
        }}>
            {title}
        </h4>
        {children}
    </div>
);

const layoutBlocks = BLOCK_LIBRARY.filter(b => b.type === 'layout');
const basicBlocks = BLOCK_LIBRARY.filter(b => ['hero', 'text', 'image', 'button', 'form', 'features'].includes(b.type));
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

            <Section title="Базові">
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

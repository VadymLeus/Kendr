// frontend/src/components/blocks/BlockRenderer.jsx
import React, { Suspense, lazy } from 'react';

const HeroBlock = lazy(() => import('./HeroBlock'));
const TextBlock = lazy(() => import('./TextBlock'));
const CategoriesGridBlock = lazy(() => import('./CategoriesGridBlock'));
const CatalogGridBlock = lazy(() => import('./CatalogGridBlock'));
const FeaturesBlock = lazy(() => import('./FeaturesBlock'));
const LayoutBlock = lazy(() => import('./LayoutBlock'));
const ImageBlock = lazy(() => import('./ImageBlock'));
const ButtonBlock = lazy(() => import('./ButtonBlock'));

const blockMap = {
    hero: HeroBlock,
    text: TextBlock,
    categories: CategoriesGridBlock,
    catalog_grid: CatalogGridBlock,
    features: FeaturesBlock,
    layout: LayoutBlock,
    image: ImageBlock,
    button: ButtonBlock,
};

const BlockRenderer = ({ blocks, siteData, isEditorPreview = false, ...props }) => {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return <p style={{ textAlign: 'center', padding: '2rem' }}>Ця сторінка порожня.</p>;
    }

    return (
        <div>
            {blocks.map((block, index) => {
                const Component = blockMap[block.type];
                if (!Component) {
                    console.warn(`Невідомий тип блоку: ${block.type}`);
                    return (
                        <div
                            key={block.block_id || index}
                            style={{
                                padding: '20px',
                                background: '#ffebee',
                                border: '1px solid #f44336',
                                borderRadius: '4px',
                                margin: '10px 0'
                            }}
                        >
                            Невідомий блок: {block.type}
                        </div>
                    );
                }

                return (
                    <Suspense
                        key={block.block_id || index}
                        fallback={
                            <div
                                style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    background: '#f5f5f5',
                                    borderRadius: '8px',
                                    margin: '10px 0'
                                }}
                            >
                                Завантаження блоку {block.type}...
                            </div>
                        }
                    >
                        <Component
                            blockData={block.data}
                            siteData={siteData}
                            isEditorPreview={isEditorPreview}
                            {...props}
                            block={block}
                        />
                    </Suspense>
                );
            })}
        </div>
    );
};

export default BlockRenderer;

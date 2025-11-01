// frontend/src/components/blocks/BlockRenderer.jsx
import React, { Suspense, lazy } from 'react';

// Ледаче завантаження компонентів блоків
const HeroBlock = lazy(() => import('./HeroBlock'));
const TextBlock = lazy(() => import('./TextBlock'));
const CategoriesGridBlock = lazy(() => import('./CategoriesGridBlock'));
const CatalogGridBlock = lazy(() => import('./CatalogGridBlock'));
const BannerBlock = lazy(() => import('./BannerBlock'));
const FeaturesBlock = lazy(() => import('./FeaturesBlock'));

// Мапування типів блоків на компоненти
const blockMap = {
    hero: HeroBlock,
    text: TextBlock,
    categories: CategoriesGridBlock,
    catalog_grid: CatalogGridBlock,
    banner: BannerBlock,
    features: FeaturesBlock,
};

const BlockRenderer = ({ blocks, siteData }) => {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return <p style={{ textAlign: 'center', padding: '2rem' }}>Ця сторінка порожня.</p>;
    }

    return (
        <div>
            {blocks.map((block, index) => {
                const Component = blockMap[block.type];
                if (!Component) {
                    console.warn(`Невідомий тип блоку: ${block.type}`);
                    return <div key={block.block_id || index}>Невідомий блок: {block.type}</div>;
                }
                return (
                    <Suspense key={block.block_id || index} fallback={<div>Завантаження блоку...</div>}>
                        <Component blockData={block.data} siteData={siteData} />
                    </Suspense>
                );
            })}
        </div>
    );
};

export default BlockRenderer;
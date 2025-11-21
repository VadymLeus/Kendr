// frontend/src/features/editor/blocks/BlockRenderer.jsx
import React, { Suspense, lazy } from 'react';

const HeroBlock = lazy(() => import('./HeroBlock'));
const TextBlock = lazy(() => import('./TextBlock'));
const CategoriesGridBlock = lazy(() => import('./CategoriesGridBlock'));
const CatalogGridBlock = lazy(() => import('./CatalogGridBlock'));
const FeaturesBlock = lazy(() => import('./FeaturesBlock'));
const LayoutBlock = lazy(() => import('./LayoutBlock'));
const ImageBlock = lazy(() => import('./ImageBlock'));
const ButtonBlock = lazy(() => import('./ButtonBlock'));
const FormBlock = lazy(() => import('./FormBlock'));
const VideoBlock = lazy(() => import('./VideoBlock'));
const MapBlock = lazy(() => import('./MapBlock'));
const AccordionBlock = lazy(() => import('./AccordionBlock'));
const SocialIconsBlock = lazy(() => import('./SocialIconsBlock'));
const HeaderBlock = lazy(() => import('./HeaderBlock'));

const blockMap = {
    hero: HeroBlock,
    text: TextBlock,
    categories: CategoriesGridBlock,
    catalog_grid: CatalogGridBlock,
    features: FeaturesBlock,
    layout: LayoutBlock,
    image: ImageBlock,
    button: ButtonBlock,
    form: FormBlock,
    video: VideoBlock,
    map: MapBlock,
    accordion: AccordionBlock,
    social_icons: SocialIconsBlock,
    header: HeaderBlock,
};

const BlockRenderer = ({ blocks, siteData, isEditorPreview = false, ...props }) => {
    const bg = isEditorPreview ? 'var(--platform-bg)' : 'var(--site-bg)';
    const cardBg = isEditorPreview ? 'var(--platform-card-bg)' : 'var(--site-card-bg)';
    const borderColor = isEditorPreview ? 'var(--platform-border-color)' : 'var(--site-border-color)';
    const textPrimary = isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    const danger = isEditorPreview ? 'var(--platform-danger)' : 'var(--site-danger)';

    if (!Array.isArray(blocks) || blocks.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1.5rem',
                color: textSecondary,
                background: bg,
                borderRadius: '8px',
                margin: '1rem 0'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>🏗️</div>
                <h3 style={{ 
                    color: textPrimary, 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                }}>
                    Ця сторінка порожня
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    Додайте блоки для створення контенту
                </p>
            </div>
        );
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
                                padding: '1.5rem',
                                background: isEditorPreview 
                                    ? 'rgba(229, 62, 62, 0.1)' 
                                    : cardBg,
                                border: isEditorPreview 
                                    ? `1px solid ${danger}` 
                                    : `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                margin: '0.5rem 0',
                                color: isEditorPreview 
                                    ? danger 
                                    : textPrimary,
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ 
                                fontSize: '1.5rem', 
                                marginBottom: '0.5rem' 
                            }}>
                                ⚠️
                            </div>
                            <div style={{ fontWeight: '500' }}>
                                Невідомий тип блоку
                            </div>
                            <div style={{ 
                                fontSize: '0.9rem', 
                                marginTop: '0.25rem',
                                opacity: 0.8
                            }}>
                                {block.type}
                            </div>
                        </div>
                    );
                }

                return (
                    <Suspense
                        key={block.block_id || index}
                        fallback={
                            <div style={{
                                padding: '2rem 1rem',
                                textAlign: 'center',
                                background: bg,
                                borderRadius: '8px',
                                margin: '0.5rem 0',
                                border: isEditorPreview 
                                    ? `1px dashed ${borderColor}` 
                                    : `1px solid ${borderColor}`,
                                color: textSecondary
                            }}>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    marginBottom: '0.5rem',
                                    opacity: 0.7
                                }}>
                                    ⏳
                                </div>
                                <div style={{ fontWeight: '500' }}>
                                    Завантаження блоку
                                </div>
                                <div style={{ 
                                    fontSize: '0.9rem', 
                                    marginTop: '0.25rem',
                                    opacity: 0.8
                                }}>
                                    {block.type}
                                </div>
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
// frontend/src/modules/site-editor/core/BlockRenderer.jsx
import React, { Suspense, lazy } from 'react';
import AnimationWrapper from '../../site-render/components/AnimationWrapper';

const HeroBlock = lazy(() => import('../blocks/Hero/HeroBlock'));
const TextBlock = lazy(() => import('../blocks/Text/TextBlock'));
const ShowCaseBlock = lazy(() => import('../blocks/ShowCase/ShowCaseBlock'));
const CatalogBlock = lazy(() => import('../blocks/Catalog/CatalogBlock'));
const FeaturesBlock = lazy(() => import('../blocks/Features/FeaturesBlock'));
const LayoutBlock = lazy(() => import('../blocks/Layout/LayoutBlock'));
const ImageBlock = lazy(() => import('../blocks/Image/ImageBlock'));
const ButtonBlock = lazy(() => import('../blocks/Button/ButtonBlock'));
const FormBlock = lazy(() => import('../blocks/Form/FormBlock'));
const VideoBlock = lazy(() => import('../blocks/Video/VideoBlock'));
const MapBlock = lazy(() => import('../blocks/Map/MapBlock'));
const AccordionBlock = lazy(() => import('../blocks/Accordion/AccordionBlock'));
const SocialIconsBlock = lazy(() => import('../blocks/SocialIcons/SocialIconsBlock'));
const HeaderBlock = lazy(() => import('../blocks/Header/HeaderBlock'));

const blockMap = {
    hero: HeroBlock,
    text: TextBlock,
    showcase: ShowCaseBlock,
    catalog: CatalogBlock,
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
    const bg = 'var(--site-bg)';
    const cardBg = 'var(--site-card-bg)';
    const borderColor = 'var(--site-border-color)';
    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    const danger = 'var(--site-danger)';

    if (!Array.isArray(blocks) || blocks.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1.5rem',
                color: textSecondary,
                background: bg,
                borderRadius: '8px',
                margin: '1rem 0',
                border: isEditorPreview ? `1px dashed ${borderColor}` : 'none'
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
                
                const elementId = block.data && block.data.anchorId ? block.data.anchorId : undefined;

                if (!Component) {
                    console.warn(`Невідомий тип блоку: ${block.type}`);
                    return (
                        <div
                            key={block.block_id || index}
                            id={elementId}
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

                const styles = block.data?.styles || {};
                const dynamicStyle = {
                    paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : '60px',
                    paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : '60px'
                };

                return (
                    <div 
                        key={block.block_id || index}
                        id={elementId}
                        className="block-render-wrapper"
                        style={{ width: '100%' }}
                    >
                        <AnimationWrapper animationConfig={block.data?.animation}>
                            <Suspense
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
                                    </div>
                                }
                            >
                                <Component
                                    blockData={block.data}
                                    siteData={siteData}
                                    isEditorPreview={isEditorPreview}
                                    style={dynamicStyle} 
                                    {...props}
                                    block={block}
                                />
                            </Suspense>
                        </AnimationWrapper>
                    </div>
                );
            })}
        </div>
    );
};

export default BlockRenderer;
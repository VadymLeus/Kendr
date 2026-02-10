// frontend/src/modules/editor/core/BlockRenderer.jsx
import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimationWrapper from '../../renderer/components/AnimationWrapper';
import { AlertTriangle, Construction, Loader } from 'lucide-react';
import { resolveSiteLink } from '../../../shared/utils/linkUtils';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const bg = 'var(--site-bg)';
    const cardBg = 'var(--site-card-bg)';
    const borderColor = 'var(--site-border-color)';
    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    const danger = 'var(--site-danger, #ef4444)';
    const headerBlock = blocks?.find(b => b.type === 'header');
    const navItems = headerBlock?.data?.nav_items || [];
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return (
            <div 
                className="text-center py-12 px-6 rounded-lg my-4 font-sans"
                style={{ 
                    color: textSecondary,
                    background: bg,
                    border: isEditorPreview ? `1px dashed ${borderColor}` : 'none',
                }}
            >
                <div className="mb-4 opacity-70 flex justify-center">
                    <Construction size={48} />
                </div>
                <h3 className="mb-2 font-medium font-inherit" style={{ color: textPrimary }}>
                    Ця сторінка порожня
                </h3>
                <p className="m-0 text-[0.95rem] font-inherit">
                    Додайте блоки для створення контенту
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {blocks.map((block, index) => {
                const Component = blockMap[block.type];
                const elementId = block.data?.anchorId || undefined;

                if (!Component) {
                    console.warn(`Невідомий тип блоку: ${block.type}`);
                    return (
                        <div
                            key={block.block_id || index}
                            id={elementId}
                            className="p-6 rounded-lg my-2 text-center font-sans"
                            style={{
                                background: isEditorPreview ? 'rgba(229, 62, 62, 0.1)' : cardBg,
                                border: isEditorPreview ? `1px solid ${danger}` : `1px solid ${borderColor}`,
                                color: isEditorPreview ? danger : textPrimary,
                            }}
                        >
                            <div className="text-2xl mb-2 flex justify-center">
                                <AlertTriangle size={32} />
                            </div>
                            <div className="font-medium">Невідомий тип блоку</div>
                            <div className="text-sm mt-1 opacity-80">{block.type}</div>
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
                        className="w-full"
                    >
                        <AnimationWrapper animationConfig={block.data?.animation}>
                            <Suspense
                                fallback={
                                    <div 
                                        className="py-8 px-4 text-center bg-transparent rounded-lg my-2 border-none flex flex-col items-center justify-center min-h-25"
                                        style={{ color: textSecondary }}
                                    >
                                        <div className="mb-2 opacity-50">
                                            <Loader size={24} className="animate-spin" />
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
                                    onMenuToggle={() => !isEditorPreview && setIsMobileMenuOpen(true)}
                                />
                            </Suspense>
                        </AnimationWrapper>
                    </div>
                );
            })}
            
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-10000 flex justify-end">
                    <div 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
                    />
                    <div 
                        className="relative w-[80%] max-w-75 h-full shadow-[-5px_0_25px_rgba(0,0,0,0.15)] p-6 flex flex-col"
                        style={{ backgroundColor: 'var(--site-bg, #ffffff)' }}
                    >
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="self-end bg-none border-none cursor-pointer p-2"
                            style={{ color: 'var(--site-text-primary)' }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <nav className="mt-8 flex flex-col gap-5">
                            {navItems.length > 0 ? (
                                navItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={resolveSiteLink(item.link, siteData?.site_path)}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-[1.2rem] font-semibold no-underline pb-2 border-b"
                                        style={{
                                            color: 'var(--site-text-primary)',
                                            borderBottomColor: 'var(--site-border-color)'
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                ))
                            ) : (
                                <p className="text-center" style={{ color: textSecondary }}>Меню порожнє</p>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockRenderer;
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
    const danger = 'var(--site-danger)';
    const headerBlock = blocks?.find(b => b.type === 'header');
    const navItems = headerBlock?.data?.nav_items || [];
    
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1.5rem',
                color: textSecondary,
                background: bg,
                borderRadius: '8px',
                margin: '1rem 0',
                border: isEditorPreview ? `1px dashed ${borderColor}` : 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
                <div style={{ marginBottom: '1rem', opacity: 0.7, display: 'flex', justifyContent: 'center' }}>
                    <Construction size={48} />
                </div>
                <h3 style={{ 
                    color: textPrimary, 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    fontFamily: 'inherit' 
                }}>
                    Ця сторінка порожня
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'inherit' }}>
                    Додайте блоки для створення контенту
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {blocks.map((block, index) => {
                const Component = blockMap[block.type];
                const elementId = block.data?.anchorId || undefined;

                if (!Component) {
                    console.warn(`Невідомий тип блоку: ${block.type}`);
                    return (
                        <div
                            key={block.block_id || index}
                            id={elementId}
                            style={{
                                padding: '1.5rem',
                                background: isEditorPreview ? 'rgba(229, 62, 62, 0.1)' : cardBg,
                                border: isEditorPreview ? `1px solid ${danger}` : `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                margin: '0.5rem 0',
                                color: isEditorPreview ? danger : textPrimary,
                                textAlign: 'center',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                <AlertTriangle size={32} />
                            </div>
                            <div style={{ fontWeight: '500' }}>Невідомий тип блоку</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', opacity: 0.8 }}>{block.type}</div>
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
                        style={{ width: '100%' }}
                    >
                        <AnimationWrapper animationConfig={block.data?.animation}>
                            <Suspense
                                fallback={
                                    <div style={{
                                        padding: '2rem 1rem',
                                        textAlign: 'center',
                                        background: 'transparent',
                                        borderRadius: '8px',
                                        margin: '0.5rem 0',
                                        border: 'none',
                                        color: textSecondary,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '100px'
                                    }}>
                                        <div style={{ marginBottom: '0.5rem', opacity: 0.5 }}>
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <div 
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(3px)'
                        }}
                    />
                    <div style={{
                        position: 'relative',
                        width: '80%',
                        maxWidth: '300px',
                        height: '100%',
                        backgroundColor: 'var(--site-bg, #ffffff)',
                        boxShadow: '-5px 0 25px rgba(0,0,0,0.15)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                alignSelf: 'flex-end',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                color: 'var(--site-text-primary)'
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <nav style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {navItems.length > 0 ? (
                                navItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={resolveSiteLink(item.link, siteData?.site_path)}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            color: 'var(--site-text-primary)',
                                            paddingBottom: '8px',
                                            borderBottom: '1px solid var(--site-border-color)'
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                ))
                            ) : (
                                <p style={{ color: textSecondary, textAlign: 'center' }}>Меню порожнє</p>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockRenderer;
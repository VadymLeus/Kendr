import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { resolveSiteLink } from '../../../../shared/lib/utils/linkUtils';
import { Image as ImageIcon } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const formatBorderRadius = (radius) => {
    if (!radius) return '0px';
    return String(radius).match(/^[0-9]+$/) ? `${radius}px` : radius;
};

const ImageBlock = ({ blockData, isEditorPreview, siteData, style }) => {
    const { 
        objectFit = 'contain',
        borderRadius = '0px', 
        link, 
        targetBlank,
        width = 'medium',
        mode = 'single',
        items = []
    } = blockData;

    const effectiveItems = (blockData.imageUrl && items.length === 0) 
        ? [{ id: 'legacy', src: blockData.imageUrl }] 
        : items;

    const settings_slider = blockData.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true };
    const settings_grid = blockData.settings_grid || { columns: 3 };

    const commonImgStyle = {
        width: '100%', 
        height: '100%',
        display: 'block',
        objectFit: objectFit,
        borderRadius: formatBorderRadius(borderRadius),
        transition: 'opacity 0.3s ease'
    };

    const renderImage = (item, customStyle = {}) => {
        if (!item || !item.src) return null;
        const fullUrl = item.src.startsWith('http') ? item.src : `${API_URL}${item.src}`;
        return (
            <img 
                src={fullUrl} 
                alt={item.alt || ''} 
                style={{ ...commonImgStyle, ...customStyle }} 
                loading="lazy"
            />
        );
    };

    const Placeholder = () => (
        <div style={{
            padding: '3rem', 
            textAlign: 'center', 
            background: 'var(--site-card-bg, #f9f9f9)', 
            border: `1px dashed var(--site-border-color, #ccc)`,
            borderRadius: formatBorderRadius(borderRadius),
            color: 'var(--site-text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '200px' 
        }}>
            <div style={{ opacity: 0.4, color: 'var(--site-text-primary)' }}>
                <ImageIcon size={64} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Зображення не вибрано
            </div>
        </div>
    );

    const renderSingle = () => {
        const item = effectiveItems[0];
        
        if (!item?.src) return isEditorPreview ? <Placeholder /> : null;

        const content = renderImage(item, { height: 'auto' });

        if (link && !isEditorPreview) {
            const finalLink = resolveSiteLink(link, siteData?.site_path);
            return (
                <a 
                    href={finalLink} 
                    target={targetBlank ? '_blank' : '_self'} 
                    rel={targetBlank ? 'noopener noreferrer' : ''}
                    style={{ display: 'block', lineHeight: 0 }}
                >
                    {content}
                </a>
            );
        }
        return <div style={{ lineHeight: 0 }}>{content}</div>;
    };

    const renderSlider = () => {
        if (effectiveItems.length === 0) return renderSingle();

        return (
            <div className={`swiper-container-wrapper my-block-swiper-${blockData.block_id}`}>
                <style>{`
                    .my-block-swiper-${blockData.block_id} .swiper-button-next,
                    .my-block-swiper-${blockData.block_id} .swiper-button-prev { color: var(--site-accent); }
                    .my-block-swiper-${blockData.block_id} .swiper-pagination-bullet-active { background: var(--site-accent); }
                `}</style>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={settings_slider.navigation}
                    pagination={settings_slider.pagination ? { clickable: true } : false}
                    loop={settings_slider.loop && effectiveItems.length > 1}
                    autoplay={settings_slider.autoplay ? { delay: 3000 } : false}
                    style={{ borderRadius: formatBorderRadius(borderRadius), overflow: 'hidden' }}
                >
                    {effectiveItems.map((item, idx) => (
                        <SwiperSlide key={item.id || idx}>
                            <div style={{ aspectRatio: '16 / 9', background: 'var(--site-card-bg, #eee)' }}>
                                {renderImage(item)}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    };

    const renderGrid = () => {
        if (effectiveItems.length === 0) return renderSingle();
        const cols = settings_grid.columns || 3;

        return (
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${cols}, 1fr)`, 
                gap: '16px' 
            }}>
                {effectiveItems.map((item, idx) => (
                    <div key={item.id || idx} style={{ 
                        aspectRatio: '1 / 1', 
                        overflow: 'hidden', 
                        borderRadius: formatBorderRadius(borderRadius),
                        background: 'var(--site-card-bg, #eee)'
                    }}>
                        {renderImage(item, { objectFit: 'cover' })}
                    </div>
                ))}
            </div>
        );
    };

    const widthMap = { 'small': '400px', 'medium': '700px', 'large': '1000px', 'full': '100%' };

    return (
        <div style={{ 
            width: '100%', 
            maxWidth: widthMap[width] || '700px', 
            margin: '0 auto', 
            padding: '20px 0',
            ...style 
        }}>
            {mode === 'slider' ? renderSlider() : mode === 'grid' ? renderGrid() : renderSingle()}
        </div>
    );
};

export default ImageBlock;
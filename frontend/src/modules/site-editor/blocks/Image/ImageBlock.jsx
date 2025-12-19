// frontend/src/modules/site-editor/blocks/Image/ImageBlock.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { resolveSiteLink } from '../../../../common/utils/linkUtils';

const API_URL = 'http://localhost:5000';

const formatBorderRadius = (radius) => {
    if (!radius) return '0px';
    if (String(radius).match(/^[0-9]+$/)) { 
        return `${radius}px`;
    }
    return radius; 
};

const ImageBlock = ({ blockData, isEditorPreview, siteData, style }) => {
    
    const siteBg = 'var(--site-bg)';
    const siteBorderColor = 'var(--site-border-color)';
    const siteAccent = 'var(--site-accent)';
    const siteTextSecondary = 'var(--site-text-secondary)';
    const isOldStructure = !blockData.mode && blockData.imageUrl;
    
    const mode = isOldStructure ? 'single' : blockData.mode || 'single';
    const items = (isOldStructure || !Array.isArray(blockData.items) || blockData.items.length === 0)
        ? (blockData.imageUrl ? [{ id: 'compat1', src: blockData.imageUrl, alt: blockData.alt }] : [])
        : blockData.items;

    const { 
        objectFit = 'contain',
        borderRadius = '0px', 
        link, 
        targetBlank,
        width = 'medium'
    } = blockData;
    
    const settings_slider = blockData.settings_slider || { navigation: true, pagination: true, autoplay: false, loop: true };
    const settings_grid = blockData.settings_grid || { columns: 3 };

    const imgStyle = {
        maxWidth: '100%',
        width: '100%', 
        height: '100%',
        display: 'block',
        objectFit: objectFit,
        borderRadius: formatBorderRadius(borderRadius)
    };

    const renderImage = (item) => {
        if (!item || !item.src) return null;
        const fullUrl = item.src.startsWith('http') ? item.src : `${API_URL}${item.src}`;
        return <img src={fullUrl} alt={item.alt || ''} style={imgStyle} />;
    };

    const renderSingle = () => {
        const item = items[0];
        
        if (!item || !item.src) {
             return isEditorPreview ? (
                 <div style={{
                     padding: '3rem', 
                     textAlign: 'center', 
                     background: siteBg, 
                     border: `1px dashed ${siteBorderColor}`,
                     borderRadius: formatBorderRadius(borderRadius),
                     color: siteTextSecondary,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '10px'
                 }}>
                     <div style={{fontSize: '2rem'}}>🖼️</div>
                     <div>Додайте зображення в налаштуваннях</div>
                 </div>
             ) : null;
        }
        
        const containerStyles = {
            width: '100%',
            height: 'auto',
            overflow: 'hidden',
            borderRadius: formatBorderRadius(borderRadius),
            display: 'block',
            lineHeight: 0
        };

        const singleImgStyle = {
            ...imgStyle,
            height: 'auto',
            aspectRatio: 'none'
        };
        
        const fullUrl = item.src.startsWith('http') ? item.src : `${API_URL}${item.src}`;
        const imageToRender = <img src={fullUrl} alt={item.alt || ''} style={singleImgStyle} />;

        if (mode === 'single' && link) {
            const finalLink = resolveSiteLink(link, siteData?.site_path);
            
            return (
                <a 
                    href={finalLink} 
                    target={targetBlank ? '_blank' : '_self'} 
                    rel={targetBlank ? 'noopener noreferrer' : ''}
                    onClick={isEditorPreview ? (e) => e.preventDefault() : undefined}
                    style={containerStyles}
                >
                    {imageToRender}
                </a>
            );
        }
        return <div style={containerStyles}>{imageToRender}</div>;
    };

    const renderSlider = () => {
        if (items.length === 0) return renderSingle();

        const settings = settings_slider;
        const paginationProp = settings.pagination ? { clickable: true } : false;
        const autoplayProp = settings.autoplay ? { delay: 3000, disableOnInteraction: false } : false;
        const accentColor = siteAccent; 

        const swiperNavStyles = `
            .my-block-swiper-${blockData.block_id} .swiper-button-next,
            .my-block-swiper-${blockData.block_id} .swiper-button-prev {
                color: ${accentColor};
            }
            .my-block-swiper-${blockData.block_id} .swiper-pagination-bullet-active {
                background: ${accentColor};
            }
        `;
        
        const swiperWrapperStyle = isEditorPreview ? {
            border: `1px dashed ${siteBorderColor}`,
            padding: '4px',
            background: siteBg,
            borderRadius: formatBorderRadius(borderRadius)
        } : {};

        return (
            <div style={swiperWrapperStyle}>
                <style>{swiperNavStyles}</style>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={settings.navigation}
                    pagination={paginationProp}
                    loop={settings.loop && items.length > 1}
                    autoplay={autoplayProp}
                    className={`my-block-swiper-${blockData.block_id}`}
                    allowTouchMove={true} 
                    style={{'--swiper-navigation-size': '20px', borderRadius: formatBorderRadius(borderRadius), overflow: 'hidden'}}
                >
                    {items.map((item, idx) => (
                        <SwiperSlide key={item.id || idx}>
                            <div style={{ aspectRatio: '16 / 9', width: '100%', overflow: 'hidden', borderRadius: formatBorderRadius(borderRadius) }}>
                                {renderImage(item)}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    };

    const renderGrid = () => {
        if (items.length === 0) return renderSingle();

        const gridWrapperStyle = isEditorPreview ? {
            border: `1px dashed ${siteBorderColor}`,
            padding: '8px',
            background: siteBg,
            borderRadius: formatBorderRadius(borderRadius)
        } : {};
        
        const columns = settings_grid.columns || 3;
        const gap = '15px';
        
        const itemRelativeWidth = `calc((100% - ${columns - 1} * ${gap}) / ${columns})`;
        
        return (
             <div style={gridWrapperStyle}>
                 <div style={{ 
                     display: 'flex', 
                     flexWrap: 'wrap', 
                     gap: gap, 
                     justifyContent: 'flex-start',
                     width: '100%'
                 }}>
                     {items.map((item, idx) => (
                         <div key={item.id || idx} style={{
                             width: itemRelativeWidth, 
                             aspectRatio: '1 / 1', 
                             overflow: 'hidden', 
                             borderRadius: formatBorderRadius(borderRadius),
                             position: 'relative'
                         }}>
                             {renderImage(item)}
                         </div>
                     ))}
                 </div>
             </div>
        );
    };

    let content;
    switch (mode) {
        case 'slider': 
            content = renderSlider(); 
            break;
        case 'grid': 
            content = renderGrid(); 
            break;
        case 'single':
        default: 
            content = renderSingle(); 
            break;
    }

    const widthMap = {
        'small': '400px',
        'medium': '700px',
        'large': '1000px',
        'full': '100%'
    };

    const blockContainerStyle = {
        width: '100%',
        maxWidth: widthMap[width] || '700px',
        margin: '0 auto',
        padding: 0,
        ...style
    };

    return (
        <div style={{ padding: '20px 0' }}> 
            <div style={blockContainerStyle}>
                {content}
            </div>
        </div>
    );
};

export default ImageBlock;
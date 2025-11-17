// frontend/src/features/editor/blocks/ImageBlock.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const API_URL = 'http://localhost:5000';

const formatBorderRadius = (radius) => {
    if (!radius) return '0px';
    if (String(radius).match(/^[0-9]+$/)) { 
        return `${radius}px`;
    }
    return radius; 
};

const ImageBlock = ({ blockData, isEditorPreview, siteData }) => {
    
    const isOldStructure = !blockData.mode && blockData.imageUrl;
    
    const mode = isOldStructure ? 'single' : blockData.mode || 'single';
    const items = (isOldStructure || !Array.isArray(blockData.items) || blockData.items.length === 0)
        ? [{ id: 'compat1', src: blockData.imageUrl, alt: blockData.alt }]
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
                    background: 'var(--platform-bg)', 
                    border: '1px dashed var(--platform-border-color)',
                    borderRadius: formatBorderRadius(borderRadius),
                    aspectRatio: '16/9'
                }}>
                    Оберіть зображення в налаштуваннях
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
        
        const imageToRender = <img src={item.src.startsWith('http') ? item.src : `${API_URL}${item.src}`} alt={item.alt || ''} style={singleImgStyle} />;

        if (mode === 'single' && link) {
            return (
                <a 
                    href={link} 
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
        const settings = settings_slider;
        const paginationProp = settings.pagination ? { clickable: true } : false;
        const autoplayProp = settings.autoplay ? { delay: 3000, disableOnInteraction: false } : false;
        
        const accentColor = isEditorPreview 
            ? 'var(--platform-accent)' 
            : (siteData?.site_theme_accent ? 'var(--site-accent)' : 'var(--platform-accent)');

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
            border: '2px dashed var(--platform-border-color)',
            padding: '1rem',
            background: 'var(--platform-bg)',
        } : {};

        return (
            <div style={swiperWrapperStyle}>
                <style>{swiperNavStyles}</style>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={settings.navigation}
                    pagination={paginationProp}
                    loop={settings.loop}
                    autoplay={autoplayProp}
                    className={`my-block-swiper-${blockData.block_id}`}
                    allowTouchMove={!isEditorPreview} 
                    style={{'--swiper-navigation-size': '20px', borderRadius: formatBorderRadius(borderRadius), overflow: 'hidden'}}
                >
                    {items.map(item => (
                        <SwiperSlide key={item.id}>
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
         const gridWrapperStyle = isEditorPreview ? {
            border: '2px dashed var(--platform-border-color)',
            padding: '1rem',
            background: 'var(--platform-bg)',
        } : {};
        
        const columns = settings_grid.columns || 3;
        const gap = '15px';
        
        const itemRelativeWidth = `calc((100% - ${columns - 1} * ${gap}) / ${columns})`;
        
        return (
             <div style={{
                 ...gridWrapperStyle,
                 padding: isEditorPreview ? '1rem 0 0 0' : '0' 
             }}>
                {isEditorPreview && (
                    <p style={{textAlign: 'center', color: 'var(--platform-text-secondary)', fontWeight: 'bold', margin: '0 0 1rem 0'}}>
                        [Сітка: {columns} колонки]
                    </p>
                )}
                
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: gap, 
                    justifyContent: 'center',
                    width: '100%',
                    margin: '0 auto' 
                }}>
                    {items.map(item => (
                        <div key={item.id} style={{
                            width: itemRelativeWidth, 
                            aspectRatio: '1 / 1', 
                            overflow: 'hidden', 
                            borderRadius: formatBorderRadius(borderRadius)
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
        padding: 0
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
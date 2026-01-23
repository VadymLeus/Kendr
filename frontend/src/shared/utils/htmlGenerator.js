// frontend/src/shared/lib/utils/htmlGenerator.js
const transformLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#')) return link;
    if (link === '/' || link === '') return 'index.html';
    let cleanLink = link.replace(/^\//, '').replace(/^page\//, '').split('?')[0];
    if (!cleanLink.endsWith('.html')) cleanLink += '.html';
    return cleanLink;
};

const renderIcon = (iconName, className = '', style = '') => {
    if (!iconName || iconName === 'none') return '';
    const name = iconName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `<i data-lucide="${name}" class="${className}" style="${style}"></i>`;
};

const parseSrcFromIframe = (embedCode) => {
    if (!embedCode || typeof embedCode !== 'string') return null;
    const match = embedCode.match(/src="([^"]+)"/);
    return (match && match[1]) ? match[1] : null;
};

const getGridTemplate = (preset, direction) => {
    if (direction === 'column') return '1fr';
    switch(preset) {
        case '50-50': return '1fr 1fr';
        case '33-33-33': return '1fr 1fr 1fr';
        case '25-75': return '1fr 3fr';
        case '75-25': return '3fr 1fr';
        case '25-25-25-25': return '1fr 1fr 1fr 1fr';
        default: return '1fr 1fr'; 
    }
};

const renderButtonHTML = (config, extraStyle = '') => {
    const { 
        text = 'Button', link, styleType = 'primary', variant = 'solid', 
        size = 'medium', borderRadius, width = 'auto', 
        icon, iconPosition = 'right', targetBlank 
    } = config;

    const isOutline = variant === 'outline';
    const isSecondary = styleType === 'secondary';
    
    const bgVar = isOutline ? 'transparent' : (isSecondary ? 'var(--site-text-primary)' : 'var(--site-accent)');
    const textVar = isOutline 
        ? (isSecondary ? 'var(--site-text-primary)' : 'var(--site-accent)') 
        : '#ffffff';
    const borderVar = isOutline 
        ? (isSecondary ? 'var(--site-text-primary)' : 'var(--site-accent)') 
        : 'transparent';

    const paddingMap = {
        small: '8px 16px', medium: '12px 24px', large: '16px 32px'
    };
    const fontSizeMap = {
        small: '0.85rem', medium: '1rem', large: '1.2rem'
    };

    const style = `
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        background: ${bgVar}; color: ${textVar}; border: 2px solid ${borderVar};
        padding: ${paddingMap[size] || paddingMap.medium};
        font-size: ${fontSizeMap[size] || fontSizeMap.medium};
        border-radius: ${borderRadius ? borderRadius + 'px' : '4px'};
        width: ${width === 'full' ? '100%' : 'auto'};
        text-decoration: none; font-weight: 600; cursor: pointer;
        transition: opacity 0.2s; ${extraStyle}
    `;

    const iconHTML = renderIcon(icon, '', 'width: 1.2em; height: 1.2em;');
    const content = `
        ${iconPosition === 'left' ? iconHTML : ''}
        <span>${text}</span>
        ${iconPosition === 'right' ? iconHTML : ''}
    `;

    if (link) {
        return `<a href="${transformLink(link)}" target="${targetBlank ? '_blank' : '_self'}" style="${style}">${content}</a>`;
    } else {
        return `<button type="button" style="${style}">${content}</button>`;
    }
};

const generateBlockHTML = (block) => {
    if (!block || !block.data) return '';
    const { type, data } = block;

    const getPaddingStyle = () => {
        const pt = data.styles?.paddingTop !== undefined ? data.styles.paddingTop : (data.padding ? parseInt(data.padding) : 40);
        const pb = data.styles?.paddingBottom !== undefined ? data.styles.paddingBottom : (data.padding ? parseInt(data.padding) : 40);
        return `padding-top: ${pt}px; padding-bottom: ${pb}px;`;
    };

    switch (type) {
        case 'header':
            const logoImage = data.logo_src || data.logo_url;
            return `
        <header style="background-color: var(--site-header-bg); border-bottom: 1px solid var(--site-border-color); padding: 1rem 0;">
            <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
                <a href="index.html" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--site-text-primary);">
                    ${logoImage 
                        ? `<img src="${logoImage}" alt="Logo" style="height: ${data.logo_size === 'large' ? 80 : (data.logo_size === 'small' ? 30 : 50)}px; width: auto; border-radius: ${data.logo_radius || 0}px;">` 
                        : ''}
                    ${data.show_title ? `<span style="font-weight: 700; font-size: 1.2rem;">${data.site_title || 'Site'}</span>` : ''}
                </a>
                
                <nav style="display: flex; gap: 24px; align-items: center;">
                    ${(data.nav_items || []).map(item => {
                        if (data.nav_style === 'button') {
                            return renderButtonHTML({
                                text: item.label, link: item.link, 
                                ...data.buttonSettings
                            });
                        }
                        return `<a href="${transformLink(item.link)}" style="color: var(--site-text-primary); font-weight: 500;">${item.label}</a>`;
                    }).join('')}
                </nav>
                
                <div class="mobile-menu-icon" style="display: none;">${renderIcon('menu')}</div>
            </div>
        </header>`;

        case 'hero':
            const heroHeight = { small: '300px', medium: '500px', large: '700px', full: 'calc(100vh - 60px)' }[data.height] || '500px';
            const heroAlign = { left: 'flex-start', center: 'center', right: 'flex-end' }[data.alignment] || 'center';
            const heroBg = data.bg_image ? `url('${data.bg_image}')` : 'var(--site-bg)';
            
            return `
        <section style="position: relative; min-height: ${heroHeight}; display: flex; align-items: center; justify-content: ${heroAlign}; overflow: hidden; color: ${data.theme_mode === 'dark' ? '#fff' : 'var(--site-text-primary)'}; text-align: ${data.alignment || 'center'}; ${getPaddingStyle()}">
            <div style="position: absolute; inset: 0; background: ${heroBg} center/cover no-repeat; z-index: 0;">
                ${data.bg_type === 'video' && data.bg_video ? `<video src="${data.bg_video}" autoplay muted loop playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>` : ''}
            </div>
            <div style="position: absolute; inset: 0; background-color: ${data.overlay_color || '#000'}; opacity: ${data.overlay_opacity || 0.5}; z-index: 1;"></div>
            
            <div class="container" style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: ${heroAlign};">
                ${data.title ? `<h1 style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.1;">${data.title}</h1>` : ''}
                ${data.subtitle ? `<p style="font-size: clamp(1rem, 2vw, 1.25rem); margin-bottom: 2rem; opacity: 0.9; max-width: 600px;">${data.subtitle}</p>` : ''}
                ${data.button_text ? renderButtonHTML({
                    text: data.button_text, link: data.button_link, ...data.button
                }) : ''}
            </div>
        </section>`;

        case 'layout':
            const gridCols = getGridTemplate(data.preset, data.direction);
            const layoutHeight = { small: '300px', medium: '500px', large: '700px', full: '100vh', auto: 'auto' }[data.height] || 'auto';
            const bgStyle = data.bg_image 
                ? `background: url('${data.bg_image}') center/cover no-repeat;` 
                : (data.bg_type === 'color' ? `background-color: ${data.bg_color};` : '');

            const columnsHTML = (data.columns || []).map(colBlocks => `
                <div style="display: flex; flex-direction: column; width: 100%;">
                    ${colBlocks.map(innerBlock => generateBlockHTML(innerBlock)).join('\n')}
                </div>
            `).join('');

            return `
        <section style="position: relative; min-height: ${layoutHeight}; ${bgStyle} ${getPaddingStyle()}">
            ${(data.bg_type === 'image' || data.bg_type === 'video') ? `<div style="position: absolute; inset: 0; background-color: ${data.overlay_color}; opacity: ${data.overlay_opacity || 0}; pointer-events: none;"></div>` : ''}
            <div class="container" style="position: relative; z-index: 1;">
                <div style="display: grid; grid-template-columns: ${gridCols}; gap: ${data.gap || 20}px; align-items: ${data.verticalAlign === 'middle' ? 'center' : 'start'};">
                    ${columnsHTML}
                </div>
            </div>
        </section>`;

        case 'text':
            const Tag = ['h1', 'h2', 'h3'].includes(data.tag) ? data.tag : 'p';
            const fontSize = { h1: '2.5rem', h2: '2rem', h3: '1.5rem', p: '1rem' }[Tag];
            const fontWeight = { h1: '800', h2: '700', h3: '600', p: '400' }[Tag];
            
            return `
        <div style="text-align: ${data.alignment || 'left'}; color: var(--site-text-primary); ${getPaddingStyle()}">
            <div class="container">
                ${(data.content || '').split('\n').map(line => `
                    <${Tag} style="font-size: ${fontSize}; font-weight: ${data.isBold ? 'bold' : fontWeight}; font-style: ${data.isItalic ? 'italic' : 'normal'}; text-decoration: ${data.isUnderline ? 'underline' : 'none'}; margin-bottom: 0.5em;">
                        ${line || '&nbsp;'}
                    </${Tag}>
                `).join('')}
            </div>
        </div>`;

        case 'image':
            let items = data.items || (data.url ? [{src: data.url}] : []);
            if (!items.length) return '';
            
            const imgRadius = data.borderRadius ? (String(data.borderRadius).match(/^[0-9]+$/) ? `${data.borderRadius}px` : data.borderRadius) : '0px';
            const imgRender = (src) => `<img src="${src}" alt="" style="width: 100%; height: 100%; object-fit: ${data.objectFit || 'cover'}; border-radius: ${imgRadius}; display: block;">`;

            let imgContent = '';
            if (data.mode === 'grid') {
                 imgContent = `<div style="display: grid; grid-template-columns: repeat(${data.settings_grid?.columns || 3}, 1fr); gap: 16px;">
                    ${items.map(i => `<div style="aspect-ratio: 1/1;">${imgRender(i.src)}</div>`).join('')}
                 </div>`;
            } else {
                 imgContent = imgRender(items[0].src);
            }
            return `<div style="${getPaddingStyle()}"><div class="container" style="max-width: ${data.width === 'full' ? '100%' : '800px'};">${imgContent}</div></div>`;

        case 'button':
            return `
        <div style="display: flex; justify-content: ${data.alignment === 'left' ? 'flex-start' : (data.alignment === 'right' ? 'flex-end' : 'center')}; ${getPaddingStyle()}">
            <div class="container">
                ${renderButtonHTML(data)}
            </div>
        </div>`;

        case 'features':
            const isCard = data.layout === 'cards';
            return `
        <section style="background-color: var(--site-bg); ${getPaddingStyle()}">
            <div class="container">
                ${data.title ? `<h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: var(--site-text-primary);">${data.title}</h2>` : ''}
                <div style="display: grid; grid-template-columns: repeat(${data.columns || 3}, 1fr); gap: 24px;">
                    ${(data.items || []).map(item => `
                        <div style="padding: ${isCard ? '24px' : '0'}; background: ${isCard ? 'var(--site-card-bg)' : 'transparent'}; border: ${isCard ? '1px solid var(--site-border-color)' : 'none'}; border-radius: ${data.borderRadius || '8px'}; display: flex; flex-direction: ${data.layout === 'list' ? 'row' : 'column'}; align-items: ${data.align === 'center' ? 'center' : 'flex-start'}; gap: 16px; text-align: ${data.layout === 'list' ? 'left' : data.align};">
                            <div style="color: var(--site-accent); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: ${data.showIconBackground ? 'var(--site-accent)' : 'transparent'}; color: ${data.showIconBackground ? '#fff' : 'var(--site-accent)'}; border-radius: 50%;">
                                ${renderIcon(item.icon)}
                            </div>
                            <div>
                                <h4 style="margin: 0 0 8px; font-size: 1.25rem; color: var(--site-text-primary);">${item.title}</h4>
                                <p style="margin: 0; color: var(--site-text-secondary); line-height: 1.6;">${item.text}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>`;

        case 'accordion':
            return `
        <section style="${getPaddingStyle()}">
            <div class="container" style="max-width: 800px;">
                ${(data.items || []).map(item => `
                    <details style="margin-bottom: 12px; background: var(--site-card-bg); border: 1px solid var(--site-border-color); border-radius: 8px; overflow: hidden;">
                        <summary style="padding: 16px; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; color: var(--site-text-primary);">
                            ${item.title}
                            <span style="color: var(--site-accent);">▼</span>
                        </summary>
                        <div style="padding: 16px; border-top: 1px solid var(--site-border-color); color: var(--site-text-secondary); line-height: 1.6;">
                            ${item.content}
                        </div>
                    </details>
                `).join('')}
            </div>
        </section>`;

        case 'social_icons':
            const socialLinks = [
                { k: 'facebook', v: data.facebook }, { k: 'instagram', v: data.instagram },
                { k: 'telegram', v: data.telegram }, { k: 'youtube', v: data.youtube }
            ].filter(s => s.v);
            
            return `
        <div style="text-align: ${data.alignment || 'left'}; ${getPaddingStyle()}">
            <div class="container" style="display: flex; gap: 12px; justify-content: ${data.alignment === 'center' ? 'center' : (data.alignment === 'right' ? 'flex-end' : 'flex-start')};">
                ${socialLinks.map(s => `
                    <a href="${s.v}" target="_blank" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--site-text-primary); border: 1px solid var(--site-border-color); border-radius: 50%; transition: all 0.2s;">
                        ${renderIcon(s.k)}
                    </a>
                `).join('')}
            </div>
        </div>`;

        case 'map':
            const mapSrc = parseSrcFromIframe(data.embed_code);
            if (!mapSrc) return '';
            const mapHeight = { small: '300px', medium: '450px', large: '600px' }[data.sizePreset] || '450px';
            return `
        <div style="${getPaddingStyle()}">
            <div class="container">
                <iframe src="${mapSrc}" width="100%" height="${mapHeight}" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div>`;

        case 'form':
            return `
        <section style="${getPaddingStyle()}">
            <div class="container" style="max-width: 600px;">
                <form style="background: var(--site-card-bg); padding: 30px; border-radius: 12px; border: 1px solid var(--site-border-color);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <input type="text" placeholder="Ваше ім'я" style="padding: 12px; border: 1px solid var(--site-border-color); border-radius: 8px; width: 100%;">
                        <input type="email" placeholder="Email" style="padding: 12px; border: 1px solid var(--site-border-color); border-radius: 8px; width: 100%;">
                    </div>
                    <textarea placeholder="Повідомлення" style="width: 100%; padding: 12px; border: 1px solid var(--site-border-color); border-radius: 8px; min-height: 120px; margin-bottom: 20px;"></textarea>
                    <div style="text-align: ${data.button?.alignment || 'center'}">
                         ${renderButtonHTML({ text: data.buttonText || 'Надіслати', ...data.button })}
                    </div>
                </form>
            </div>
        </section>`;

        case 'catalog':
        case 'showcase':
            const cols = data.columns || 3;
            const mockItems = Array.from({length: data.items_per_page || 4}).fill(0);
            return `
        <section style="${getPaddingStyle()}">
            <div class="container">
                ${data.title ? `<h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem; color: var(--site-text-primary);">${data.title}</h2>` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 24px;">
                     ${mockItems.map(() => `
                        <div style="background: var(--site-card-bg); border: 1px solid var(--site-border-color); border-radius: 12px; overflow: hidden;">
                            <div style="height: 250px; background: #eee; display: flex; align-items: center; justify-content: center; color: #999;">
                                ${renderIcon('shopping-bag', '', 'width: 48px; height: 48px; opacity: 0.5;')}
                            </div>
                            <div style="padding: 16px;">
                                <div style="height: 20px; background: #eee; width: 70%; margin-bottom: 10px; border-radius: 4px;"></div>
                                <div style="height: 16px; background: #eee; width: 40%; border-radius: 4px;"></div>
                            </div>
                        </div>
                     `).join('')}
                </div>
                ${type === 'catalog' ? `<div style="text-align: center; margin-top: 30px; font-style: italic; color: var(--site-text-secondary);">Dynamic catalog requires backend connection.</div>` : ''}
            </div>
        </section>`;
        
        case 'video':
             const vidHeight = { small: '300px', medium: '500px', large: '700px', auto: 'auto' }[data.height] || 'auto';
             return `
        <div style="width: 100%; height: ${vidHeight}; background: #000; ${getPaddingStyle()}">
            <div class="container" style="height: 100%;">
                 ${data.url ? `<video src="${data.url}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>` : ''}
            </div>
        </div>`;

        case 'footer':
            return `
        <footer style="background-color: var(--site-card-bg); border-top: 1px solid var(--site-border-color); padding: 40px 0;">
            <div class="container" style="text-align: center; color: var(--site-text-secondary);">
                ${data.content || `© ${new Date().getFullYear()} All rights reserved.`}
            </div>
        </footer>`;

        default:
            return '';
    }
};

export const generateFullHTML = (siteData, blocks, pageTitle) => {
    let allBlocks = Array.isArray(blocks) ? [...blocks] : [];

    if (siteData.header_content && !allBlocks.find(b => b.type === 'header')) {
        let headerBlock = Array.isArray(siteData.header_content) ? siteData.header_content[0] : siteData.header_content;
        if (headerBlock) {
             headerBlock = {
                 ...headerBlock,
                 data: { ...headerBlock.data, ...siteData } 
             };
             allBlocks.unshift(headerBlock);
        }
    }

    if (siteData.footer_content && !allBlocks.find(b => b.type === 'footer')) {
        const footerBlock = Array.isArray(siteData.footer_content) ? siteData.footer_content[0] : siteData.footer_content;
        if (footerBlock) allBlocks.push(footerBlock);
    }

    const blocksHTML = allBlocks.map(generateBlockHTML).join('\n');

    return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle ? `${pageTitle} - ` : ''}${siteData.title || 'My Website'}</title>
    <meta name="description" content="${siteData.seo_description || ''}">
    ${siteData.favicon_url ? `<link rel="icon" href="${siteData.favicon_url}" type="image/x-icon">` : ''}
    
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="css/style.css">
    
    <style>
        * { box-sizing: border-box; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
    </style>
</head>
<body>
    ${blocksHTML}
    
    <script>
        lucide.createIcons();
    </script>
</body>
</html>`;
};
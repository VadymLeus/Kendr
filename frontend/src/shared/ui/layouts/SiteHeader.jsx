// frontend/src/shared/ui/layouts/SiteHeader.jsx
import React from 'react';
import BlockRenderer from '../../../modules/editor/core/BlockRenderer';
import { BASE_URL } from '../../config';

const resolveUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
    if (src.startsWith('/logos/')) return src;
    if (src.includes('/src/') || src.includes('/assets/') || src.includes('@fs')) return src;
    const cleanSrc = src.startsWith('/') ? src : `/${src}`;
    return `${BASE_URL}${cleanSrc}`;
};
const SiteHeader = ({ siteData, loading }) => {
    if (loading || !siteData) {
        return (
            <div style={{ 
                height: '70px', 
                width: '100%', 
                background: 'var(--platform-card-bg)',
                borderBottom: '1px solid var(--platform-border-color)'
            }} />
        );
    }
    let headerBlocks = [];
    if (siteData.header_content) {
        if (Array.isArray(siteData.header_content)) {
            headerBlocks = siteData.header_content;
        } else if (typeof siteData.header_content === 'string') {
            try { 
                headerBlocks = JSON.parse(siteData.header_content); 
            } catch (e) {
                console.error("SiteHeader: parse error", e);
            }
        }
    }
    if (!headerBlocks || headerBlocks.length === 0) return null;
    const processedSiteData = {
        ...siteData,
        logo_url: resolveUrl(siteData.logo_url)
    };
    const isSticky = headerBlocks[0]?.is_sticky === true;
    return (
        <div 
            style={{ 
                width: '100%', 
                position: isSticky ? 'sticky' : 'relative', 
                top: isSticky ? 0 : 'auto', 
                zIndex: 9999 
            }}
            className="site-theme-context"
            data-site-mode={processedSiteData.site_theme_mode || 'light'}
            data-site-accent={processedSiteData.site_theme_accent || 'orange'}
        >
            <BlockRenderer 
                blocks={headerBlocks} 
                siteData={processedSiteData} 
                isEditorPreview={false} 
            />
        </div>
    );
};

export default SiteHeader;
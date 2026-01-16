// frontend/src/shared/ui/layouts/SiteHeader.jsx
import React from 'react';
import BlockRenderer from '../../../modules/editor/core/BlockRenderer';

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
                console.error("Помилка парсингу header_content", e);
            }
        }
    }

    if (!headerBlocks || headerBlocks.length === 0) {
        return null;
    }

    return (
        <div 
            style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 1000, 
                width: '100%' 
            }}
            className="site-theme-context"
            data-site-mode={siteData.site_theme_mode || 'light'}
            data-site-accent={siteData.site_theme_accent || 'orange'}
        >
            <BlockRenderer 
                blocks={headerBlocks} 
                siteData={siteData} 
                isEditorPreview={false} 
            />
        </div>
    );
};

export default SiteHeader;
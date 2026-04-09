// frontend/src/modules/renderer/pages/SiteDisplayPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../../shared/api/api';
import BlockRenderer from '../../editor/core/BlockRenderer';
import { AuthContext } from '../../../app/providers/AuthContext';
import NotFoundPage from '../../../pages/NotFoundPage';
import MaintenancePage from '../../../pages/MaintenancePage';
import useScrollToHash from '../../../shared/hooks/useScrollToHash';
import CookieBanner from '../components/CookieBanner';
import FontLoader from '../components/FontLoader';
import SiteControls from '../components/SiteControls';
import ReportModal from '../../../shared/ui/complex/ReportModal';
import { BASE_URL } from '../../../shared/config';
import { getDefaultBlockData } from '../../editor/core/editorConfig';
import { Loader2, Layers } from 'lucide-react';

const SiteDisplayPage = () => {
    const { siteData, isSiteLoading } = useOutletContext();
    const { site_path } = useParams();
    const { user } = useContext(AuthContext);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [show404, setShow404] = useState(false);
    useScrollToHash();
    useEffect(() => {
        if (!isSiteLoading && siteData && siteData.page && siteData.page.is_homepage) {
            apiClient.get(`/sites/${site_path}`, { params: { increment_view: 'true' } })
                .catch(err => console.warn("View counter error:", err));
        }
    }, [isSiteLoading, siteData, site_path]);
    
    const isMissingData = !siteData || !siteData.page;
    useEffect(() => {
        let timer;
        if (!isSiteLoading && isMissingData) {
            timer = setTimeout(() => setShow404(true), 300);
        } else {
            setShow404(false);
        }
        return () => clearTimeout(timer);
    }, [isSiteLoading, isMissingData]);
    
    if (isSiteLoading || (isMissingData && !show404)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', paddingTop: '20vh', color: 'var(--platform-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 size={40} className="animate-spin mb-4" />
                <p>Завантаження сторінки...</p>
            </div>
        );
    }
    
    if (isMissingData && show404) return <NotFoundPage />;
    const isOwner = user && user.id === siteData.user_id;
    const isStaff = user && (user.role === 'admin' || user.role === 'moderator');
    if (siteData.status === 'private' && !isOwner && !isStaff) {
        return <NotFoundPage />;
    }
    if ((siteData.status === 'maintenance' || siteData.status === 'suspended') && !isOwner && !isStaff) {
        return <MaintenancePage logoUrl={siteData.logo_url} siteName={siteData.title} />;
    }
    const page = siteData.page;
    const titlePart = page.seo_title || page.name;
    const sitePart = siteData.site_title_seo || siteData.title;
    const finalTitle = `${titlePart} | ${sitePart}`;
    const description = page.seo_description || `Сторінка ${page.name} на сайті ${siteData.title}`;
    const favicon = siteData.favicon_url
        ? (siteData.favicon_url.startsWith('http')
            ? siteData.favicon_url
            : `${BASE_URL}${siteData.favicon_url.startsWith('/') ? '' : '/'}${siteData.favicon_url}`)
        : '/icon-light.webp';
        
    let pageBlocks = [];
    try {
        let parsedBlocks = Array.isArray(siteData.page.block_content)
            ? siteData.page.block_content
            : JSON.parse(siteData.page.block_content || '[]');
        pageBlocks = parsedBlocks.map(block => {
            if (block.type === 'global-header' || block.type === 'header') {
                let globalData = typeof siteData.header_content === 'string' 
                    ? JSON.parse(siteData.header_content || '{}') 
                    : (siteData.header_content || {});
                
                if (Object.keys(globalData).length === 0) globalData = getDefaultBlockData('global-header');
                return { ...block, type: 'global-header', data: globalData };
            }
            if (block.type === 'global-footer' || block.type === 'footer') {
                let globalData = typeof siteData.footer_content === 'string' 
                    ? JSON.parse(siteData.footer_content || '{}') 
                    : (siteData.footer_content || {});
                
                if (Object.keys(globalData).length === 0) globalData = getDefaultBlockData('global-footer');
                return { ...block, type: 'global-footer', data: globalData };
            }
            return block;
        });
    } catch (e) {
        console.error("Error parsing blocks:", e);
    }

    const hasHeader = pageBlocks.some(block => block.type === 'header' || block.type === 'global-header');
    const layoutStyle = {
        display: 'flex', flexDirection: 'column', minHeight: '100dvh',
        width: '100%', margin: 0, padding: 0,
        backgroundColor: 'var(--site-bg)', color: 'var(--site-text-primary)'
    };

    const mainContentStyle = {
        flex: '1', display: 'flex', flexDirection: 'column',
        width: '100%', marginBottom: '0'
    };

    const footerStyle = {
        flexShrink: 0, backgroundColor: 'var(--site-bg)',
        borderTop: '1px solid var(--site-border-color)',
        width: '100%', margin: 0, padding: 0, marginTop: '0'
    };

    const copyrightStyle = {
        textAlign: 'center', padding: '1.5rem', fontSize: '0.8rem',
        color: 'var(--site-text-secondary)', width: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    };

    return (
        <div 
            className="site-root site-theme-context relative" 
            style={layoutStyle}
            data-site-mode={siteData.site_theme_mode || 'light'}
            data-site-accent={siteData.site_accent || 'blue'}
        >
            <Helmet>
                <title>{finalTitle}</title>
                <meta name="description" content={description} />
                {page.seo_keywords && <meta name="keywords" content={page.seo_keywords} />}
                <link rel="icon" type="image/webp" href={favicon} />
                <meta property="og:title" content={finalTitle} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={siteData.logo_url ? (siteData.logo_url.startsWith('http') ? siteData.logo_url : `${BASE_URL}${siteData.logo_url}`) : favicon} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
            </Helmet>
            {!hasHeader && <SiteControls siteData={siteData} />}
            {siteData && siteData.theme_settings && (
                <FontLoader fontHeading={siteData.theme_settings.font_heading} fontBody={siteData.theme_settings.font_body} />
            )}
            <main style={mainContentStyle}>
                {pageBlocks && pageBlocks.length > 0 ? (
                    <BlockRenderer blocks={pageBlocks} siteData={siteData} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] w-full" style={{ backgroundColor: 'var(--site-bg)' }}>
                        <div className="mb-6 opacity-40">
                            <Layers size={64} style={{ color: 'var(--site-text-primary)' }} />
                        </div>
                        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--site-text-primary)' }}>Сторінка в розробці</h1>
                        <p className="max-w-md mx-auto text-[1.05rem]" style={{ color: 'var(--site-text-secondary)' }}>
                            Власник сайту ще не додав контент на цю сторінку. Завітайте сюди трохи згодом!
                        </p>
                    </div>
                )}
            </main>
            <footer style={footerStyle}>
                <div style={copyrightStyle}>
                    <span>Powered by Kendr</span>
                    {!isOwner && (
                        <>
                            <span>•</span>
                            <button
                                onClick={() => setIsReportOpen(true)}
                                style={{ background: 'transparent', border: 'none', color: 'inherit', textDecoration: 'none', cursor: 'pointer', fontSize: 'inherit', opacity: 0.8, padding: 0 }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--platform-danger)'}
                                onMouseLeave={(e) => e.target.style.color = 'inherit'}
                                title="Report Abuse / Поскаржитись"
                            >
                                Report
                            </button>
                        </>
                    )}
                </div>
            </footer>
            <CookieBanner enabled={siteData.cookie_banner_enabled} text={siteData.cookie_banner_text} siteId={siteData.id} />
            <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} siteId={siteData.id} />
        </div>
    );
};

export default SiteDisplayPage;
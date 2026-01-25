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
import ReportModal from '../../../shared/ui/complex/ReportModal';

const API_URL = 'http://localhost:5000';

const SiteDisplayPage = () => {
    const { siteData, isSiteLoading } = useOutletContext();
    const { site_path } = useParams();
    const { user } = useContext(AuthContext);
    const [isReportOpen, setIsReportOpen] = useState(false);
    useScrollToHash();
    useEffect(() => {
        if (!isSiteLoading && siteData && siteData.page && siteData.page.is_homepage) {
            apiClient.get(`/sites/${site_path}`, { params: { increment_view: 'true' } })
                .catch(err => console.warn("View counter error:", err));
        }
    }, [isSiteLoading, siteData, site_path]);
    if (isSiteLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center', paddingTop: '20vh' }}>Завантаження...</div>;
    }

    if (!siteData) return <NotFoundPage />;
    const isOwner = user && user.id === siteData.user_id;
    const isAdmin = user && user.role === 'admin';
    if (siteData.status === 'private' && !isOwner && !isAdmin) {
        return <NotFoundPage />;
    }

    if ((siteData.status === 'draft' || siteData.status === 'suspended') && !isOwner && !isAdmin) {
        return <MaintenancePage logoUrl={siteData.logo_url} siteName={siteData.title} />;
    }

    if (!siteData.page) return <NotFoundPage />;

    const page = siteData.page;
    const titlePart = page.seo_title || page.name;
    const sitePart = siteData.site_title_seo || siteData.title;
    const finalTitle = `${titlePart} | ${sitePart}`;
    const description = page.seo_description || `Сторінка ${page.name} на сайті ${siteData.title}`;
    const favicon = siteData.favicon_url
        ? (siteData.favicon_url.startsWith('http')
            ? siteData.favicon_url
            : `${API_URL}${siteData.favicon_url.startsWith('/') ? '' : '/'}${siteData.favicon_url}`)
        : '/icon-light.webp';

    let pageBlocks = [];
    try {
        pageBlocks = Array.isArray(siteData.page.block_content)
            ? siteData.page.block_content
            : JSON.parse(siteData.page.block_content || '[]');
    } catch (e) {}

    let footerBlocks = [];
    try {
        footerBlocks = Array.isArray(siteData.footer_content)
            ? siteData.footer_content
            : JSON.parse(siteData.footer_content || '[]');
    } catch (e) {}

    const layoutStyle = {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0
    };

    const mainContentStyle = {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: '0'
    };

    const footerStyle = {
        flexShrink: 0,
        backgroundColor: siteData.site_theme_mode === 'dark' ? '#1a202c' : '#f7fafc',
        borderTop: `1px solid ${siteData.site_theme_mode === 'dark' ? '#2d3748' : '#e2e8f0'}`,
        width: '100%',
        margin: 0,
        padding: 0,
        marginTop: '0'
    };

    const copyrightStyle = {
        textAlign: 'center',
        padding: '1.5rem',
        fontSize: '0.8rem',
        color: siteData.site_theme_mode === 'dark' ? '#a0aec0' : '#718096',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    };

    return (
        <div className="site-root" style={layoutStyle}>
            <Helmet>
                <title>{finalTitle}</title>
                <meta name="description" content={description} />
                {page.seo_keywords && <meta name="keywords" content={page.seo_keywords} />}
                <link rel="icon" type="image/webp" href={favicon} />
                <meta property="og:title" content={finalTitle} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={siteData.logo_url ? (siteData.logo_url.startsWith('http') ? siteData.logo_url : `${API_URL}${siteData.logo_url}`) : favicon} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
            </Helmet>

            {siteData && siteData.theme_settings && (
                <FontLoader
                    fontHeading={siteData.theme_settings.font_heading}
                    fontBody={siteData.theme_settings.font_body}
                />
            )}

            <main style={mainContentStyle}>
                <BlockRenderer blocks={pageBlocks} siteData={siteData} />
            </main>

            {(footerBlocks.length > 0 || true) && (
                <footer style={footerStyle}>
                    {footerBlocks.length > 0 && <BlockRenderer blocks={footerBlocks} siteData={siteData} />}

                    <div style={copyrightStyle}>
                        <span>Powered by Kendr</span>
                        {!isOwner && (
                            <>
                                <span>•</span>
                                <button
                                    onClick={() => setIsReportOpen(true)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        fontSize: 'inherit',
                                        opacity: 0.8,
                                        padding: 0
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#e53e3e'}
                                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                                    title="Report Abuse / Поскаржитись"
                                >
                                    Report
                                </button>
                            </>
                        )}
                    </div>
                </footer>
            )}

            <CookieBanner
                settings={siteData.theme_settings?.cookie_banner}
                siteId={siteData.id}
            />

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                siteId={siteData.id}
            />
        </div>
    );
};

export default SiteDisplayPage;
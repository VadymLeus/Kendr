// frontend/src/pages/sites/SiteDisplayPage.jsx
import React, { useContext, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockRenderer from '../../features/editor/blocks/BlockRenderer';
import { AuthContext } from '../../providers/AuthContext';
import NotFoundPage from '../../components/common/NotFoundPage';
import MaintenancePage from '../../components/common/MaintenancePage';

const SiteDisplayPage = () => {
    const { siteData, isSiteLoading } = useOutletContext();
    const { site_path } = useParams();
    const { user } = useContext(AuthContext);
    
    useEffect(() => {
        if (!isSiteLoading && siteData && siteData.page && siteData.page.is_homepage) {
            apiClient.get(`/sites/${site_path}`, { params: { increment_view: 'true' } })
                .catch(err => console.warn("Помилка лічильника:", err));
        }
    }, [isSiteLoading, siteData, site_path]);

    if (isSiteLoading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', paddingTop: '20vh' }}>
                Завантаження...
            </div>
        );
    }

    if (!siteData) {
        return <NotFoundPage />;
    }

    const isOwner = user && user.id === siteData.user_id;
    const isAdmin = user && user.role === 'admin';
    
    if ((siteData.status === 'private' || siteData.status === 'draft') && !isOwner && !isAdmin) {
        return <MaintenancePage logoUrl={siteData.logo_url} siteName={siteData.title} />;
    }

    if (!siteData.page) {
        return <NotFoundPage />;
    }

    let pageBlocks = [];
    if (Array.isArray(siteData.page.block_content)) {
        pageBlocks = siteData.page.block_content;
    } else if (typeof siteData.page.block_content === 'string') {
        try { pageBlocks = JSON.parse(siteData.page.block_content); } catch (e) {}
    }

    let footerBlocks = [];
    if (Array.isArray(siteData.footer_content)) {
        footerBlocks = siteData.footer_content;
    } else if (typeof siteData.footer_content === 'string') {
        try { footerBlocks = JSON.parse(siteData.footer_content); } catch (e) {}
    }

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
        width: '100%'
    };

    const footerStyle = {
        flexShrink: 0,
        backgroundColor: siteData.site_theme_mode === 'dark' ? '#1a202c' : '#f7fafc',
        borderTop: `1px solid ${siteData.site_theme_mode === 'dark' ? '#2d3748' : '#e2e8f0'}`,
        width: '100%',
        margin: 0,
        padding: 0 
    };

    const copyrightStyle = {
        textAlign: 'center', 
        padding: '1.5rem',
        opacity: 0.5, 
        fontSize: '0.8rem',
        color: siteData.site_theme_mode === 'dark' ? '#a0aec0' : '#718096',
        width: '100%',
        boxSizing: 'border-box'
    };

    return (
        <div className="site-root" style={layoutStyle}>
            <main style={mainContentStyle}>
                <BlockRenderer blocks={pageBlocks} siteData={siteData} />
            </main>

            {footerBlocks.length > 0 && (
                <footer style={footerStyle}>
                    <BlockRenderer blocks={footerBlocks} siteData={siteData} />
                    <div style={copyrightStyle}>
                        Powered by Kendr
                    </div>
                </footer>
            )}
        </div>
    );
};

export default SiteDisplayPage;
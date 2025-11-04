// frontend/src/features/sites/SiteDisplayPage.jsx
import React, { useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockRenderer from '../../components/blocks/BlockRenderer';

const SiteDisplayPage = () => {
    const { siteData, isSiteLoading } = useOutletContext();
    const { site_path, slug } = useParams();
    
    useEffect(() => {
        if (!isSiteLoading && siteData && siteData.page && siteData.page.is_homepage) {
            apiClient.get(`/sites/${site_path}`, {
                params: { increment_view: 'true' }
            }).catch(err => {
                console.warn("Помилка збільшення лічильника:", err);
            });
        }
    }, [isSiteLoading, siteData, site_path]);

    if (isSiteLoading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--site-text-secondary)' }}>
            Завантаження сайту...
        </div>
    );
    
    if (!siteData) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--site-text-secondary)' }}>
            Сайт не знайдено.
        </div>
    );

    if (!siteData.page) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--site-text-secondary)' }}>
                Сторінку не знайдено.
            </div>
        );
    }

    let blocksToRender = [];

    if (Array.isArray(siteData.page.block_content)) {
        blocksToRender = siteData.page.block_content;
    } else if (typeof siteData.page.block_content === 'string') {
        try {
            blocksToRender = JSON.parse(siteData.page.block_content);
        } catch (e) {
            console.error("Помилка обробки block_content:", e);
            blocksToRender = [];
        }
    }

    return (
        <BlockRenderer blocks={blocksToRender} siteData={siteData} />
    );
};

export default SiteDisplayPage;

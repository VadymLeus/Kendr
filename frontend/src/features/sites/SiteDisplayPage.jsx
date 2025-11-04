// frontend/src/features/sites/SiteDisplayPage.jsx
import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import BlockRenderer from '../../components/blocks/BlockRenderer';

const SiteDisplayPage = () => {
    const { siteData, isSiteLoading } = useOutletContext();
    
    if (isSiteLoading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            Завантаження сайту...
        </div>
    );
    
    if (!siteData) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            Сайт не знайдено.
        </div>
    );

    let blocksToRender = [];
    
    if (Array.isArray(siteData.page_content)) {
        blocksToRender = siteData.page_content;
    } else if (typeof siteData.page_content === 'string') {
        try {
            blocksToRender = JSON.parse(siteData.page_content);
        } catch (e) {
            console.error("Помилка парсингу page_content:", e);
            blocksToRender = [];
        }
    } else {
        blocksToRender = [];
    }

    return (
        <BlockRenderer blocks={blocksToRender} siteData={siteData} />
    );
};

export default SiteDisplayPage;
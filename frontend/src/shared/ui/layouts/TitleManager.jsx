// frontend/src/shared/ui/layouts/TitleManager.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getTitleForPath } from '../../../app/router/routesConfig';

const TitleManager = ({ siteData }) => {
    const location = useLocation();
    const staticTitle = getTitleForPath(location.pathname);
    let finalTitle = '';
    if (staticTitle) {
        finalTitle = `${staticTitle} | Kendr`;
    } 
    else if (siteData?.title) {
        if (location.pathname.startsWith('/site/')) {
            const pageName = siteData.page?.name || 'Головна';
            finalTitle = `${pageName} | ${siteData.title}`;
        } else if (location.pathname.startsWith('/dashboard/')) {
            finalTitle = `Редактор: ${siteData.title}`;
        } else if (location.pathname.startsWith('/product/')) {
            finalTitle = `Товар | ${siteData.title}`;
        } else {
            finalTitle = siteData.title;
        }
    } 
    else {
        finalTitle = 'Kendr - Платформа';
    }


    return (
        <Helmet>
            <title>{finalTitle}</title>
        </Helmet>
    );
};

export default TitleManager;
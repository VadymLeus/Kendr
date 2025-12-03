// frontend/src/modules/site-render/components/FontLoader.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const API_URL = 'http://localhost:5000';

const FontLoader = ({ fontHeading, fontBody }) => {
    const getFontCss = (fontFamily, type) => {
        if (!fontFamily || fontFamily === 'global') return null;

        const isCustomFont = fontFamily.includes('/uploads/') || fontFamily.includes('http');

        if (isCustomFont) {
            const fontUrl = fontFamily.startsWith('http') ? fontFamily : `${API_URL}${fontFamily}`;
            const fontName = `CustomFont-${type}`;

            let format = 'truetype';
            if (fontUrl.endsWith('.woff2')) format = 'woff2';
            else if (fontUrl.endsWith('.woff')) format = 'woff';
            else if (fontUrl.endsWith('.otf')) format = 'opentype';

            return {
                isCustom: true,
                name: fontName,
                style: `
                    @font-face {
                        font-family: '${fontName}';
                        src: url('${fontUrl}') format('${format}');
                        font-weight: normal;
                        font-style: normal;
                        font-display: swap;
                    }
                `
            };
        } else {
            const cleanName = fontFamily.split(',')[0].replace(/['"]/g, '');
            return {
                isCustom: false,
                name: fontFamily,
                link: `https://fonts.googleapis.com/css2?family=${cleanName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
            };
        }
    };

    const headingFont = getFontCss(fontHeading, 'heading');
    const bodyFont = getFontCss(fontBody, 'body');

    return (
        <Helmet>
            {headingFont && !headingFont.isCustom && (
                <link rel="stylesheet" href={headingFont.link} />
            )}
            {bodyFont && !bodyFont.isCustom && (
                <link rel="stylesheet" href={bodyFont.link} />
            )}

            {headingFont && headingFont.isCustom && (
                <style type="text/css">{headingFont.style}</style>
            )}
            {bodyFont && bodyFont.isCustom && (
                <style type="text/css">{bodyFont.style}</style>
            )}

            <style type="text/css">{`
                :root {
                    --font-heading: ${headingFont ? (headingFont.isCustom ? `'${headingFont.name}', sans-serif` : headingFont.name) : 'inherit'};
                    --font-body: ${bodyFont ? (bodyFont.isCustom ? `'${bodyFont.name}', sans-serif` : bodyFont.name) : 'inherit'};
                }
            `}</style>
        </Helmet>
    );
};

export default FontLoader;
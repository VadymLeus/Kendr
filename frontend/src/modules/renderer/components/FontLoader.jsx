// frontend/src/modules/renderer/components/FontLoader.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const API_URL = 'http://localhost:5000';
const FontLoader = ({ fontHeading, fontBody }) => {
    const getFontCss = (fontFamily, type) => {
        if (!fontFamily || fontFamily === 'global') return null;
        const isCustomFont = fontFamily.includes('uploads') || fontFamily.includes('http');
        if (isCustomFont) {
            let fontUrl = fontFamily;
            if (!fontFamily.startsWith('http')) {
                const path = fontFamily.startsWith('/') ? fontFamily : `/${fontFamily}`;
                fontUrl = `${API_URL}${path}`;
            }
            
            const fontName = `CustomFont-${type}`;
            let format = 'truetype';
            if (fontUrl.endsWith('.woff2')) format = 'woff2';
            else if (fontUrl.endsWith('.woff')) format = 'woff';
            else if (fontUrl.endsWith('.otf')) format = 'opentype';
            return {
                isCustom: true,
                name: fontName,
                link: null,
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
                name: cleanName,
                style: null,
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
                    --site-font-heading: ${headingFont ? `'${headingFont.name}', sans-serif` : 'inherit'};
                    --site-font-body: ${bodyFont ? `'${bodyFont.name}', sans-serif` : 'inherit'};
                }
            `}</style>
        </Helmet>
    );
};

export default FontLoader;
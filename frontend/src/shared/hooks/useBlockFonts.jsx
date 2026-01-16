// frontend/src/shared/hooks/useBlockFonts.jsx
import React, { useMemo } from 'react';

const API_URL = 'http://localhost:5000';

export const useBlockFonts = (fontsConfig, siteData) => {
    const themeSettings = siteData?.theme_settings || {};
    const globalFonts = {
        site_heading: themeSettings.font_heading,
        site_body: themeSettings.font_body
    };

    const resolveRealValue = (fontVal) => {
        if (!fontVal || fontVal === 'global' || fontVal === 'inherit') return null;
        if (fontVal === 'site_heading') return globalFonts.site_heading;
        if (fontVal === 'site_body') return globalFonts.site_body;
        return fontVal;
    };

    const formatFamilyName = (realVal) => {
        if (!realVal) return 'inherit';
        if (realVal.includes('uploads') || realVal.includes('http') || realVal.includes('/')) {
            return `CustomFont-${realVal.replace(/[^a-zA-Z0-9]/g, '-')}`;
        }
        return realVal.split(',')[0].replace(/['"]/g, '');
    };

    const cssVariables = useMemo(() => {
        const headingReal = resolveRealValue('site_heading');
        const bodyReal = resolveRealValue('site_body');
        const headingFamily = headingReal ? `'${formatFamilyName(headingReal)}', sans-serif` : 'sans-serif';
        const bodyFamily = bodyReal ? `'${formatFamilyName(bodyReal)}', sans-serif` : 'sans-serif';

        return {
            '--site-font-heading': headingFamily,
            '--site-font-body': bodyFamily,
        };
    }, [themeSettings]); 

    const styles = useMemo(() => {
        const result = {};
        Object.keys(fontsConfig).forEach(key => {
            const fontVal = fontsConfig[key];
            if (fontVal === 'site_heading') {
                result[key] = 'var(--site-font-heading)';
            } else if (fontVal === 'site_body') {
                result[key] = 'var(--site-font-body)';
            } else {
                const real = resolveRealValue(fontVal);
                if (!real) {
                    result[key] = 'inherit';
                } else {
                    const name = formatFamilyName(real);
                    result[key] = `'${name}', sans-serif`;
                }
            }
        });
        return result;
    }, [fontsConfig, cssVariables]);

    const RenderFonts = () => {
        const uniqueFonts = new Set();
        [...Object.values(fontsConfig), 'site_heading', 'site_body'].forEach(val => {
            const real = resolveRealValue(val);
            if (real && real !== 'inherit') uniqueFonts.add(real);
        });

        return (
            <>
                {Array.from(uniqueFonts).map(fontVal => {
                    if (fontVal.includes('uploads') || fontVal.includes('http') || fontVal.includes('/')) {
                        const name = formatFamilyName(fontVal);
                        let url = fontVal.startsWith('http') ? fontVal : `${API_URL}${fontVal.startsWith('/') ? '' : '/'}${fontVal}`;
                        let format = 'truetype';
                        if (url.endsWith('.woff2')) format = 'woff2';
                        else if (url.endsWith('.woff')) format = 'woff';
                        else if (url.endsWith('.otf')) format = 'opentype';
                        
                        return (
                            <style key={name}>{`
                                @font-face {
                                    font-family: '${name}';
                                    src: url('${url}') format('${format}');
                                    font-weight: normal; font-style: normal; font-display: swap;
                                }
                            `}</style>
                        );
                    }
                    
                    if (!fontVal.includes('var(') && !fontVal.includes('CustomFont-')) {
                        const clean = fontVal.split(',')[0].replace(/['"]/g, '');
                        if(['sans-serif', 'serif', 'monospace', 'inherit'].includes(clean.toLowerCase())) return null;
                        const href = `https://fonts.googleapis.com/css2?family=${clean.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
                        return <link key={clean} rel="stylesheet" href={href} />;
                    }
                    return null;
                })}
            </>
        );
    };

    return { styles, RenderFonts, cssVariables };
};
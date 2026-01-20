// frontend/src/pages/MaintenancePage.jsx
import React from 'react';
import { Construction } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const MaintenancePage = ({ logoUrl, siteName, themeSettings = {} }) => {
    const colors = themeSettings?.colors || {};
    const fonts = themeSettings?.fonts || {};
    const primaryColor = colors.primary || '#3182ce';
    const customProperties = {
        '--color-bg': colors.bg || '#ffffff',
        '--color-text': colors.text || '#1a202c',
        '--color-primary': primaryColor,
        '--color-secondary': colors.secondary || '#718096',
        '--font-heading': fonts.heading || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '--font-body': fonts.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };

    const containerStyle = {
        ...customProperties,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%', 
        width: '100%',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        textAlign: 'center',
        padding: '40px 20px',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.3s ease',
    };

    const logoStyle = {
        width: '120px',
        height: '120px',
        objectFit: 'contain',
        marginBottom: '2rem',
        ...(logoUrl ? { borderRadius: '16px' } : {})
    };

    const iconContainerStyle = {
        marginBottom: '1.5rem',
        color: 'var(--color-primary)',
        background: 'var(--color-bg)',
        borderRadius: '50%',
        padding: '20px',
        border: '2px solid var(--color-primary)',
        display: 'inline-flex',
        opacity: 0.9
    };

    const titleStyle = {
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
        margin: '0 0 1rem 0',
        fontWeight: '700',
        lineHeight: 1.2,
        color: 'var(--color-text)',
        maxWidth: '800px',
        wordBreak: 'break-word'
    };

    const textStyle = {
        color: 'var(--color-text)',
        opacity: 0.8,
        maxWidth: '700px',
        width: '100%',
        fontSize: '1.125rem',
        lineHeight: 1.6,
        margin: '0 0 2rem 0',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
    };

    const highlightStyle = {
        color: 'var(--color-primary)',
        fontWeight: '600',
        display: 'inline-block',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'bottom'
    };

    const footerStyle = {
        marginTop: 'auto',
        paddingTop: '2rem',
        fontSize: '0.875rem',
        opacity: 0.6,
        fontFamily: 'var(--font-body)'
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    .layout-content::-webkit-scrollbar-thumb:hover {
                        background-color: ${primaryColor} !important;
                    }
                `}
            </style>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    {logoUrl && !logoUrl.includes('default') ? (
                        <img 
                            src={logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`} 
                            alt={siteName} 
                            style={logoStyle} 
                        />
                    ) : (
                        <div style={iconContainerStyle}>
                            <Construction size={64} strokeWidth={1.5} />
                        </div>
                    )}
                </div>
                
                <h1 style={titleStyle}>Технічне обслуговування</h1>
                
                <p style={textStyle}>
                    Сайт <span style={highlightStyle} title={siteName || 'цей сайт'}>"{siteName || 'цей сайт'}"</span> тимчасово недоступний через планові роботи або оновлення.
                    <br />
                    <br />
                    Ми вже працюємо над відновленням доступу.
                    <br />
                    Будь ласка, спробуйте зайти пізніше.
                </p>
                
                <div style={{ 
                    width: '60px', 
                    height: '4px', 
                    background: 'var(--color-primary)', 
                    borderRadius: '2px',
                    opacity: 0.5 
                }} />
            </div>

            <div style={footerStyle}>
                &copy; {new Date().getFullYear()} {siteName}. Всі права захищено.
            </div>
        </div>
    );
};

export default MaintenancePage;
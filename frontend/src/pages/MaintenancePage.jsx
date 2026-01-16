// frontend/src/pages/MaintenancePage.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';
const MaintenancePage = ({ logoUrl, siteName }) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        textAlign: 'center',
        padding: '40px 20px',
        fontFamily: 'var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)'
    };

    const logoStyle = {
        width: '100px',
        height: '100px',
        objectFit: 'contain',
        marginBottom: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    };

    const iconStyle = {
        fontSize: '5rem',
        marginBottom: '1.5rem',
        filter: 'grayscale(0.3)'
    };

    const titleStyle = {
        fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
        margin: '0 0 1rem 0',
        fontWeight: '700',
        lineHeight: 1.3
    };

    const textStyle = {
        color: 'var(--platform-text-secondary)',
        maxWidth: '500px',
        fontSize: '1.1rem',
        lineHeight: 1.6,
        margin: '0 0 2rem 0'
    };

    const highlightStyle = {
        color: 'var(--platform-accent)',
        fontWeight: '600'
    };

    return (
        <div style={containerStyle}>
            <div style={{ marginBottom: '2.5rem' }}>
                {logoUrl && !logoUrl.includes('default') ? (
                    <img 
                        src={logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`} 
                        alt={siteName} 
                        style={logoStyle} 
                    />
                ) : (
                    <div style={iconStyle}>⚙️</div>
                )}
            </div>
            
            <h1 style={titleStyle}>Сайт на технічному обслуговуванні</h1>
            <p style={textStyle}>
                Сайт <span style={highlightStyle}>"{siteName || 'цей сайт'}"</span> <strong>Тимчасово недоступний</strong>
                <br />
                Слідкуйте за новинами
                <br />
                Будь ласка, спробуйте зайти пізніше
            </p>
            
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: 'var(--platform-bg-secondary)',
                borderRadius: '8px',
                maxWidth: '400px',
                fontSize: '0.9rem',
                color: 'var(--platform-text-secondary)'
            }}>
            
            </div>
        </div>
    );
};

export default MaintenancePage;
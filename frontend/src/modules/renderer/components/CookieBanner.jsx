// frontend/src/modules/renderer/components/CookieBanner.jsx
import React, { useState, useEffect } from 'react';

const CookieBanner = ({ enabled, text, siteId }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (!enabled || !siteId) return;
        const storageKey = `cookie_consent_site_${siteId}`;
        const consentStatus = localStorage.getItem(storageKey);
        if (consentStatus === null) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [enabled, siteId]);

    const handleAction = (status) => {
        const storageKey = `cookie_consent_site_${siteId}`;
        localStorage.setItem(storageKey, status);
        setIsVisible(false);
    };
    if (!isVisible) return null;
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '600px',
            backgroundColor: 'var(--site-bg)', 
            color: 'var(--site-text-primary)',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 10000,
            border: '1px solid var(--site-border-color)',
            borderRadius: '12px',
            animation: 'slideUp 0.5s ease-out'
        }}>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                {text || "Цей сайт використовує файли cookie для покращення користувацького досвіду."}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => handleAction('denied')}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'var(--site-text-secondary)',
                        border: '1px solid var(--site-border-color)',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        flex: '1 1 auto',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = 'var(--site-text-primary)';
                        e.target.style.borderColor = 'var(--site-text-primary)';
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'var(--site-text-secondary)';
                        e.target.style.borderColor = 'var(--site-border-color)';
                        e.target.style.backgroundColor = 'transparent';
                    }}
                >
                    Відхилити
                </button>
                <button 
                    onClick={() => handleAction('granted')}
                    style={{
                        backgroundColor: 'var(--site-accent)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        flex: '1 1 auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.filter = 'brightness(1.1)';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.filter = 'none';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    Зрозуміло
                </button>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CookieBanner;
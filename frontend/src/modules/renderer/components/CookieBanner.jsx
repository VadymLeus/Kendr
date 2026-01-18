// frontend/src/modules/renderer/components/CookieBanner.jsx
import React, { useState, useEffect } from 'react';

const CookieBanner = ({ settings, siteId }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (!settings?.enabled) return;

        const storageKey = `cookie_consent_site_${siteId}`;
        const consentStatus = localStorage.getItem(storageKey);

        if (consentStatus === null) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [settings, siteId]);

    const handleAction = (status) => {
        const storageKey = `cookie_consent_site_${siteId}`;
        localStorage.setItem(storageKey, status);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const positionStyle = settings.position === 'top' 
        ? { top: '0', bottom: 'auto', borderRadius: '0 0 12px 12px', transform: 'translateX(-50%) translateY(0)' }
        : { bottom: '20px', top: 'auto', borderRadius: '12px', transform: 'translateX(-50%)' };

    return (
        <div className="cookie-banner-wrapper" style={{
            position: 'fixed',
            left: '50%',
            width: '90%',
            maxWidth: '600px',
            backgroundColor: 'var(--site-card-bg, #fff)', 
            color: 'var(--site-text-primary, #000)',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 10000,
            border: '1px solid var(--site-border-color, #eee)',
            animation: 'slideUp 0.5s ease-out',
            ...positionStyle
        }}>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                {settings.text || "Цей сайт використовує файли cookie для покращення роботи."}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {(settings.showReject !== false) && (
                    <button 
                        onClick={() => handleAction('denied')}
                        style={{
                            backgroundColor: 'var(--site-card-bg, #fff)',
                            color: 'var(--site-text-secondary, #666)',
                            border: '2px solid var(--site-border-color, #ddd)',
                            padding: '8px 20px',
                            borderRadius: 'var(--btn-radius, 6px)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            flex: '1 1 auto',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--site-bg, #f8f9fa)';
                            e.target.style.borderColor = 'var(--site-text-secondary, #999)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--site-card-bg, #fff)';
                            e.target.style.borderColor = 'var(--site-border-color, #ddd)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                    >
                        {settings.rejectText || "Відхилити"}
                    </button>
                )}

                <button 
                    onClick={() => handleAction('granted')}
                    style={{
                        backgroundColor: 'var(--site-accent, #007bff)',
                        color: 'var(--site-accent-text, #fff)',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: 'var(--btn-radius, 6px)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        flex: '1 1 auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    }}
                >
                    {settings.acceptText || settings.buttonText || "Прийняти"}
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
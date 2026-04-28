// frontend/src/modules/renderer/components/CookieBanner.jsx
import React, { useState, useEffect } from 'react';

const CookieBanner = ({ 
    enabled, 
    text, 
    siteId, 
    size = 'medium', 
    position = 'bottom-center', 
    blur = false 
}) => {
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
    const getSizeStyles = () => {
        switch (size) {
            case 'small': return { maxWidth: '400px', padding: '16px', fontSize: '13px' };
            case 'large': return { maxWidth: '800px', padding: '24px', fontSize: '16px' };
            case 'medium':
            default: return { maxWidth: '600px', padding: '20px', fontSize: '14px' };
        }
    };

    const getPositionStyles = () => {
        let styles = { position: 'fixed', zIndex: 10001 };
        if (position.includes('top')) styles.top = '20px';
        if (position.includes('bottom')) styles.bottom = '20px';
        if (position.includes('middle')) {
            styles.top = '50%';
            styles.transform = 'translateY(-50%)';
        }
        if (position.includes('left')) styles.left = '20px';
        if (position.includes('right')) styles.right = '20px';
        if (position.includes('center')) {
            styles.left = '50%';
            if (styles.transform) {
                styles.transform = 'translate(-50%, -50%)';
            } else {
                styles.transform = 'translateX(-50%)';
            }
        }
        return styles;
    };

    const sizeStyles = getSizeStyles();
    const bannerContent = (
        <div style={{
            ...getPositionStyles(),
            width: '90%',
            maxWidth: sizeStyles.maxWidth,
            backgroundColor: 'var(--site-bg)', 
            color: 'var(--site-text-primary)',
            padding: sizeStyles.padding,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            border: '1px solid var(--site-border-color)',
            borderRadius: '12px',
            animation: 'cookieFadeIn 0.5s ease-out'
        }}>
            <p style={{ margin: 0, fontSize: sizeStyles.fontSize, lineHeight: '1.5' }}>
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
                @keyframes cookieFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
    if (blur) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                zIndex: 10000,
                animation: 'cookieFadeIn 0.5s ease-out'
            }}>
                {bannerContent}
            </div>
        );
    }

    return bannerContent;
};

export default CookieBanner;
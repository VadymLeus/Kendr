// frontend/src/common/components/ui/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
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

    const codeStyle = {
        fontSize: 'clamp(4rem, 15vw, 8rem)',
        fontWeight: '800',
        color: 'var(--platform-accent)',
        margin: '0 0 0.5rem 0',
        lineHeight: 1,
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
    };

    const titleStyle = {
        fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
        margin: '0 0 2.5rem 0',
        color: 'var(--platform-text-secondary)',
        fontWeight: '500',
        maxWidth: '400px',
        lineHeight: 1.4
    };

    const buttonStyle = {
        padding: '12px 32px',
        fontSize: '1rem',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    };

    return (
        <div style={containerStyle}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={codeStyle}>404</h1>
                <p style={titleStyle}>Сторінку не знайдено</p>
            </div>
            <Link to="/">
                <button 
                    className="btn btn-primary" 
                    style={buttonStyle}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                >
                    Повернутися на головну
                </button>
            </Link>
        </div>
    );
};

export default NotFoundPage;
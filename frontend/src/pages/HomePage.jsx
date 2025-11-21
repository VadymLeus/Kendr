// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const containerStyle = {
        textAlign: 'center',
        padding: '4rem 1rem',
        maxWidth: '800px',
        margin: '0 auto'
    };

    const titleStyle = {
        color: 'var(--platform-text-primary)',
        fontSize: '2.5rem',
        marginBottom: '1rem',
        fontWeight: '700'
    };

    const subtitleStyle = {
        color: 'var(--platform-text-secondary)',
        fontSize: '1.2rem',
        marginBottom: '2.5rem',
        lineHeight: '1.6'
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>Ласкаво просимо до Kendr! 🚀</h1>
            <p style={subtitleStyle}>
                Ваша платформа для створення неймовірних сайтів.
            </p>
            <Link to="/register">
                <button className="btn btn-primary" style={{ 
                    padding: '1rem 2rem', 
                    fontSize: '1.1rem',
                    fontWeight: '600'
                }}>
                    Почати безкоштовно
                </button>
            </Link>
        </div>
    );
};

export default HomePage;
// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/components/ui/Button';
import { IconEye, IconArrowRight } from '../common/components/ui/Icons';

const HomePage = () => {
    const containerStyle = {
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto'
    };

    const titleStyle = {
        color: 'var(--platform-text-primary)',
        fontSize: '3rem',
        marginBottom: '1.5rem',
        fontWeight: '800',
        lineHeight: '1.2',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
    };

    const subtitleStyle = {
        color: 'var(--platform-text-secondary)',
        fontSize: '1.25rem',
        marginBottom: '3rem',
        lineHeight: '1.6',
        maxWidth: '600px'
    };

    const iconStyle = {
        color: 'var(--platform-accent)',
        display: 'inline-flex'
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>
                Ласкаво просимо до Kendr! 
                <span style={iconStyle}>
                    <IconEye size={48} />
                </span>
            </h1>
            
            <p style={subtitleStyle}>
                Ваша платформа для створення неймовірних сайтів. 
                Просто, швидко та ефективно.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Button 
                        variant="primary" 
                        style={{ padding: '12px 32px', fontSize: '1.1rem' }}
                        icon={<IconArrowRight size={20}/>}
                    >
                        Почати безкоштовно
                    </Button>
                </Link>
                
                <Link to="/catalog" style={{ textDecoration: 'none' }}>
                    <Button 
                        variant="outline" 
                        style={{ padding: '12px 32px', fontSize: '1.1rem' }}
                    >
                        Каталог
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
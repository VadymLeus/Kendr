// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerStyle = {
        backgroundColor: '#f0f0f0',
        color: '#555',
        borderTop: '1px solid #ccc',
        textAlign: 'center',
        padding: '2rem',
        marginTop: 'auto'
    };

    const linkStyle = {
        margin: '0 15px',
        color: '#333',
        textDecoration: 'none'
    };

    return (
        <footer style={footerStyle}>
            <div style={{ marginBottom: '1rem' }}>
                <Link to="/" style={linkStyle}>Головна</Link>
                <Link to="/catalog" style={linkStyle}>Каталог сайтів</Link>
            </div>
            <p>© {currentYear} Kendr. Всі права захищено.</p>
        </footer>
    );
};

export default Footer;
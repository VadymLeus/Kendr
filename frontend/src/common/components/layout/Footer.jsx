// frontend/src/common/components/layout/Footer.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import { IconGlobe, IconShop, IconLogin, IconUser } from '../../components/ui/Icons';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    backgroundColor: 'var(--platform-card-bg)',
    color: 'var(--platform-text-secondary)',
    borderTop: '1px solid var(--platform-border-color)',
    padding: '1.5rem 2rem',
    marginTop: 'auto',
    flexShrink: 0,
    fontSize: '0.9rem'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  };

  const linksContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'var(--platform-text-primary)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const handleMouseEnter = (e) => e.currentTarget.style.color = 'var(--platform-accent)';
  const handleMouseLeave = (e) => e.currentTarget.style.color = 'var(--platform-text-primary)';

  const links = user 
    ? [
        { to: "/", label: "Головна", icon: <IconGlobe size={16}/> },
        { to: "/catalog", label: "Каталог сайтів", icon: <IconShop size={16}/> },
        { to: "/support", label: "Підтримка", icon: null },
        { to: "/rules", label: "Правила", icon: null }
      ]
    : [
        { to: "/", label: "Головна", icon: <IconGlobe size={16}/> },
        { to: "/catalog", label: "Каталог сайтів", icon: <IconShop size={16}/> },
        { to: "/login", label: "Авторизація", icon: <IconLogin size={16}/> }
      ];

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={linksContainerStyle}>
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              style={linkStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {link.icon && <span style={{opacity: 0.7}}>{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </div>
        
        <div style={{ 
            width: '100%', 
            height: '1px', 
            background: 'var(--platform-border-color)', 
            maxWidth: '200px',
            opacity: 0.5
        }} />

        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>
          © {currentYear} Kendr. Усі права захищено.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
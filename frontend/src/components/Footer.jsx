// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Стили с использованием CSS переменных платформы
  const footerStyle = {
    backgroundColor: 'var(--platform-card-bg)',
    color: 'var(--platform-text-secondary)',
    borderTop: '1px solid var(--platform-border-color)',
    textAlign: 'center',
    padding: '2rem',
    marginTop: 'auto',
    flexShrink: 0 // Важно для правильного позиционирования в flex-контейнере
  };

  const linksContainerStyle = {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem'
  };

  const linkStyle = {
    color: 'var(--platform-text-primary)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    fontSize: '0.95rem',
    fontWeight: '500'
  };

  const linkHoverStyle = {
    color: 'var(--platform-accent)'
  };

  // Функция для обработки hover-эффектов
  const handleMouseEnter = (e) => {
    e.target.style.color = 'var(--platform-accent)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.color = 'var(--platform-text-primary)';
  };

  const links = [
    { to: "/", label: "Головна" },
    { to: "/catalog", label: "Каталог сайтів" },
    { to: "/support", label: "Підтримка" },
    { to: "/rules", label: "Правила" }
  ];

  return (
    <footer style={footerStyle}>
      <div style={linksContainerStyle}>
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            style={linkStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
        © {currentYear} Kendr. Усі права захищено.
      </p>
    </footer>
  );
};

export default Footer;
// frontend/src/components/blocks/HeroBlock.jsx
import React from 'react';

const HeroBlock = ({ blockData, siteData }) => {
    const { title, subtitle, buttonText, buttonLink, imageUrl } = blockData;
    // TODO: Додати стилізацію та використання siteData.site_theme_accent для кнопки
    return (
        <div style={{ padding: '50px 20px', textAlign: 'center', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' }}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            {buttonText && <a href={buttonLink}><button>{buttonText}</button></a>}
        </div>
    );
};
export default HeroBlock;

// frontend/src/components/blocks/BannerBlock.jsx
import React from 'react';

const BannerBlock = ({ blockData, siteData }) => {
    const { imageUrl, link } = blockData;
    // TODO: Додати стилізацію
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <a href={link || '#'}>
                <img src={imageUrl} alt="Banner" style={{ maxWidth: '100%', height: 'auto' }} />
            </a>
        </div>
    );
};
export default BannerBlock;

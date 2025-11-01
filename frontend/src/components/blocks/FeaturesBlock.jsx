// frontend/src/components/blocks/FeaturesBlock.jsx
import React from 'react';

const FeaturesBlock = ({ blockData, siteData }) => {
    const { title, items = [] } = blockData;
    // TODO: Додати стилізацію
    return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h2>{title}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', marginTop: '20px' }}>
                {items.map((item, index) => (
                    <div key={index}>
                        <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                        <p>{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default FeaturesBlock;

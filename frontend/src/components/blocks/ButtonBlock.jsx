// frontend/src/components/blocks/ButtonBlock.jsx
import React from 'react';

const ButtonBlock = ({ blockData }) => {
    const { text, link } = blockData;
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <a href={link || '#'} className="btn-site-primary" style={{ textDecoration: 'none' }}>
                {text || 'Кнопка'}
            </a>
        </div>
    );
};
export default ButtonBlock;
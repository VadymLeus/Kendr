// frontend/src/components/blocks/TextBlock.jsx
import React from 'react';

const TextBlock = ({ blockData, siteData }) => {
    const { headerTitle, aboutText } = blockData;
    // TODO: Адаптувати стилі з SimpleBioTemplate та використати змінні теми сайту
    return (
        <div style={{ padding: '20px' }}>
            <h2>{headerTitle}</h2>
            <p>{aboutText}</p>
        </div>
    );
};
export default TextBlock;

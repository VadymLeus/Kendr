// frontend/src/components/blocks/ImageBlock.jsx
import React from 'react';
const API_URL = 'http://localhost:5000';

const ImageBlock = ({ blockData }) => {
    const { imageUrl, alt } = blockData;
    const fullUrl = imageUrl?.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <img src={fullUrl} alt={alt || ''} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
        </div>
    );
};
export default ImageBlock;
// frontend/src/components/blocks/CatalogGridBlock.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

const CatalogGridBlock = ({ blockData, siteData }) => {
    const [products, setProducts] = useState([]);
    // TODO: Завантажити товари для siteData.id, можливо, фільтруючи за blockData.category
     useEffect(() => { /* ... */ }, [siteData?.id, blockData?.category]);
     // TODO: Перенести логіку та JSX з ShopTemplate для відображення товарів
    return (
        <div style={{ padding: '20px' }}>
            <h3>{blockData.title || 'Товари'}</h3>
             {/* TODO: Відобразити сітку товарів */}
        </div>
    );
};
export default CatalogGridBlock;

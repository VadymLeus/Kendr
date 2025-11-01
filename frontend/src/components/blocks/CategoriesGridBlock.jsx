// frontend/src/components/blocks/CategoriesGridBlock.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

const CategoriesGridBlock = ({ blockData, siteData }) => {
    const [categories, setCategories] = useState([]);
    // TODO: Завантажити категорії для siteData.id
    useEffect(() => { /* ... */ }, [siteData?.id]);

    return (
        <div style={{ padding: '20px' }}>
            <h3>{blockData.title || 'Категорії'}</h3>
            {/* TODO: Відобразити сітку категорій */}
            {categories.map(cat => <div key={cat.id}>{cat.name}</div>)}
        </div>
    );
};
export default CategoriesGridBlock;

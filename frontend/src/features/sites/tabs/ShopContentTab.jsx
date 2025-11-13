// frontend/src/features/sites/tabs/ShopContentTab.jsx
import React, { useState } from 'react';
import CategoryManager from '../../../components/shop/CategoryManager';
import ProductManager from '../../../components/shop/ProductManager';

const ShopContentTab = ({ siteData }) => {
    const [activeSubTab, setActiveSubTab] = useState('products');

    const tabStyle = (isActive) => ({
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: isActive ? 'bold' : 'normal',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        borderBottom: isActive ? '3px solid var(--platform-accent)' : '3px solid transparent',
        marginBottom: '-1px',
        transition: 'all 0.2s ease'
    });

    const cardStyle = {
        background: 'var(--platform-card-bg)',
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--platform-border-color)'
    };

    const borderStyle = {
        borderBottom: '1px solid var(--platform-border-color)',
        marginBottom: '2rem',
        display: 'flex'
    };

    return (
        <div style={cardStyle}>
            <div style={borderStyle}>
                <button 
                    style={tabStyle(activeSubTab === 'products')}
                    onClick={() => setActiveSubTab('products')}
                >
                    Товари
                </button>
                <button 
                    style={tabStyle(activeSubTab === 'categories')}
                    onClick={() => setActiveSubTab('categories')}
                >
                    Категорії
                </button>
            </div>

            <div>
                {activeSubTab === 'products' && (
                    <ProductManager siteId={siteData.id} />
                )}
                {activeSubTab === 'categories' && (
                    <CategoryManager siteId={siteData.id} />
                )}
            </div>
        </div>
    );
};

export default ShopContentTab;
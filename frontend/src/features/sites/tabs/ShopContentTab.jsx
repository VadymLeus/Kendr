// frontend/src/features/sites/tabs/ShopContentTab.jsx
import React, { useState } from 'react';
import CategoryManager from '../../../components/shop/CategoryManager';
import ProductManager from '../../../components/shop/ProductManager';

const ShopContentTab = ({ siteData }) => {
    const [activeSubTab, setActiveSubTab] = useState('products');

    const containerStyle = {
        padding: '0'
    };

    const titleStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1.5rem'
    };

    const tabsContainerStyle = {
        borderBottom: '1px solid var(--platform-border-color)',
        marginBottom: '2rem',
        display: 'flex'
    };

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

    return (
        <div style={containerStyle}>
            <h3 style={titleStyle}>
                Управління контентом магазину: {siteData.title}
            </h3>

            <div style={tabsContainerStyle}>
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
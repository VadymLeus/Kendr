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
        color: isActive ? 'var(--site-accent)' : 'var(--site-text-secondary)',
        borderBottom: isActive ? '3px solid var(--site-accent)' : '3px solid transparent',
        marginBottom: '-1px',
        transition: 'all 0.2s ease'
    });

    const cardStyle = {
        background: 'var(--site-card-bg)',
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--site-border-color)'
    };

    const borderStyle = {
        borderBottom: '1px solid var(--site-border-color)',
        marginBottom: '2rem',
        display: 'flex'
    };

    return (
        <div style={cardStyle}>
            <div style={borderStyle}>
                <button 
                    style={tabStyle(activeSubTab === 'products')}
                    onClick={() => setActiveSubTab('products')}
                    onMouseEnter={(e) => {
                        if (activeSubTab !== 'products') {
                            e.target.style.color = 'var(--site-accent)';
                            e.target.style.borderBottomColor = 'var(--site-accent)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeSubTab !== 'products') {
                            e.target.style.color = 'var(--site-text-secondary)';
                            e.target.style.borderBottomColor = 'transparent';
                        }
                    }}
                >
                    Товари
                </button>
                <button 
                    style={tabStyle(activeSubTab === 'categories')}
                    onClick={() => setActiveSubTab('categories')}
                    onMouseEnter={(e) => {
                        if (activeSubTab !== 'categories') {
                            e.target.style.color = 'var(--site-accent)';
                            e.target.style.borderBottomColor = 'var(--site-accent)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeSubTab !== 'categories') {
                            e.target.style.color = 'var(--site-text-secondary)';
                            e.target.style.borderBottomColor = 'transparent';
                        }
                    }}
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
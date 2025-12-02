// frontend/src/features/sites/tabs/ShopContentTab.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryManager from '../shop/CategoryManager';
import ProductManager from '../shop/ProductManager';

const ShopContentTab = ({ siteData, onSavingChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isShopSaving, setIsShopSaving] = React.useState(false);
    
    const activeSubTab = searchParams.get('shopTab') || 'products';

    React.useEffect(() => {
        if (onSavingChange) {
            onSavingChange(isShopSaving);
        }
    }, [isShopSaving, onSavingChange]);

    const handleTabChange = (tabName) => {
        setSearchParams(prev => {
            prev.set('shopTab', tabName);
            prev.delete('productId');
            prev.delete('categoryId');
            return prev;
        });
    };

    const containerStyle = { 
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0'
    };

    const headerStyle = { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '0 16px'
    };
    
    const titleStyle = { 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        color: 'var(--platform-text-primary)', 
        margin: '0 0 4px 0'
    };
    
    const subtitleStyle = { 
        fontSize: '0.9rem', 
        color: 'var(--platform-text-secondary)', 
        margin: 0
    };

    const navStyle = {
        display: 'flex',
        background: 'var(--platform-card-bg)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid var(--platform-border-color)',
        width: 'fit-content',
        margin: '0 auto 2rem auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    };

    const tabBtnStyle = (isActive) => ({
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        background: isActive ? 'var(--platform-accent)' : 'transparent',
        color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: isActive ? '0 2px 8px rgba(var(--platform-accent-rgb), 0.3)' : 'none'
    });

    const contentCardStyle = {
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        minHeight: '600px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>Управління магазином</h2>
                    <p style={subtitleStyle}>Керування товарами та категоріями вашого інтернет-магазину</p>
                </div>
                
                {isShopSaving && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        color: 'var(--platform-accent)', 
                        fontWeight: '500', 
                        fontSize: '0.9rem' 
                    }}>
                        <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: 'var(--platform-accent)', 
                            animation: 'pulse 1.5s ease-in-out infinite' 
                        }}></div>
                        Збереження...
                    </div>
                )}
            </div>

            <div style={navStyle}>
                <button 
                    style={tabBtnStyle(activeSubTab === 'products')} 
                    onClick={() => handleTabChange('products')}
                >
                    <span style={{fontSize: '1.1rem'}}>📦</span>
                    Товари
                </button>
                <button 
                    style={tabBtnStyle(activeSubTab === 'categories')} 
                    onClick={() => handleTabChange('categories')}
                >
                    <span style={{fontSize: '1.1rem'}}>📂</span>
                    Категорії
                </button>
            </div>

            <div style={contentCardStyle}>
                {activeSubTab === 'products' && (
                    <ProductManager 
                        siteId={siteData.id} 
                        onSavingChange={setIsShopSaving}
                    />
                )}
                {activeSubTab === 'categories' && (
                    <CategoryManager 
                        siteId={siteData.id} 
                        onSavingChange={setIsShopSaving}
                    />
                )}
            </div>
            
            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default ShopContentTab;
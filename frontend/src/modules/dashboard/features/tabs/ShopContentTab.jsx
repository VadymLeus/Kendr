// frontend/src/modules/dashboard/features/tabs/ShopContentTab.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryManager from '../CategoryManager';
import ProductManager from '../ProductManager'; 
import { Button } from '../../../../shared/ui/elements/Button'; 
import { Grid, Folder } from 'lucide-react';

const ShopContentTab = ({ siteData, onSavingChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isShopSaving, setIsShopSaving] = React.useState(false);
    
    const activeSubTab = searchParams.get('shopTab') || 'products';

    React.useEffect(() => {
        if (onSavingChange) onSavingChange(isShopSaving);
    }, [isShopSaving, onSavingChange]);

    const handleTabChange = (tabName) => {
        setSearchParams(prev => {
            prev.set('shopTab', tabName);
            prev.delete('productId');
            prev.delete('categoryId');
            return prev;
        });
    };

    const styles = {
        container: {
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
            gap: '24px', 
            overflow: 'hidden',
            paddingBottom: '20px',
            boxSizing: 'border-box'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center', 
            padding: '0 4px',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '16px'
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        tabsContainer: {
            display: 'flex',
            gap: '4px',
            background: 'var(--platform-card-bg)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--platform-border-color)',
            flexShrink: 0
        },
        contentArea: {
            flex: 1,
            minHeight: 0,
            position: 'relative'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--platform-text-primary)', margin: 0}}>
                        Управління магазином
                    </h2>
                    <p style={{fontSize: '0.9rem', color: 'var(--platform-text-secondary)', margin: '4px 0 0 0'}}>
                        Управління товарами та категоріями
                    </p>
                </div>

                <div style={styles.headerRight}>
                    {isShopSaving && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-accent)', fontWeight: '500', fontSize: '0.9rem' }}>
                            <div className="spinner" style={{width: 14, height: 14, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%'}}></div>
                            Збереження...
                        </div>
                    )}

                    <div style={styles.tabsContainer}>
                        <Button 
                            variant={activeSubTab === 'products' ? 'primary' : 'ghost'} 
                            onClick={() => handleTabChange('products')}
                            icon={<Grid size={16}/>}
                            size="sm"
                        >
                            Товари
                        </Button>
                        <Button 
                            variant={activeSubTab === 'categories' ? 'primary' : 'ghost'} 
                            onClick={() => handleTabChange('categories')}
                            icon={<Folder size={16}/>}
                            size="sm"
                        >
                            Категорії
                        </Button>
                    </div>
                </div>
            </div>

            <div style={styles.contentArea}>
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
            
            <style>{`
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ShopContentTab;
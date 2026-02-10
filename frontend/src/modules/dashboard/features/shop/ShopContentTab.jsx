// frontend/src/modules/features/shop/ShopContentTab.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager'; 
import { Button } from '../../../../shared/ui/elements/Button'; 
import { Grid, Folder, Loader2 } from 'lucide-react';

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
    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden pb-5 box-border">
            <div className="flex justify-between items-center px-1 shrink-0 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) m-0">
                        Управління магазином
                    </h2>
                    <p className="text-sm text-(--platform-text-secondary) mt-1 m-0">
                        Управління товарами та категоріями
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isShopSaving && (
                        <div className="flex items-center gap-2 text-(--platform-accent) font-medium text-sm">
                            <Loader2 size={14} className="animate-spin" />
                            Збереження...
                        </div>
                    )}
                    <div className="flex gap-1 bg-(--platform-card-bg) p-1 rounded-lg border border-(--platform-border-color) shrink-0">
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
            <div className="flex-1 min-h-0 relative">
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
        </div>
    );
};

export default ShopContentTab;
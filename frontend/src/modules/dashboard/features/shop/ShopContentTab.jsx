// frontend/src/modules/features/shop/ShopContentTab.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager'; 
import { Button } from '../../../../shared/ui/elements/Button'; 
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { AuthContext } from '../../../../app/providers/AuthContext';
import apiClient from '../../../../shared/api/api';
import { Grid, Folder, Loader2, Store, Banknote } from 'lucide-react';

const ShopContentTab = ({ siteData, onSavingChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isShopSaving, setIsShopSaving] = useState(false);
    const activeSubTab = searchParams.get('shopTab') || 'products';
    const { plan } = useContext(AuthContext);
    const [limits, setLimits] = useState(null);
    const [currency, setCurrency] = useState(siteData?.currency || 'UAH');
    const CURRENCY_OPTIONS = [
        { value: 'UAH', label: 'Гривня (₴)', icon: Banknote },
        { value: 'USD', label: 'Долар ($)', icon: Banknote },
        { value: 'EUR', label: 'Євро (€)', icon: Banknote }
    ];
    useEffect(() => {
        apiClient.get('/media/limits')
            .then(res => setLimits(res.data))
            .catch(err => console.error("Помилка завантаження лімітів:", err));
    }, []);
    const isPlanAdmin = plan && String(plan).trim().toUpperCase() === 'ADMIN';
    const maxProducts = isPlanAdmin ? Infinity : (limits ? limits.maxProducts : 50);
    const maxCategories = isPlanAdmin ? Infinity : (limits ? limits.maxCategories : 20);
    useEffect(() => {
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

    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        setIsShopSaving(true);
        try {
            await apiClient.put(`/sites/${siteData.site_path}/settings`, { currency: newCurrency });
            toast.success("Валюту магазину оновлено!");
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося оновити валюту.");
            setCurrency(siteData.currency || 'UAH'); // відкат
        } finally {
            setIsShopSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden pb-5 box-border">
            <div className="flex flex-col md:flex-row justify-between items-center px-1 shrink-0 gap-4">
                <div className="hidden md:flex flex-1 items-center gap-3">
                    <div className="w-48">
                        <CustomSelect 
                            value={currency} 
                            onChange={handleCurrencyChange}
                            options={CURRENCY_OPTIONS}
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center text-center flex-1 shrink-0">
                    <h2 className="text-2xl font-semibold m-0 mb-1 text-(--platform-text-primary) flex items-center justify-center gap-2.5">
                        <Store size={28} />
                        Управління товарами
                    </h2>
                </div>
                <div className="flex items-center justify-end gap-4 flex-1 w-full md:w-auto">
                    {isShopSaving && (
                        <div className="flex items-center gap-2 text-(--platform-accent) font-medium text-sm">
                            <Loader2 size={14} className="animate-spin" />
                            Збереження...
                        </div>
                    )}
                    <div className="flex gap-1 bg-(--platform-card-bg) p-1 rounded-lg border border-(--platform-border-color) shrink-0 ml-auto md:ml-0 shadow-sm">
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
                        maxProducts={maxProducts}
                    />
                )}
                {activeSubTab === 'categories' && (
                    <CategoryManager 
                        siteId={siteData.id} 
                        onSavingChange={setIsShopSaving}
                        maxCategories={maxCategories}
                    />
                )}
            </div>
        </div>
    );
};

export default ShopContentTab;
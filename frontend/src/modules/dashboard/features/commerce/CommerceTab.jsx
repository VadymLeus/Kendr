// frontend/src/modules/dashboard/features/commerce/CommerceTab.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager'; 
import OrdersTab from './components/OrdersTab';
import CommerceSettingsTab from './components/CommerceSettingsTab';
import { AuthContext } from '../../../../app/providers/AuthContext';
import apiClient from '../../../../shared/api/api';
import { Grid, Folder, Package, Settings } from 'lucide-react';

const CommerceTab = ({ siteData, onSavingChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isCommerceSaving, setIsCommerceSaving] = useState(false);
    const activeSubTab = searchParams.get('commerceTab') || 'products';
    const { plan, user } = useContext(AuthContext);
    const [limits, setLimits] = useState(null);
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';
    useEffect(() => {
        apiClient.get('/media/limits')
            .then(res => setLimits(res.data))
            .catch(err => console.error("Помилка завантаження лімітів:", err));
    }, []);

    const isPlanAdmin = plan && String(plan).trim().toUpperCase() === 'ADMIN';
    const maxProducts = isPlanAdmin ? Infinity : (limits ? limits.maxProducts : 50);
    const maxCategories = isPlanAdmin ? Infinity : (limits ? limits.maxCategories : 20);
    useEffect(() => {
        if (onSavingChange) onSavingChange(isCommerceSaving);
    }, [isCommerceSaving, onSavingChange]);

    const handleTabChange = (tabName) => {
        setSearchParams(prev => {
            prev.set('commerceTab', tabName);
            prev.delete('productId');
            prev.delete('categoryId');
            return prev;
        });
    };

    const tabs = [
        { key: 'products', icon: <Grid />, text: 'Товари' },
        { key: 'categories', icon: <Folder />, text: 'Категорії' },
    ];

    if (!isStaff) {
        tabs.push(
            { key: 'orders', icon: <Package />, text: 'Замовлення' },
            { key: 'settings', icon: <Settings />, text: 'Налаштування' }
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden pb-5 box-border">
            <div className="commerce-header-container px-1">
                <nav className="commerce-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`commerce-tab-btn ${activeSubTab === tab.key ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.key)}
                            title={tab.text}
                        >
                            <span className="commerce-tab-icon">{tab.icon}</span>
                            <span className="commerce-tab-text">{tab.text}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-1 min-h-0 relative">
                {activeSubTab === 'products' && (
                    <ProductManager 
                        siteId={siteData.id} 
                        onSavingChange={setIsCommerceSaving}
                        maxProducts={maxProducts}
                    />
                )}
                {activeSubTab === 'categories' && (
                    <CategoryManager 
                        siteId={siteData.id} 
                        onSavingChange={setIsCommerceSaving}
                        maxCategories={maxCategories}
                    />
                )}
                {activeSubTab === 'orders' && !isStaff && (
                    <OrdersTab 
                        siteData={siteData} 
                    />
                )}
                {activeSubTab === 'settings' && !isStaff && (
                    <CommerceSettingsTab 
                        siteData={siteData} 
                        onSavingChange={setIsCommerceSaving}
                    />
                )}
            </div>
            <style>{`
                .commerce-header-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    flex-shrink: 0;
                }
                .commerce-tabs { 
                    display: flex; 
                    background: var(--platform-bg); 
                    padding: 4px; 
                    border-radius: 8px; 
                    gap: 4px; 
                    border: 1px solid var(--platform-border-color); 
                    overflow: hidden; 
                }
                .commerce-tab-btn { 
                    padding: 8px 16px; 
                    font-size: 14px; 
                    font-weight: 500; 
                    border-radius: 6px; 
                    color: var(--platform-text-secondary); 
                    border: none; 
                    background: transparent; 
                    cursor: pointer; 
                    transition: all 0.2s ease; 
                    white-space: nowrap; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 8px; 
                    min-height: 36px; 
                }
                .commerce-tab-btn:hover { 
                    color: var(--platform-text-primary); 
                    background: var(--platform-hover-bg); 
                }
                .commerce-tab-btn.active { 
                    background: var(--platform-card-bg); 
                    color: var(--platform-accent); 
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
                    font-weight: 600; 
                }
                .commerce-tab-icon { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 18px; 
                    height: 18px; 
                }
                .commerce-tab-icon svg { 
                    width: 100%; 
                    height: 100%; 
                    fill: none; 
                    stroke: currentColor; 
                    stroke-width: 2; 
                    stroke-linecap: round; 
                    stroke-linejoin: round; 
                }
                .commerce-tab-text { 
                    font-weight: 500; 
                }
                @media (max-width: 768px) { 
                    .commerce-tab-btn { padding: 6px 10px; font-size: 13px; } 
                    .commerce-tab-text { display: none; } 
                }
                @media (max-width: 600px) {
                    .commerce-tabs {
                        width: 100%;
                        justify-content: center; 
                    }
                }
                @media (max-width: 480px) { 
                    .commerce-tab-btn { padding: 4px 8px; } 
                    .commerce-tab-icon { width: 16px; height: 16px; } 
                }
            `}</style>
        </div>
    );
};

export default CommerceTab;
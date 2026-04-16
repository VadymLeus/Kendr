// frontend/src/modules/dashboard/features/commerce/CommerceTab.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager'; 
import OrdersTab from './components/OrdersTab';
import CommerceSettingsTab from './components/CommerceSettingsTab';
import { AuthContext } from '../../../../app/providers/AuthContext';
import apiClient from '../../../../shared/api/api';
import { Grid, Folder, Package, ShoppingBag, Settings } from 'lucide-react';

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

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden pb-5 box-border">
            <div className="commerce-header-container px-1">
                <div className="commerce-header-left"></div>
                <div className="commerce-header-center">
                    <h2 className="text-2xl font-semibold m-0 text-(--platform-text-primary) flex items-center justify-center gap-2.5">
                        <ShoppingBag size={28} />
                        Комерція
                    </h2>
                </div>
                <div className="commerce-header-right">
                    <nav className="editor-tabs custom-scrollbar">
                        <button
                            className={`tab-btn ${activeSubTab === 'products' ? 'active' : ''}`}
                            onClick={() => handleTabChange('products')}
                        >
                            <span className="tab-icon"><Grid size={16} /></span>
                            <span className="tab-text">Товари</span>
                        </button>
                        <button
                            className={`tab-btn ${activeSubTab === 'categories' ? 'active' : ''}`}
                            onClick={() => handleTabChange('categories')}
                        >
                            <span className="tab-icon"><Folder size={16} /></span>
                            <span className="tab-text">Категорії</span>
                        </button>
                        {!isStaff && (
                            <>
                                <button
                                    className={`tab-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('orders')}
                                >
                                    <span className="tab-icon"><Package size={16} /></span>
                                    <span className="tab-text">Замовлення</span>
                                </button>
                                <button
                                    className={`tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('settings')}
                                >
                                    <span className="tab-icon"><Settings size={16} /></span>
                                    <span className="tab-text">Налаштування</span>
                                </button>
                            </>
                        )}
                    </nav>
                </div>
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
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-shrink: 0;
                    width: 100%;
                }
                .commerce-header-left {
                    flex: 1 1 0%;
                    min-width: 0;
                }
                .commerce-header-center {
                    flex: 0 1 auto;
                    display: flex;
                    justify-content: center;
                    min-width: 0;
                }
                .commerce-header-right {
                    flex: 1 1 0%;
                    display: flex;
                    justify-content: flex-end;
                    min-width: 0;
                }
                .editor-tabs { 
                    display: flex; 
                    background: var(--platform-bg); 
                    padding: 4px; 
                    border-radius: 8px; 
                    gap: 4px; 
                    border: 1px solid var(--platform-border-color); 
                    overflow-x: auto;
                    max-width: 100%;
                }
                .tab-btn { 
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
                .tab-btn:hover { 
                    color: var(--platform-text-primary); 
                    background: var(--platform-hover-bg); 
                }
                .tab-btn.active { 
                    background: var(--platform-card-bg); 
                    color: var(--platform-accent); 
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
                    font-weight: 600; 
                }
                .tab-icon { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 18px; 
                    height: 18px; 
                }
                .tab-icon svg { 
                    width: 100%; 
                    height: 100%; 
                    fill: none; 
                    stroke: currentColor; 
                    stroke-width: 2; 
                    stroke-linecap: round; 
                    stroke-linejoin: round; 
                }
                .tab-text { 
                    font-weight: 500; 
                }
                @media (max-width: 1150px) {
                    .commerce-header-container {
                        flex-direction: column;
                        gap: 16px;
                    }
                    .commerce-header-left {
                        display: none;
                    }
                    .commerce-header-right {
                        width: 100%;
                        justify-content: center;
                    }
                    .editor-tabs {
                        width: max-content;
                        justify-content: center;
                    }
                }

                @media (max-width: 768px) { 
                    .tab-btn { padding: 6px 10px; font-size: 13px; } 
                }

                @media (max-width: 600px) {
                    .commerce-header-container { gap: 12px; }
                    .editor-tabs {
                        width: 100%;
                        justify-content: flex-start;
                    }
                }

                @media (max-width: 480px) { 
                    .tab-btn { padding: 4px 8px; font-size: 12px; } 
                    .tab-icon { width: 16px; height: 16px; } 
                }
            `}</style>
        </div>
    );
};

export default CommerceTab;
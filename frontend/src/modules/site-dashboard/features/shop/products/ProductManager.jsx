// frontend/src/modules/site-dashboard/features/shop/products/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from './useProducts';
import { ProductTable } from './ProductTable';
import ProductEditorPanel from './ProductEditorPanel';
import { IconChevronLeft, IconChevronRight } from '../../../../../common/components/ui/Icons';

const ProductManager = ({ siteId, onSavingChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        products, categories, loading, 
        filters, setFilters, filteredProducts,
        fetchData, handleDelete, API_URL
    } = useProducts(siteId);
    
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [activeProduct, setActiveProduct] = useState(null); 

    useEffect(() => {
        const prodIdFromUrl = searchParams.get('productId');
        if (!loading && products.length > 0) {
            if (prodIdFromUrl === 'new') {
                setActiveProduct(null);
                setIsPanelOpen(true);
            } else if (prodIdFromUrl) {
                const productToEdit = products.find(p => p.id.toString() === prodIdFromUrl);
                if (productToEdit) {
                    setActiveProduct(productToEdit);
                    setIsPanelOpen(true);
                }
            }
        }
    }, [loading, products, searchParams]);

    const handleProductSelect = useCallback((product) => {
        if (activeProduct && activeProduct.id === product.id) {
            setActiveProduct(null);
            setSearchParams(prev => { prev.delete('productId'); return prev; });
        } else {
            setActiveProduct(product);
            setIsPanelOpen(true); 
            setSearchParams(prev => { prev.set('productId', product.id); return prev; });
        }
    }, [activeProduct, setSearchParams]);

    const handleCreateNew = useCallback(() => {
        setActiveProduct(null);
        setIsPanelOpen(true);
        setSearchParams(prev => { prev.set('productId', 'new'); return prev; });
    }, [setSearchParams]);

    const handleSuccess = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const togglePanel = () => setIsPanelOpen(!isPanelOpen);

    const styles = {
        container: { 
            display: 'flex', 
            height: '100%', 
            overflow: 'hidden',
            position: 'relative',
            gap: '12px'
        },
        tableArea: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
        },
        dividerOverlay: {
            position: 'absolute',
            top: '50%',
            right: isPanelOpen ? '456px' : '0',
            transform: 'translateY(-50%)',
            zIndex: 50,
            transition: 'right 0.3s ease'
        },
        collapseBtn: {
            width: '24px',
            height: '48px',
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--platform-text-secondary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
        },
        panelArea: {
            width: isPanelOpen ? '450px' : '0px',
            minWidth: isPanelOpen ? '450px' : '0px',
            opacity: isPanelOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'width 0.3s ease, opacity 0.2s ease, min-width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--platform-accent);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: var(--platform-accent-hover);
                }
                
                .collapse-btn:hover {
                    color: var(--platform-accent) !important;
                    border-color: var(--platform-accent) !important;
                }
            `}</style>

            <div style={styles.tableArea}>
                <ProductTable
                    products={products}
                    categories={categories}
                    filteredProducts={filteredProducts}
                    loading={loading}
                    filters={filters}
                    setFilters={setFilters}
                    onSelect={handleProductSelect}
                    onCreate={handleCreateNew}
                    onDelete={(id) => handleDelete(id, () => setActiveProduct(null))}
                    API_URL={API_URL}
                    selectedId={activeProduct?.id}
                    style={{ 
                        borderRadius: '16px', 
                        border: '1px solid var(--platform-border-color)' 
                    }}
                />
            </div>

            <div style={styles.dividerOverlay}>
                <button 
                    style={styles.collapseBtn} 
                    className="collapse-btn"
                    onClick={togglePanel}
                    title={isPanelOpen ? "Згорнути панель" : "Розгорнути панель"}
                >
                    {isPanelOpen ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
                </button>
            </div>

            <div style={styles.panelArea}>
                <ProductEditorPanel
                    productToEdit={activeProduct}
                    siteId={siteId}
                    categories={categories}
                    onSuccess={handleSuccess}
                    onClose={() => setIsPanelOpen(false)}
                    onSavingChange={onSavingChange}
                    style={{ 
                        borderRadius: '16px', 
                        border: '1px solid var(--platform-border-color)' 
                    }}
                />
            </div>
        </div>
    );
};

export default ProductManager;
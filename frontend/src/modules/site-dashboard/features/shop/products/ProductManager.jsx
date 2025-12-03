// frontend/src/modules/site-dashboard/features/shop/products/ProductManager.jsx

import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from './useProducts';
import { ProductTable } from './ProductTable';

const ProductFormModal = lazy(() => import('./ProductFormModal'));

const ProductManager = ({ siteId, onSavingChange }) => {
    const [searchParams] = useSearchParams();
    const { 
        products, 
        categories, 
        loading, 
        filters, 
        setFilters,
        filteredProducts,
        fetchData,
        handleDelete,
        API_URL
    } = useProducts(siteId);
    
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        const prodIdFromUrl = searchParams.get('productId');
        if (!loading && prodIdFromUrl && products.length > 0) {
            const productToEdit = products.find(p => p.id.toString() === prodIdFromUrl);
            if (productToEdit && (!editingProduct || editingProduct.id !== productToEdit.id)) {
                setEditingProduct(productToEdit);
            }
        }
    }, [loading, products, searchParams]);

    const handleEdit = useCallback((product) => {
        setEditingProduct(product);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingProduct(null);
    }, []);

    const handleDeleteSuccess = useCallback(() => {
        if (editingProduct && products.find(p => p.id === editingProduct.id) === undefined) {
            setEditingProduct(null);
        }
    }, [editingProduct, products]);

    const containerStyle = { 
        display: 'flex', 
        gap: '20px', 
        height: 'calc(100vh - 140px)', 
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const productsAreaStyle = {
        flex: 1,
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        minWidth: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const formAreaFallbackStyle = { 
        flex: '0 0 450px', 
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%'
    };

    return (
        <div style={containerStyle}>
            <Suspense fallback={
                <div style={formAreaFallbackStyle}>
                    <div>Завантаження форми...</div>
                </div>
            }>
                <ProductFormModal
                    productToEdit={editingProduct}
                    siteId={siteId}
                    categories={categories}
                    onSuccess={fetchData}
                    onClose={handleCancelEdit}
                    onSavingChange={onSavingChange}
                />
            </Suspense>

            <div style={productsAreaStyle}>
                <ProductTable
                    products={products}
                    categories={categories}
                    filteredProducts={filteredProducts}
                    loading={loading}
                    filters={filters}
                    setFilters={setFilters}
                    onEdit={handleEdit}
                    onDelete={(id) => handleDelete(id, handleDeleteSuccess)}
                    API_URL={API_URL}
                />
            </div>
        </div>
    );
};

export default ProductManager;
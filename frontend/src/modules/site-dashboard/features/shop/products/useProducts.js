// frontend/src/modules/site-dashboard/features/shop/products/useProducts.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../../../../common/services/api';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

export const useProducts = (siteId) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category: 'all' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                apiClient.get(`/products/site/${siteId}`),
                apiClient.get(`/categories/site/${siteId}`)
            ]);
            
            const productsData = (pRes.data || []).map(p => ({
                ...p,
                variants: Array.isArray(p.variants) ? p.variants : 
                         (typeof p.variants === 'string' ? JSON.parse(p.variants) : []),
                image_gallery: Array.isArray(p.image_gallery) ? p.image_gallery : 
                             (typeof p.image_gallery === 'string' ? JSON.parse(p.image_gallery) : 
                             (p.image_url ? [p.image_url] : []))
            }));
            setProducts(productsData);
            setCategories(cRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження');
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = filters.search === '' || 
                product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                product.description?.toLowerCase().includes(filters.search.toLowerCase());
            const matchesCategory = filters.category === 'all' || product.category_id === parseInt(filters.category);
            return matchesSearch && matchesCategory;
        });
    }, [products, filters.search, filters.category]);

    const handleDelete = useCallback(async (id, onSuccess) => {
        try {
            await apiClient.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
            if (onSuccess) onSuccess();
            toast.success('Товар видалено');
        } catch (err) {
            toast.error('Помилка видалення');
        }
    }, []);

    return { 
        products, 
        categories, 
        loading, 
        filters, 
        setFilters,
        filteredProducts,
        fetchData,
        handleDelete,
        API_URL
    };
};
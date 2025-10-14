// frontend/src/features/sites/tabs/ShopContentTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const API_URL = 'http://localhost:5000';

const ShopContentTab = ({ siteData }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ініціалізація товарів при отриманні siteData
    useEffect(() => {
        if (siteData?.products) {
            setProducts(siteData.products.map(p => ({ 
                ...p, 
                imageFile: null, 
                imagePreview: null 
            })) || []);
        }
    }, [siteData]);

    // Завантаження категорій
    useEffect(() => {
        const fetchCategories = async () => {
            if (!siteData?.id) return;
            
            try {
                setLoading(true);
                const categoryResponse = await apiClient.get(`/categories/site/${siteData.id}`);
                setCategories(categoryResponse.data);
            } catch (err) {
                setError('Не вдалося завантажити категорії.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [siteData?.id]);

    // --- КЕРУВАННЯ КАТЕГОРІЯМИ ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim() || !siteData?.id) return;
        
        try {
            const response = await apiClient.post('/categories', { 
                siteId: siteData.id, 
                name: newCategoryName 
            });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
        } catch (err) {
            alert(err.response?.data?.message || 'Помилка при створенні категорії.');
        }
    };
    
    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Видалення категорії також прибере її з усіх товарів. Продовжити?")) {
            try {
                await apiClient.delete(`/categories/${categoryId}`);
                setCategories(categories.filter(c => c.id !== categoryId));
                // Оновлюємо товари, щоб прибрати в них видалену категорію
                setProducts(products.map(p => 
                    p.category_id === categoryId ? { ...p, category_id: null } : p
                ));
            } catch (err) {
                alert(err.response?.data?.message || 'Помилка при видаленні категорії.');
            }
        }
    };

    // --- КЕРУВАННЯ ТОВАРАМИ ---
    const handleProductChange = (index, field, value) => {
        const newProducts = [...products];
        if (field === 'category_id') {
            newProducts[index][field] = value ? parseInt(value, 10) : null;
        } else {
            newProducts[index][field] = value;
        }
        setProducts(newProducts);
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const newProducts = [...products];
        newProducts[index].imageFile = file;
        newProducts[index].imagePreview = URL.createObjectURL(file);
        setProducts(newProducts);
    };
    
    const handleSaveProduct = async (product, index) => {
        if (!siteData?.id) return;

        const formData = new FormData();
        formData.append('site_id', siteData.id);
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        
        if (product.category_id) {
            formData.append('category_id', product.category_id);
        }

        if (product.imageFile) {
            formData.append('productImage', product.imageFile);
        }

        try {
            if (product.id) {
                await apiClient.put(`/products/${product.id}`, formData);
            } else {
                const { data: newProduct } = await apiClient.post('/products', formData);
                const newProducts = [...products];
                newProducts[index] = { ...newProduct, imageFile: null, imagePreview: null };
                setProducts(newProducts);
            }
            alert('Товар збережено!');
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка під час збереження товару.');
        }
    };

    const addProduct = () => {
        setProducts([{ 
            name: '', 
            description: '', 
            price: '0.00', 
            image_url: '', 
            imageFile: null, 
            imagePreview: null, 
            category_id: null 
        }, ...products]);
    };

    const removeProduct = async (productId, index) => {
        if (!productId) {
            setProducts(products.filter((_, i) => i !== index));
            return;
        }
        
        if (window.confirm("Ви впевнені, що хочете видалити цей товар?")) {
            try {
                await apiClient.delete(`/products/${productId}`);
                setProducts(products.filter(p => p.id !== productId));
                alert('Товар видалено.');
            } catch (err) {
                setError(err.response?.data?.message || 'Помилка під час видалення товару.');
            }
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <div>
            <h3>Управління товарами та категоріями</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4>Категорії</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {categories.map(cat => (
                        <span key={cat.id} style={{ background: '#eee', padding: '5px 10px', borderRadius: '15px' }}>
                            {cat.name}
                            <button 
                                onClick={() => handleDeleteCategory(cat.id)} 
                                style={{ marginLeft: '5px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Нова категорія"
                        style={{ boxSizing: 'border-box' }}
                    />
                    <button type="submit">Додати</button>
                </form>
            </div>

            <button onClick={addProduct} style={{ marginBottom: '1rem' }}>
                + Додати новий товар
            </button>
            
            {products.map((product, index) => (
                <div key={product.id || `new-${index}`} style={{ 
                    border: '1px solid #ddd', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    borderRadius: '8px'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div>
                            <img 
                                src={product.imagePreview || 
                                     (product.image_url ? 
                                         `${API_URL}${product.image_url}` : 
                                         'https://placehold.co/600x400/EEE/31343C?text=Немає+фото'
                                     )} 
                                alt="прев'ю" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <input 
                                type="file" 
                                onChange={(e) => handleFileChange(e, index)} 
                                style={{ marginTop: '0.5rem' }} 
                            />
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input 
                                type="text" 
                                placeholder="Назва товару" 
                                value={product.name} 
                                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            />
                            
                            <select
                                value={product.category_id || ''}
                                onChange={(e) => handleProductChange(index, 'category_id', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            >
                                <option value="">Без категорії</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            
                            <textarea 
                                placeholder="Опис" 
                                value={product.description} 
                                onChange={(e) => handleProductChange(index, 'description', e.target.value)} 
                                rows={3}
                                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            ></textarea>
                            
                            <input 
                                type="number" 
                                placeholder="Ціна" 
                                value={product.price} 
                                onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            />
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                <button onClick={() => handleSaveProduct(product, index)}>
                                    {product.id ? 'Оновити' : 'Створити'}
                                </button>
                                <button onClick={() => removeProduct(product.id, index)}>
                                    Видалити
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShopContentTab;
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

    useEffect(() => {
        if (siteData?.products) {
            setProducts(siteData.products.map(p => ({ 
                ...p, 
                imageFile: null, 
                imagePreview: null 
            })) || []);
        }
    }, [siteData]);

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
                setProducts(products.map(p => 
                    p.category_id === categoryId ? { ...p, category_id: null } : p
                ));
            } catch (err) {
                alert(err.response?.data?.message || 'Помилка при видаленні категорії.');
            }
        }
    };

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

        if (product.stock_quantity !== null && product.stock_quantity !== '') {
            formData.append('stock_quantity', product.stock_quantity);
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
            category_id: null,
            stock_quantity: null
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

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '4px',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        boxSizing: 'border-box'
    };

    const productCardStyle = {
        border: '1px solid var(--platform-border-color)',
        padding: '1.5rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        background: 'var(--platform-card-bg)'
    };

    const categoryTagStyle = {
        background: 'var(--platform-bg)',
        padding: '0.5rem 1rem',
        borderRadius: '15px',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Завантаження...</div>;

    return (
        <div>
            <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>Управління товарами та категоріями</h3>
            {error && (
                <p style={{ 
                    color: 'var(--platform-danger)', 
                    background: '#fff2f0',
                    padding: '1rem',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </p>
            )}
            
            <div className="card" style={{marginBottom: '2rem'}}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Категорії</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {categories.map(cat => (
                        <span key={cat.id} style={categoryTagStyle}>
                            {cat.name}
                            <button 
                                onClick={() => handleDeleteCategory(cat.id)} 
                                style={{ 
                                    color: 'var(--platform-danger)', 
                                    border: 'none', 
                                    background: 'none', 
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
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
                        style={inputStyle}
                    />
                    <button type="submit" className="btn btn-primary">Додати</button>
                </form>
            </div>

            <button onClick={addProduct} className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
                + Додати новий товар
            </button>
            
            {products.map((product, index) => (
                <div key={product.id || `new-${index}`} style={productCardStyle}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div>
                            <img 
                                src={product.imagePreview || 
                                     (product.image_url ? 
                                         `${API_URL}${product.image_url}` : 
                                         'https://placehold.co/600x400/EEE/31343C?text=Немає+фото'
                                     )} 
                                alt="прев'ю" 
                                style={{ 
                                    width: '150px', 
                                    height: '150px', 
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid var(--platform-border-color)'
                                }}
                            />
                            <input 
                                type="file" 
                                onChange={(e) => handleFileChange(e, index)} 
                                style={{ marginTop: '0.5rem' }} 
                            />
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Назва товару" 
                                value={product.name} 
                                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                style={inputStyle}
                            />
                            
                            <select
                                value={product.category_id || ''}
                                onChange={(e) => handleProductChange(index, 'category_id', e.target.value)}
                                style={inputStyle}
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
                                style={inputStyle}
                            ></textarea>
                            
                            <input 
                                type="number" 
                                placeholder="Ціна" 
                                value={product.price} 
                                onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                style={inputStyle}
                            />
                            
                            <input 
                                type="number" 
                                placeholder="Кількість на складі" 
                                value={product.stock_quantity || ''} 
                                onChange={(e) => handleProductChange(index, 'stock_quantity', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                min="0"
                                style={inputStyle}
                            />
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button 
                                    onClick={() => handleSaveProduct(product, index)} 
                                    className="btn btn-primary"
                                >
                                    {product.id ? 'Оновити' : 'Створити'}
                                </button>
                                <button 
                                    onClick={() => removeProduct(product.id, index)} 
                                    className="btn btn-danger"
                                >
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
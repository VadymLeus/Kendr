// frontend/src/templates/Shop/EditShopPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const EditShopPage = () => {
    const { site_path } = useParams();
    const navigate = useNavigate();
    const [siteId, setSiteId] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Стан для категорій
    const [newCategoryName, setNewCategoryName] = useState(''); // Для поля вводу нової категорії
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSiteData = useCallback(async () => {
        try {
            setLoading(true);
            const siteResponse = await apiClient.get(`/sites/${site_path}`);
            const { id, products: initialProducts } = siteResponse.data;
            setSiteId(id);
            setProducts(initialProducts.map(p => ({ ...p, imageFile: null, imagePreview: null })) || []);

            // Завантажуємо категорії для цього сайту
            const categoryResponse = await apiClient.get(`/categories/site/${id}`);
            setCategories(categoryResponse.data);

        } catch (err) {
            setError('Не вдалося завантажити дані сайту для редагування.');
        } finally {
            setLoading(false);
        }
    }, [site_path]);

    useEffect(() => {
        fetchSiteData();
    }, [fetchSiteData]);
    
    // --- КЕРУВАННЯ КАТЕГОРІЯМИ ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const response = await apiClient.post('/categories', { siteId, name: newCategoryName });
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
                setProducts(products.map(p => p.category_id === categoryId ? { ...p, category_id: null } : p));
            } catch (err) {
                alert(err.response?.data?.message || 'Помилка при видаленні категорії.');
            }
        }
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...products];
        // Для category_id перетворюємо рядок із select на число або null
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
        const formData = new FormData();
        formData.append('site_id', siteId);
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        // Додаємо ID категорії до FormData
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
            fetchSiteData();
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка під час збереження товару.');
        }
    };

    const addProduct = () => {
        setProducts([{ name: '', description: '', price: '0.00', image_url: '', imageFile: null, imagePreview: null, category_id: null }, ...products]);
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

    if (loading) return <div>Завантаження редактора...</div>;
    
    return (
        <div>
            <h2>Редагування магазину: {site_path}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {/* БЛОК КЕРУВАННЯ КАТЕГОРІЯМИ */}
            <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '2rem' }}>
                <h3>Категорії</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {categories.map(cat => (
                        <span key={cat.id} style={{ background: '#eee', padding: '5px 10px', borderRadius: '15px' }}>
                            {cat.name}
                            <button onClick={() => handleDeleteCategory(cat.id)} style={{ marginLeft: '5px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                        </span>
                    ))}
                </div>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Нова категорія"
                    />
                    <button type="submit">Додати</button>
                </form>
            </div>

            <button onClick={addProduct}>+ Додати новий товар</button>
            
            {products.map((product, index) => (
                <div key={product.id || `new-${index}`}>
                    <div>
                        <img 
                            src={product.imagePreview || (product.image_url ? `${API_URL}${product.image_url}` : 'https://placehold.co/600x400/EEE/31343C?text=Немає+фото')} 
                            alt="прев'ю" 
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                        <input type="file" onChange={(e) => handleFileChange(e, index)} style={{ marginTop: '0.5rem' }} />
                    </div>

                    <div>
                        <input type="text" placeholder="Назва товару" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} />
                        
                        <select
                            value={product.category_id || ''}
                            onChange={(e) => handleProductChange(index, 'category_id', e.target.value)}
                        >
                            <option value="">Без категорії</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        
                        <textarea placeholder="Опис" value={product.description} onChange={(e) => handleProductChange(index, 'description', e.target.value)} rows={3}></textarea>
                        <input type="number" placeholder="Ціна" value={product.price} onChange={(e) => handleProductChange(index, 'price', e.target.value)} />
                        
                        <div>
                            <button onClick={() => handleSaveProduct(product, index)}>{product.id ? 'Оновити' : 'Створити'}</button>
                            <button onClick={() => removeProduct(product.id, index)}>Видалити</button>
                        </div>
                    </div>
                </div>
            ))}
            <hr />
            <button onClick={() => navigate(`/site/${site_path}`)}>Завершити редагування</button>
        </div>
    );
};

export default EditShopPage;
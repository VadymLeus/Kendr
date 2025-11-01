// frontend/src/components/shop/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const ProductManager = ({ siteId }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const getInitialFormState = () => ({
        id: null, 
        name: '', 
        description: '', 
        price: 0, 
        stock_quantity: 1,
        category_id: null,
        imageFile: null,
        imagePreview: ''
    });

    const [currentProduct, setCurrentProduct] = useState(getInitialFormState());

    const fetchData = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                apiClient.get(`/products/site/${siteId}`),
                apiClient.get(`/categories/site/${siteId}`)
            ]);
            
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

        } catch (error) {
            console.error('Помилка завантаження товарів або категорій:', error);
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        
        let val = value;
        if (type === 'number') {
            val = parseFloat(value) || 0;
        }
        if (name === 'category_id' && (value === "null" || value === "")) {
            val = null;
        }

        setCurrentProduct(prev => ({ 
            ...prev, 
            [name]: val
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentProduct(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentProduct.name || currentProduct.price <= 0) {
            alert("Назва товару та ціна (більше 0) обов'язкові!");
            return;
        }

        const formData = new FormData();
        formData.append('site_id', siteId);
        formData.append('name', currentProduct.name);
        formData.append('description', currentProduct.description);
        formData.append('price', currentProduct.price);
        formData.append('stock_quantity', currentProduct.stock_quantity);
        
        if (currentProduct.category_id) {
            formData.append('category_id', currentProduct.category_id);
        }
        
        if (currentProduct.imageFile) {
            formData.append('productImage', currentProduct.imageFile);
        }

        try {
            if (isEditing) {
                await apiClient.put(`/products/${currentProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await apiClient.post(`/products`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            resetForm();
            fetchData();

        } catch (error) {
            console.error('Помилка збереження товару:', error.response?.data?.message || error.message);
            alert(`Помилка збереження: ${error.response?.data?.message || 'Невідома помилка'}`);
        }
    };

    const handleEdit = (product) => {
        const imageUrl = (Array.isArray(product.image_gallery) && product.image_gallery.length > 0)
            ? product.image_gallery[0]
            : '';

        setCurrentProduct({ 
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock_quantity: product.stock_quantity || 0,
            category_id: product.category_id,
            imageFile: null,
            imagePreview: imageUrl ? `${API_URL}${imageUrl}` : ''
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей товар?')) return;
        try {
            await apiClient.delete(`/products/${productId}`);
            fetchData();
        } catch (error) {
            console.error('Помилка видалення товару:', error);
            alert(`Помилка видалення: ${error.response?.data?.message || 'Невідома помилка'}`);
        }
    };

    const resetForm = () => {
        setCurrentProduct(getInitialFormState());
        setIsEditing(false);
        const fileInput = document.getElementById('productImageUpload');
        if (fileInput) fileInput.value = null;
    };

    const getProductImageUrl = (gallery) => {
        if (Array.isArray(gallery) && gallery.length > 0) {
            return `${API_URL}${gallery[0]}`;
        }
        return 'https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото';
    };

    if (loading) return <div>Завантаження товарів та категорій...</div>;

    return (
        <div className="site-products-tab">
            
            <div className="card" style={{ marginBottom: '30px' }}>
                <h4>{isEditing ? `Редагування: ${currentProduct.name}` : 'Додавання нового товару'}</h4>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Назва товару:</label>
                        <input type="text" name="name" value={currentProduct.name} onChange={handleFormChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Опис:</label>
                        <textarea name="description" value={currentProduct.description} onChange={handleFormChange} rows="3" />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>Ціна (грн.):</label>
                            <input type="number" name="price" value={currentProduct.price} onChange={handleFormChange} required min="0.01" step="0.01" />
                        </div>
                        <div className="form-group">
                            <label>Кількість на складі:</label>
                            <input type="number" name="stock_quantity" value={currentProduct.stock_quantity} onChange={handleFormChange} required min="0" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Категорія:</label>
                        <select name="category_id" value={currentProduct.category_id || "null"} onChange={handleFormChange}>
                            <option value="null">Без категорії</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Зображення:</label>
                        <input 
                            type="file" 
                            id="productImageUpload" 
                            name="productImage" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                        />
                        {(currentProduct.imagePreview) && (
                            <img 
                                src={currentProduct.imagePreview} 
                                alt="Прев'ю" 
                                style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px', borderRadius: '4px' }} 
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/AAAAAA/FFFFFF?text=Немає+Фото" }} 
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Скасувати редагування
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Зберегти зміни' : 'Додати товар'}
                        </button>
                    </div>
                </form>
            </div>

            <h4>Поточні товари ({products.length})</h4>
            {products.length === 0 ? (
                <p>На цьому сайті поки немає товарів.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {products.map(product => (
                        <div key={product.id} className="card" style={{ padding: '15px', display: 'flex', flexDirection: 'column' }}>
                            <img 
                                src={getProductImageUrl(product.image_gallery)} 
                                alt={product.name} 
                                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото" }}
                            />
                            <h5 style={{ margin: '0 0 5px 0' }}>{product.name}</h5>
                            <p style={{ margin: '0 0 5px 0', fontSize: '1.1em', fontWeight: 'bold' }} className="text-accent">
                                {product.price} грн.
                            </p>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.9em' }} className={product.stock_quantity > 0 ? 'text-success' : 'text-danger'}>
                                На складі: {product.stock_quantity} шт.
                            </p>
                            <small style={{ color: 'var(--platform-text-secondary)', marginBottom: '10px', flexGrow: 1 }}>
                                Категорія: {categories.find(c => c.id === product.category_id)?.name || 'Не вказано'}
                            </small>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                <button onClick={() => handleEdit(product)} className="btn btn-secondary" style={{ flexGrow: 1 }} title="Редагувати">
                                    ✏️
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="btn btn-danger" title="Видалити">
                                    ❌
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductManager;
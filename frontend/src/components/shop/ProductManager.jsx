// frontend/src/components/shop/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';
import ImageInput from '../media/ImageInput';

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
        image_url: ''
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
        if (type === 'number') { val = parseFloat(value) || 0; }
        if (name === 'category_id' && (value === "null" || value === "")) { val = null; }

        setCurrentProduct(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (newUrl) => {
        const relativeUrl = newUrl.replace(API_URL, '');
        setCurrentProduct(prev => ({
            ...prev,
            image_url: relativeUrl
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentProduct.name || currentProduct.price <= 0) {
            alert("Назва товару та ціна (більше 0) обов'язкові!");
            return;
        }

        const productData = {
            site_id: siteId,
            name: currentProduct.name,
            description: currentProduct.description,
            price: currentProduct.price,
            stock_quantity: currentProduct.stock_quantity,
            category_id: currentProduct.category_id || null,
            image_url: currentProduct.image_url || null
        };

        try {
            if (isEditing) {
                await apiClient.put(`/products/${currentProduct.id}`, productData);
            } else {
                await apiClient.post(`/products`, productData);
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
            image_url: imageUrl
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
    };

    const getProductImageUrl = (gallery) => {
        if (Array.isArray(gallery) && gallery.length > 0) {
            return `${API_URL}${gallery[0]}`;
        }
        return 'https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото';
    };

    // Стилі для використання змінних сайту
    const cardStyle = {
        background: 'var(--site-card-bg)',
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--site-border-color)',
        marginBottom: '30px'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--site-border-color)',
        borderRadius: '4px',
        fontSize: '1rem',
        background: 'var(--site-card-bg)',
        color: 'var(--site-text-primary)'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--site-text-primary)',
        fontWeight: '500'
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            color: 'var(--site-text-secondary)'
        }}>
            Завантаження...
        </div>
    );

    return (
        <div className="site-products-tab">
            
            <div style={cardStyle}>
                <h4 style={{ 
                    color: 'var(--site-text-primary)', 
                    marginBottom: '1.5rem',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                }}>
                    {isEditing ? `Редагування: ${currentProduct.name}` : 'Додавання нового товару'}
                </h4>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Головне зображення:</label>
                            <ImageInput 
                                value={currentProduct.image_url ? `${API_URL}${currentProduct.image_url}` : ''} 
                                onChange={handleImageChange} 
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Назва товару:</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={currentProduct.name} 
                                    onChange={handleFormChange} 
                                    required 
                                    style={inputStyle}
                                    placeholder="Введіть назву товару"
                                />
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Опис:</label>
                                <textarea 
                                    name="description" 
                                    value={currentProduct.description} 
                                    onChange={handleFormChange} 
                                    rows="3" 
                                    style={{
                                        ...inputStyle,
                                        resize: 'vertical',
                                        minHeight: '80px'
                                    }}
                                    placeholder="Опишіть товар (не обов'язково)"
                                />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Ціна (грн.):</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={currentProduct.price} 
                                        onChange={handleFormChange} 
                                        required 
                                        min="0.01" 
                                        step="0.01" 
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Кількість на складі:</label>
                                    <input 
                                        type="number" 
                                        name="stock_quantity" 
                                        value={currentProduct.stock_quantity} 
                                        onChange={handleFormChange} 
                                        required 
                                        min="0" 
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Категорія:</label>
                                <select 
                                    name="category_id" 
                                    value={currentProduct.category_id || "null"} 
                                    onChange={handleFormChange}
                                    style={inputStyle}
                                >
                                    <option value="null">Без категорії</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '10px', 
                        marginTop: '20px', 
                        /* ВИПРАВЛЕНО: */
                        borderTop: '1px solid var(--site-border-color)', 
                        paddingTop: '20px' 
                    }}>
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--site-border-color)',
                                    borderRadius: '4px',
                                    background: 'var(--site-card-bg)',
                                    color: 'var(--site-text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = 'var(--site-accent)';
                                    e.target.style.color = 'var(--site-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'var(--site-border-color)';
                                    e.target.style.color = 'var(--site-text-primary)';
                                }}
                            >
                                Скасувати редагування
                            </button>
                        )}
                        <button 
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'var(--site-accent)',
                                color: 'var(--site-accent-text)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--site-accent-hover)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--site-accent)'}
                        >
                            {isEditing ? 'Зберегти зміни' : 'Додати товар'}
                        </button>
                    </div>
                </form>
            </div>

            <h4 style={{ 
                color: 'var(--site-text-primary)',
                marginBottom: '1rem',
                fontSize: '1.25rem',
                fontWeight: '600'
            }}>
                Поточні товари ({products.length})
            </h4>
            
            {products.length === 0 ? (
                <p style={{ 
                    color: 'var(--site-text-secondary)',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    На цьому сайті поки немає товарів.
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {products.map(product => (
                        <div 
                            key={product.id} 
                            style={{ 
                                ...cardStyle,
                                padding: '0',
                                display: 'flex',
                                flexDirection: 'column',
                                marginBottom: 0
                            }}
                        >
                            <img 
                                src={getProductImageUrl(product.image_gallery)} 
                                alt={product.name} 
                                style={{ 
                                    width: '100%', 
                                    height: '200px', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px 8px 0 0' 
                                }} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото" 
                                }}
                            />
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <h5 style={{ 
                                    margin: '0 0 5px 0',
                                    color: 'var(--site-text-primary)',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}>
                                    {product.name}
                                </h5>
                                
                                <p style={{ 
                                    margin: '0 0 5px 0', 
                                    fontSize: '1.1em', 
                                    fontWeight: 'bold',
                                    color: 'var(--site-accent)'
                                }}>
                                    {product.price} грн.
                                </p>
                                
                                <p style={{ 
                                    margin: '0 0 10px 0', 
                                    fontSize: '0.9em',
                                    color: product.stock_quantity > 0 ? 'var(--site-success)' : 'var(--site-danger)'
                                }}>
                                    На складі: {product.stock_quantity} шт.
                                </p>
                                
                                <small style={{ 
                                    marginBottom: '10px', 
                                    flexGrow: 1,
                                    color: 'var(--site-text-secondary)'
                                }}>
                                    Категорія: {categories.find(c => c.id === product.category_id)?.name || 'Не вказано'}
                                </small>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                    <button 
                                        onClick={() => handleEdit(product)}
                                        style={{
                                            flexGrow: 1,
                                            padding: '8px 16px',
                                            border: '1px solid var(--site-border-color)',
                                            borderRadius: '4px',
                                            background: 'var(--site-card-bg)',
                                            color: 'var(--site-text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = 'var(--site-accent)';
                                            e.target.style.color = 'var(--site-accent)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = 'var(--site-border-color)';
                                            e.target.style.color = 'var(--site-text-primary)';
                                        }}
                                        title="Редагувати"
                                    >
                                        ✏️ Редагувати
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product.id)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: 'var(--site-danger)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--site-danger-hover, #c53030)'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--site-danger)'}
                                        title="Видалити"
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductManager;
// frontend/src/features/sites/shop/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../services/api';
import ImageInput from '../../media/ImageInput';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';

const API_URL = 'http://localhost:5000';

const ProductManager = ({ siteId }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const { confirm } = useConfirm();
    
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
            console.error('Помилка завантаження:', error);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        let val = value;
        if (type === 'number') { val = parseFloat(value) || 0; }
        if (name === 'category_id' && (value === "null" || value === "")) { val = null; }
        setCurrentProduct(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (newUrl) => {
        const relativeUrl = newUrl.replace(API_URL, '');
        setCurrentProduct(prev => ({ ...prev, image_url: relativeUrl }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentProduct.name || currentProduct.price <= 0) {
            toast.warning("Назва товару та ціна (більше 0) обов'язкові!");
            return;
        }

        const productData = { ...currentProduct, site_id: siteId };

        try {
            if (isEditing) {
                await apiClient.put(`/products/${currentProduct.id}`, productData);
                toast.success('Товар оновлено');
            } else {
                await apiClient.post(`/products`, productData);
                toast.success('Товар створено');
            }
            resetForm();
            fetchData();
        } catch (error) {
        }
    };

    const handleEdit = (product) => {
        const imageUrl = (Array.isArray(product.image_gallery) && product.image_gallery.length > 0) ? product.image_gallery[0] : '';
        setCurrentProduct({ ...product, image_url: imageUrl, stock_quantity: product.stock_quantity || 0 });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleDelete = async (productId) => {
        const isConfirmed = await confirm({
            title: "Видалення товару",
            message: "Ви впевнені, що хочете видалити цей товар? Це незворотно.",
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/products/${productId}`);
                toast.success('Товар видалено');
                fetchData();
            } catch (error) {
            }
        }
    };

    const resetForm = () => { 
        setCurrentProduct(getInitialFormState()); 
        setIsEditing(false); 
    };

    const getProductImageUrl = (gallery) => (Array.isArray(gallery) && gallery.length > 0) ? `${API_URL}${gallery[0]}` : 'https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото';

    const styles = {
        card: { 
            background: 'var(--platform-card-bg)', 
            padding: '1.5rem 2rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            border: '1px solid var(--platform-border-color)', 
            marginBottom: '30px' 
        },
        input: { 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '4px', 
            fontSize: '1rem', 
            background: 'var(--platform-card-bg)', 
            color: 'var(--platform-text-primary)', 
            transition: 'border-color 0.2s ease' 
        },
        label: { 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: 'var(--platform-text-primary)', 
            fontWeight: '500', 
            fontSize: '0.9rem' 
        },
        button: { 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '500', 
            transition: 'all 0.2s ease' 
        },
        secondaryButton: { 
            padding: '10px 20px', 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '4px', 
            background: 'var(--platform-card-bg)', 
            color: 'var(--platform-text-primary)', 
            cursor: 'pointer', 
            fontSize: '14px', 
            transition: 'all 0.2s ease' 
        },
        dangerButton: { 
            padding: '8px 12px', 
            backgroundColor: 'var(--platform-danger)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontSize: '12px', 
            transition: 'background-color 0.2s ease' 
        },
        productCard: { 
            background: 'var(--platform-card-bg)', 
            padding: '0', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            border: '1px solid var(--platform-border-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Завантаження...</div>;

    return (
        <div className="platform-products-tab">
            <div style={styles.card}>
                <h4 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1.5rem', 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                }}>
                    {isEditing ? `✏️ Редагування: ${currentProduct.name}` : '➕ Додавання нового товару'}
                </h4>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={styles.label}>Головне зображення:</label>
                            <ImageInput 
                                value={currentProduct.image_url ? `${API_URL}${currentProduct.image_url}` : ''} 
                                onChange={handleImageChange} 
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={styles.label}>Назва товару:</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={currentProduct.name} 
                                    onChange={handleFormChange} 
                                    required 
                                    style={styles.input} 
                                    placeholder="Введіть назву товару" 
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={styles.label}>Опис:</label>
                                <textarea 
                                    name="description" 
                                    value={currentProduct.description} 
                                    onChange={handleFormChange} 
                                    rows="3" 
                                    style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }} 
                                    placeholder="Опишіть товар (не обов'язково)" 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>Ціна (грн.):</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={currentProduct.price} 
                                        onChange={handleFormChange} 
                                        required 
                                        min="0.01" 
                                        step="0.01" 
                                        style={styles.input} 
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>Кількість на складі:</label>
                                    <input 
                                        type="number" 
                                        name="stock_quantity" 
                                        value={currentProduct.stock_quantity} 
                                        onChange={handleFormChange} 
                                        required 
                                        min="0" 
                                        style={styles.input} 
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={styles.label}>Категорія:</label>
                                <select 
                                    name="category_id" 
                                    value={currentProduct.category_id || "null"} 
                                    onChange={handleFormChange} 
                                    style={styles.input}
                                >
                                    <option value="null">Без категорії</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '10px', 
                        marginTop: '20px', 
                        borderTop: '1px solid var(--platform-border-color)', 
                        paddingTop: '20px' 
                    }}>
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={resetForm} 
                                style={styles.secondaryButton}
                            >
                                Скасувати редагування
                            </button>
                        )}
                        <button 
                            type="submit" 
                            style={{ 
                                ...styles.button, 
                                backgroundColor: 'var(--platform-accent)', 
                                color: 'var(--platform-accent-text)' 
                            }}
                        >
                            {isEditing ? '💾 Зберегти зміни' : '➕ Додати товар'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ 
                    color: 'var(--platform-text-primary)', 
                    margin: 0, 
                    fontSize: '1.25rem', 
                    fontWeight: '600' 
                }}>
                    🛍️ Поточні товари
                </h4>
                <span style={{ 
                    background: 'var(--platform-accent)', 
                    color: 'var(--platform-accent-text)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    fontWeight: '600' 
                }}>
                    {products.length}
                </span>
            </div>
            
            {products.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: 'var(--platform-text-secondary)', 
                    border: '2px dashed var(--platform-border-color)', 
                    borderRadius: '12px', 
                    background: 'var(--platform-card-bg)' 
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Немає товарів</h3>
                    <p>Створіть перший товар для вашого магазину</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {products.map(product => (
                        <div key={product.id} style={styles.productCard}>
                            <img 
                                src={getProductImageUrl(product.image_gallery)} 
                                alt={product.name} 
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/400x400/AAAAAA/FFFFFF?text=Немає+Фото" 
                                }} 
                            />
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <h5 style={{ 
                                    margin: '0 0 5px 0', 
                                    color: 'var(--platform-text-primary)', 
                                    fontSize: '1rem', 
                                    fontWeight: '600' 
                                }}>
                                    {product.name}
                                </h5>
                                <p style={{ 
                                    margin: '0 0 5px 0', 
                                    fontSize: '1.1em', 
                                    fontWeight: 'bold', 
                                    color: 'var(--platform-accent)' 
                                }}>
                                    {product.price} грн.
                                </p>
                                <p style={{ 
                                    margin: '0 0 10px 0', 
                                    fontSize: '0.9em', 
                                    color: product.stock_quantity > 0 ? 'var(--platform-success)' : 'var(--platform-danger)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem' 
                                }}>
                                    {product.stock_quantity > 0 ? '✅' : '❌'} На складі: {product.stock_quantity} шт.
                                </p>
                                <small style={{ 
                                    marginBottom: '10px', 
                                    flexGrow: 1, 
                                    color: 'var(--platform-text-secondary)' 
                                }}>
                                    📂 Категорія: {categories.find(c => c.id === product.category_id)?.name || 'Не вказано'}
                                </small>
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                    <button 
                                        onClick={() => handleEdit(product)} 
                                        style={{ 
                                            ...styles.secondaryButton, 
                                            flexGrow: 1, 
                                            padding: '8px 16px', 
                                            fontSize: '12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '0.25rem' 
                                        }} 
                                        title="Редагувати"
                                    >
                                        ✏️ Редагувати
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product.id)} 
                                        style={{ 
                                            ...styles.dangerButton, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '0.25rem' 
                                        }} 
                                        title="Видалити"
                                    >
                                        ❌ Видалити
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
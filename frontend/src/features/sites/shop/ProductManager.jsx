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
    const { confirm } = useConfirm();
    
    const initialFormState = { 
        id: null, name: '', description: '', price: 0, stock_quantity: 1, category_id: null, image_url: '' 
    };
    const [formData, setFormData] = useState(initialFormState);

    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        minPrice: '',
        maxPrice: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                apiClient.get(`/products/site/${siteId}`),
                apiClient.get(`/categories/site/${siteId}`)
            ]);
            setProducts(pRes.data || []);
            setCategories(cRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || formData.price <= 0) {
            toast.warning("Вкажіть назву та ціну (>0)");
            return;
        }
        const payload = { ...formData, site_id: siteId };
        try {
            if (formData.id) {
                await apiClient.put(`/products/${formData.id}`, payload);
                toast.success('Товар оновлено');
            } else {
                await apiClient.post(`/products`, payload);
                toast.success('Товар створено');
            }
            resetForm();
            fetchData();
        } catch (e) {
            toast.error('Помилка збереження');
        }
    };

    const openEditor = (product) => {
        const img = (product.image_gallery && Array.isArray(product.image_gallery) && product.image_gallery.length) 
            ? product.image_gallery[0] 
            : (product.image_url || '');
            
        setFormData({ ...product, image_url: img, stock_quantity: product.stock_quantity || 0 });
    };

    const resetForm = () => {
        setFormData(initialFormState);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (await confirm({ 
            title: "Видалити товар?", 
            message: "Цю дію неможливо скасувати.", 
            type: 'danger',
            confirmLabel: "Видалити"
        })) {
            try {
                await apiClient.delete(`/products/${id}`);
                fetchData();
                if (formData.id === id) {
                    resetForm();
                }
                toast.success('Товар видалено');
            } catch (err) {
                toast.error('Помилка видалення');
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            product.description.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category === 'all' || product.category_id === parseInt(filters.category);
        
        return matchesSearch && matchesCategory;
    });

    const containerStyle = { 
        display: 'flex', 
        gap: '20px', 
        height: 'calc(100vh - 140px)', 
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const editorCardStyle = {
        flex: '0 0 320px',
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'auto',
        height: '100%',
        boxSizing: 'border-box'
    };

    const productsAreaStyle = {
        flex: 1,
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '20px',
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        minWidth: 0
    };

    const productGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '16px',
        overflowY: 'auto', 
        padding: '4px',
        alignContent: 'start',
        height: '100%'
    };

    const tileStyle = (isActive) => ({
        background: 'var(--platform-bg)',
        borderRadius: '12px',
        border: isActive ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        minHeight: '280px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    });

    const tileImageStyle = {
        width: '100%',
        height: '160px',
        minHeight: '160px',
        objectFit: 'cover',
        objectPosition: 'center',
        backgroundColor: '#f0f2f5',
        borderBottom: '1px solid var(--platform-border-color)',
        display: 'block'
    };

    const tileContentStyle = {
        padding: '12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px'
    };

    const badgeStyle = (isStock) => ({
        position: 'absolute',
        top: '8px',
        left: '8px',
        background: isStock ? 'rgba(255, 255, 255, 0.95)' : '#fff5f5',
        color: isStock ? '#2f855a' : '#c53030',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
    });

    const deleteBtnStyle = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        color: '#e53e3e',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)', color: 'var(--platform-text-primary)',
        marginBottom: '12px', boxSizing: 'border-box'
    };

    const primaryButton = {
        background: 'var(--platform-accent)', color: 'white',
        padding: '10px', borderRadius: '8px', border: 'none',
        fontWeight: '600', cursor: 'pointer', width: '100%'
    };

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Завантаження...</div>;

    return (
        <div style={containerStyle}>
            <div style={editorCardStyle}>
                <div style={{marginBottom: '20px'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--platform-text-primary)'}}>
                        {formData.id ? '✏️ Редагування' : '➕ Новий товар'}
                    </h3>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--platform-text-secondary)'}}>
                        {formData.id ? 'Змініть дані та збережіть' : 'Заповніть картку товару'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>Назва</label>
                    <input 
                        type="text" 
                        style={inputStyle} 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required
                    />

                    <div style={{display: 'flex', gap: '10px'}}>
                        <div style={{flex: 1}}>
                            <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>Ціна (₴)</label>
                            <input 
                                type="number" step="0.01" style={inputStyle} 
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                                required
                            />
                        </div>
                        <div style={{flex: 1}}>
                            <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>Склад</label>
                            <input 
                                type="number" style={inputStyle} 
                                value={formData.stock_quantity} 
                                onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                            />
                        </div>
                    </div>

                    <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>Категорія</label>
                    <select 
                        style={inputStyle} 
                        value={formData.category_id || ''} 
                        onChange={e => setFormData({...formData, category_id: e.target.value || null})}
                    >
                        <option value="">Без категорії</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>Опис</label>
                    <textarea 
                        style={{...inputStyle, minHeight: '80px', resize: 'none'}} 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />

                    <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>Фото</label>
                    <div style={{height: '120px', marginBottom: '0'}}>
                        <ImageInput 
                            value={formData.image_url ? `${API_URL}${formData.image_url}` : ''}
                            onChange={(url) => setFormData({...formData, image_url: url.replace(API_URL, '')})}
                        />
                    </div>

                    <div style={{marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px'}}>
                        <button type="submit" style={primaryButton}>
                            {formData.id ? 'Зберегти' : 'Створити'}
                        </button>
                        {formData.id && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                style={{...primaryButton, background: 'transparent', border: '1px solid var(--platform-border-color)', color: 'var(--platform-text-primary)', width: 'auto'}}
                            >
                                Відміна
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={productsAreaStyle}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
                    <div style={{display: 'flex', gap: '10px', flex: 1, minWidth: '200px'}}>
                        <input 
                            placeholder="🔍 Пошук..." 
                            style={{...inputStyle, marginBottom: 0, width: '100%'}}
                            value={filters.search}
                            onChange={e => setFilters({...filters, search: e.target.value})}
                        />
                        <select 
                            style={{...inputStyle, marginBottom: 0, maxWidth: '180px'}}
                            value={filters.category}
                            onChange={e => setFilters({...filters, category: e.target.value})}
                        >
                            <option value="all">Всі категорії</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    
                    <div style={{fontWeight: 'bold', color: 'var(--platform-text-primary)', whiteSpace: 'nowrap', marginLeft: '10px'}}>
                        Всього товарів: <span style={{color: 'var(--platform-accent)', fontSize: '1.1rem'}}>{products.length}</span>
                    </div>
                </div>

                <div className="custom-scrollbar" style={productGridStyle}>
                    {filteredProducts.map(product => (
                        <div 
                            key={product.id}
                            style={tileStyle(formData.id === product.id)}
                            onClick={() => openEditor(product)}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={badgeStyle(product.stock_quantity > 0)}>
                                {product.stock_quantity > 0 ? `${product.stock_quantity} шт.` : 'Немає'}
                            </div>

                            <button 
                                onClick={(e) => handleDelete(e, product.id)}
                                style={deleteBtnStyle}
                                title="Видалити"
                                onMouseEnter={e => {e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#fc8181'}}
                                onMouseLeave={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.borderColor = '#e2e8f0'}}
                            >
                                🗑️
                            </button>

                            <img 
                                src={product.image_gallery?.[0] ? `${API_URL}${product.image_gallery[0]}` : 'https://placehold.co/300x200?text=No+Image'} 
                                alt={product.name}
                                style={tileImageStyle}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200?text=No+Image" }}
                            />

                            <div style={tileContentStyle}>
                                <div>
                                    <div style={{
                                        fontWeight: '600', 
                                        marginBottom: '4px', 
                                        lineHeight: '1.3', 
                                        fontSize: '0.95rem', 
                                        color: 'var(--platform-text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {product.name}
                                    </div>
                                    <div style={{fontSize: '0.75rem', color: 'var(--platform-text-secondary)', marginBottom: '8px'}}>
                                        {categories.find(c => c.id === product.category_id)?.name || 'Без категорії'}
                                    </div>
                                </div>
                                <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--platform-accent)'}}>
                                        {product.price} ₴
                                    </span>
                                    {formData.id === product.id && (
                                        <span style={{fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontStyle: 'italic'}}>
                                            Редагується...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                        <div style={{gridColumn: '1/-1', textAlign: 'center', color: 'var(--platform-text-secondary)', marginTop: '40px'}}>
                            Товарів не знайдено 📦
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManager;
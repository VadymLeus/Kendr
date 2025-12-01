// frontend/src/features/sites/shop/CategoryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';

const CategoryManager = ({ siteId }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [formData, setFormData] = useState({ id: null, name: '' });
    
    const { confirm } = useConfirm();

    const fetchData = useCallback(async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                apiClient.get(`/categories/site/${siteId}`),
                apiClient.get(`/products/site/${siteId}`)
            ]);
            setCategories(catRes.data || []);
            setProducts(prodRes.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Не вдалося завантажити дані');
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const catIdFromUrl = searchParams.get('categoryId');
        if (!loading && catIdFromUrl && categories.length > 0) {
            const catToEdit = categories.find(c => c.id.toString() === catIdFromUrl);
            if (catToEdit && formData.id !== catToEdit.id) {
                setFormData({ id: catToEdit.id, name: catToEdit.name });
            }
        }
    }, [loading, categories, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (formData.id) {
                await apiClient.put(`/categories/${formData.id}`, { name: formData.name });
                toast.success('Категорію оновлено');
            } else {
                await apiClient.post('/categories', { siteId, name: formData.name });
                toast.success('Категорію додано');
            }
            handleReset();
            fetchData();
        } catch (e) {
            toast.error('Помилка збереження');
        }
    };

    const handleEdit = (category) => {
        setFormData({ id: category.id, name: category.name });
        setSearchParams(prev => {
            prev.set('categoryId', category.id);
            return prev;
        });
    };

    const handleReset = () => {
        setFormData({ id: null, name: '' });
        setSearchParams(prev => {
            prev.delete('categoryId');
            return prev;
        });
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (await confirm({ 
            title: 'Видалити категорію?', 
            message: 'Товари залишаться, але будуть "Без категорії".', 
            type: 'danger',
            confirmLabel: 'Видалити'
        })) {
            try {
                await apiClient.delete(`/categories/${id}`);
                if (formData.id === id) handleReset();
                fetchData();
                toast.success('Видалено');
            } catch (err) {
                toast.error('Не вдалося видалити');
            }
        }
    };

    const getProductCount = (categoryId) => {
        return products.filter(p => p.category_id === categoryId).length;
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const primaryButton = {
        background: 'var(--platform-accent)', 
        color: 'var(--platform-accent-text)',
        padding: '10px', 
        borderRadius: '8px', 
        border: 'none',
        fontWeight: '600', 
        cursor: 'pointer', 
        width: '100%',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const primaryButtonHover = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const secondaryButton = {
        background: 'transparent', 
        border: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)', 
        width: 'auto',
        padding: '10px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonHover = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    const cardBaseStyle = {
        background: 'var(--platform-bg)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const cardStyle = (isActive) => ({
        ...cardBaseStyle,
        border: isActive ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        boxShadow: isActive ? '0 4px 12px rgba(var(--platform-accent-rgb), 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
    });

    const cardHoverStyle = {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        borderColor: 'var(--platform-accent)'
    };

    const deleteBtnStyle = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid var(--platform-border-color)',
        color: '#e53e3e',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.8rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const deleteBtnHoverStyle = {
        background: '#fff5f5',
        borderColor: '#fc8181',
        color: '#c53030',
        transform: 'scale(1.1)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.2)'
    };

    const inputStyle = {
        width: '100%', 
        padding: '10px 12px', 
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)', 
        color: 'var(--platform-text-primary)',
        marginBottom: '12px', 
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
    };

    const inputHoverStyle = {
        borderColor: 'var(--platform-accent)',
        boxShadow: '0 0 0 1px var(--platform-accent)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

    const containerStyle = { 
        display: 'flex', 
        gap: '20px', 
        height: 'calc(100vh - 140px)', 
        padding: '20px',
        boxSizing: 'border-box'
    };

    const editorCardStyle = {
        flex: '0 0 320px',
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column',
        height: 'fit-content',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const listAreaStyle = {
        flex: 1,
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        overflowY: 'auto',
        padding: '4px',
        alignContent: 'start'
    };

    const iconStyle = {
        fontSize: '2.5rem',
        marginBottom: '10px',
        opacity: 0.8
    };

    const titleStyle = {
        fontWeight: '600',
        color: 'var(--platform-text-primary)',
        marginBottom: '0.25rem',
        fontSize: '1rem'
    };

    const countStyle = {
        fontSize: '0.8rem',
        color: 'var(--platform-text-secondary)',
        background: 'rgba(0,0,0,0.05)',
        padding: '2px 8px',
        borderRadius: '10px',
        marginTop: '4px'
    };

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Завантаження...</div>;

    return (
        <div style={containerStyle}>
            <div style={editorCardStyle}>
                <div style={{marginBottom: '20px'}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--platform-text-primary)'}}>
                        {formData.id ? '✏️ Редагування' : '➕ Нова категорія'}
                    </h3>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--platform-text-secondary)'}}>
                        {formData.id ? 'Змініть назву категорії' : 'Створіть групу для товарів'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={{fontSize:'0.85rem', fontWeight:'500', marginBottom:'4px', display:'block', color: 'var(--platform-text-secondary)'}}>
                        Назва категорії
                    </label>
                    <input 
                        type="text" 
                        style={inputStyle} 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="Наприклад: Смартфони"
                        required
                        autoFocus
                        onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                        onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                    />

                    <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                        <button 
                            type="submit" 
                            style={primaryButton}
                            onMouseOver={(e) => handleMouseOver(e.target, primaryButtonHover)}
                            onMouseOut={(e) => handleMouseOut(e.target, primaryButton)}
                        >
                            {formData.id ? 'Зберегти' : 'Додати'}
                        </button>
                        {formData.id && (
                            <button 
                                type="button" 
                                onClick={handleReset}
                                style={secondaryButton}
                                onMouseOver={(e) => handleMouseOver(e.target, secondaryButtonHover)}
                                onMouseOut={(e) => handleMouseOut(e.target, secondaryButton)}
                            >
                                Відміна
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={listAreaStyle}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '1rem'}}>
                    <input 
                        type="text" 
                        placeholder="🔍 Пошук..." 
                        style={{...inputStyle, marginBottom: 0, width: '250px'}}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                        onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, marginBottom: 0, width: '250px'})}
                    />
                    
                    <div style={{fontWeight: 'bold', color: 'var(--platform-text-primary)', whiteSpace: 'nowrap'}}>
                        Всього категорій: <span style={{color: 'var(--platform-accent)'}}>{categories.length}</span>
                    </div>
                </div>

                <div className="custom-scrollbar" style={gridStyle}>
                    {filteredCategories.length === 0 && (
                        <div style={{gridColumn: '1/-1', textAlign: 'center', color: 'var(--platform-text-secondary)', marginTop: '40px'}}>
                            <div style={{fontSize: '3rem', marginBottom: '10px', opacity: 0.5}}>📂</div>
                            {categories.length === 0 ? 'Список порожній' : 'Нічого не знайдено'}
                        </div>
                    )}

                    {filteredCategories.map(cat => (
                        <div 
                            key={cat.id} 
                            style={cardStyle(formData.id === cat.id)}
                            onClick={() => handleEdit(cat)}
                            onMouseEnter={(e) => handleMouseOver(e.currentTarget, {...cardStyle(formData.id === cat.id), ...cardHoverStyle})}
                            onMouseLeave={(e) => handleMouseOut(e.currentTarget, cardStyle(formData.id === cat.id))}
                        >
                            <button 
                                onClick={(e) => handleDelete(e, cat.id)}
                                style={deleteBtnStyle}
                                title="Видалити"
                                onMouseOver={(e) => handleMouseOver(e.currentTarget, deleteBtnHoverStyle)}
                                onMouseLeave={(e) => handleMouseOut(e.currentTarget, deleteBtnStyle)}
                            >
                                🗑️
                            </button>

                            <div style={iconStyle}>
                                {formData.id === cat.id ? '✏️' : '📂'}
                            </div>
                            <div style={titleStyle}>{cat.name}</div>
                            
                            <div style={countStyle}>
                                {getProductCount(cat.id)} од.
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
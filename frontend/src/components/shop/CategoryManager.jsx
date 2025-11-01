// frontend/src/components/shop/CategoryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';

const CategoryManager = ({ siteId }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');

    const fetchCategories = useCallback(async () => {
        if (!siteId) return;
        try {
            const response = await apiClient.get(`/categories/site/${siteId}`);
            setCategories(response.data);
        } catch (error) {
            console.error('Помилка завантаження категорій:', error);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await apiClient.post('/categories', { 
                siteId: siteId,
                name: newCategoryName.trim() 
            });
            setNewCategoryName('');
            await fetchCategories();
        } catch (error) {
            console.error('Помилка додавання категорії:', error);
        }
    };
    
    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю категорію? Видалення категорії не видалить товари, вони залишаться без категорії.')) return;
        try {
            await apiClient.delete(`/categories/${categoryId}`);
            await fetchCategories();
        } catch (error) {
            console.error('Помилка видалення категорії:', error);
        }
    };

    if (loading) return <div>Завантаження категорій...</div>;

    return (
        <div style={{ 
            padding: '20px', 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '8px',
            backgroundColor: 'var(--platform-card-bg)'
        }}>
            <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>
                Категорії товарів
            </h4>

            <form onSubmit={handleAddCategory} style={{ 
                marginBottom: '20px', 
                display: 'flex', 
                gap: '10px' 
            }}>
                <input
                    type="text"
                    placeholder="Назва нової категорії"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                    style={{ 
                        flexGrow: 1, 
                        padding: '10px',
                        border: '1px solid var(--platform-border-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--platform-card-bg)',
                        color: 'var(--platform-text-primary)'
                    }}
                />
                <button 
                    type="submit" 
                    style={{ 
                        backgroundColor: 'var(--platform-accent)', 
                        color: 'var(--platform-accent-text)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        cursor: 'pointer'
                    }}
                >
                    Додати
                </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {categories.map(category => (
                    <li key={category.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0', 
                        borderBottom: '1px solid var(--platform-border-color)'
                    }}>
                        <span style={{ color: 'var(--platform-text-primary)' }}>
                            {category.name}
                        </span>
                        <button 
                            onClick={() => handleDeleteCategory(category.id)} 
                            style={{ 
                                color: 'var(--platform-danger)', 
                                border: 'none', 
                                background: 'none', 
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                padding: '4px 8px'
                            }}
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>

            {categories.length === 0 && (
                <p style={{ 
                    color: 'var(--platform-text-secondary)', 
                    textAlign: 'center',
                    marginTop: '1rem'
                }}>
                    Немає створених категорій.
                </p>
            )}
        </div>
    );
};

export default CategoryManager;
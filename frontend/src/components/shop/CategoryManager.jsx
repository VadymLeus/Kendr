// frontend/src/components/shop/CategoryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';

const CategoryManager = ({ siteId }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        if (!siteId) return;
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(`/categories/site/${siteId}`);
            
            if (response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                console.warn('Отримано неочікувані дані:', response.data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Помилка завантаження категорій:', error);
            setError('Не вдалося завантажити категорії');
            setCategories([]);
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
            setActionLoading(true);
            setError(null);
            await apiClient.post('/categories', { 
                siteId: siteId,
                name: newCategoryName.trim() 
            });
            setNewCategoryName('');
            await fetchCategories();
        } catch (error) {
            console.error('Помилка додавання категорії:', error);
            const errorMessage = error.response?.data?.message || 'Помилка додавання категорії';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю категорію? Видалення категорії не видалить товари, вони залишаться без категорії.')) return;
        
        try {
            setActionLoading(true);
            setError(null);
            await apiClient.delete(`/categories/${categoryId}`);
            await fetchCategories();
        } catch (error) {
            console.error('Помилка видалення категорії:', error);
            const errorMessage = error.response?.data?.message || 'Помилка видалення категорії';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditClick = (category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setEditingCategoryName('');
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editingCategoryName.trim() || !editingCategoryId) return;

        try {
            setActionLoading(true);
            setError(null);
            await apiClient.put(`/categories/${editingCategoryId}`, { 
                name: editingCategoryName.trim() 
            });
            handleCancelEdit();
            await fetchCategories();
        } catch (error) {
            console.error('Помилка оновлення категорії:', error);
            const errorMessage = error.response?.data?.message || 'Помилка оновлення';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Стилі (залишаємо без змін)
    const actionButtonStyle = {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '6px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: actionLoading ? 0.6 : 1,
        pointerEvents: actionLoading ? 'none' : 'auto'
    };

    const editButtonStyle = {
        ...actionButtonStyle,
        color: 'var(--site-text-secondary)',
    };
    
    const deleteButtonStyle = {
        ...actionButtonStyle,
        color: 'var(--platform-danger)',
    };

    const primaryButtonStyle = {
        backgroundColor: 'var(--site-accent)',
        color: 'var(--site-accent-text)',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: actionLoading ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
        opacity: actionLoading ? 0.6 : 1
    };

    const secondaryButtonStyle = {
        backgroundColor: 'transparent',
        color: 'var(--site-text-secondary)',
        border: '1px solid var(--site-border-color)',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: actionLoading ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        opacity: actionLoading ? 0.6 : 1
    };

    console.log('Current categories state:', categories);
    console.log('Is array:', Array.isArray(categories));
    console.log('Type:', typeof categories);

    if (loading) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                color: 'var(--site-text-secondary)'
            }}>
                Завантаження категорій...
            </div>
        );
    }

    const categoriesToRender = Array.isArray(categories) ? categories : [];

    return (
        <div style={{ 
            padding: '20px', 
            border: '1px solid var(--site-border-color)', 
            borderRadius: '8px',
            backgroundColor: 'var(--site-card-bg)'
        }}>
            <h4 style={{ 
                color: 'var(--site-text-primary)', 
                marginBottom: '1rem',
                fontSize: '1.25rem',
                fontWeight: '600'
            }}>
                Категорії товарів
            </h4>

            {error && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    backgroundColor: 'var(--platform-danger-light)',
                    color: 'var(--platform-danger)',
                    border: '1px solid var(--platform-danger)',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

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
                    disabled={actionLoading}
                    style={{ 
                        flexGrow: 1, 
                        padding: '10px',
                        border: '1px solid var(--site-border-color)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--site-card-bg)',
                        color: 'var(--site-text-primary)',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease',
                        opacity: actionLoading ? 0.6 : 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--site-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--site-border-color)'}
                />
                <button 
                    type="submit" 
                    disabled={actionLoading}
                    style={{ 
                        backgroundColor: 'var(--site-accent)', 
                        color: 'var(--site-accent-text)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease',
                        whiteSpace: 'nowrap',
                        opacity: actionLoading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!actionLoading) {
                            e.target.style.backgroundColor = 'var(--site-accent-hover)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!actionLoading) {
                            e.target.style.backgroundColor = 'var(--site-accent)';
                        }
                    }}
                >
                    {actionLoading ? '...' : 'Додати'}
                </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {categoriesToRender.map(category => (
                    <li key={category.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0', 
                        borderBottom: '1px solid var(--site-border-color)',
                        transition: 'background-color 0.2s ease'
                    }}>
                        {editingCategoryId === category.id ? (
                            <form onSubmit={handleUpdateCategory} style={{ display: 'flex', flexGrow: 1, gap: '8px' }}>
                                <input
                                    type="text"
                                    value={editingCategoryName}
                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                    disabled={actionLoading}
                                    autoFocus
                                    style={{
                                        flexGrow: 1,
                                        padding: '8px',
                                        border: '1px solid var(--site-accent)',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--site-card-bg)',
                                        color: 'var(--site-text-primary)',
                                        opacity: actionLoading ? 0.6 : 1
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    style={primaryButtonStyle}
                                >
                                    {actionLoading ? '...' : 'Зберегти'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit}
                                    disabled={actionLoading}
                                    style={secondaryButtonStyle}
                                >
                                    Скасувати
                                </button>
                            </form>
                        ) : (
                            <>
                                <span style={{ 
                                    color: 'var(--site-text-primary)',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    {category.name}
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                        onClick={() => handleEditClick(category)} 
                                        disabled={actionLoading}
                                        style={editButtonStyle}
                                        onMouseEnter={(e) => {
                                            if (!actionLoading) {
                                                e.target.style.backgroundColor = 'var(--platform-border-color)';
                                                e.target.style.color = 'var(--site-text-primary)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!actionLoading) {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = 'var(--site-text-secondary)';
                                            }
                                        }}
                                        title="Редагувати назву"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCategory(category.id)} 
                                        disabled={actionLoading}
                                        style={deleteButtonStyle}
                                        onMouseEnter={(e) => {
                                            if (!actionLoading) {
                                                e.target.style.backgroundColor = 'var(--platform-danger)';
                                                e.target.style.color = 'white';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!actionLoading) {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = 'var(--platform-danger)';
                                            }
                                        }}
                                        title="Видалити категорію"
                                    >
                                        ×
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {categoriesToRender.length === 0 && !loading && (
                <p style={{ 
                    color: 'var(--site-text-secondary)', 
                    textAlign: 'center',
                    marginTop: '1rem',
                    fontSize: '14px',
                    fontStyle: 'italic'
                }}>
                    Немає створених категорій.
                </p>
            )}
        </div>
    );
};

export default CategoryManager;
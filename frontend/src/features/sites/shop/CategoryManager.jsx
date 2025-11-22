// frontend/src/features/sites/shop/CategoryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';

const CategoryManager = ({ siteId }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const { confirm } = useConfirm();

    const fetchCategories = useCallback(async () => {
        if (!siteId) return;
        try {
            setLoading(true);
            const response = await apiClient.get(`/categories/site/${siteId}`);
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        
        try {
            setActionLoading(true);
            await apiClient.post('/categories', { siteId: siteId, name: newCategoryName.trim() });
            setNewCategoryName('');
            toast.success('Категорію додано');
            await fetchCategories();
        } catch (error) {
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleDeleteCategory = async (categoryId) => {
        const isConfirmed = await confirm({
            title: "Видалення категорії",
            message: "Ви впевнені, що хочете видалити цю категорію? Товари залишаться, але втратять зв'язок з цією категорією.",
            confirmLabel: "Видалити",
            type: "danger"
        });
        
        if (isConfirmed) {
            try {
                setActionLoading(true);
                await apiClient.delete(`/categories/${categoryId}`);
                toast.success('Категорію видалено');
                await fetchCategories();
            } catch (error) {
            } finally {
                setActionLoading(false);
            }
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
            await apiClient.put(`/categories/${editingCategoryId}`, { name: editingCategoryName.trim() });
            toast.success('Категорію оновлено');
            handleCancelEdit();
            await fetchCategories();
        } catch (error) {
        } finally {
            setActionLoading(false);
        }
    };

    const styles = {
        container: { 
            padding: '1.5rem', 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '12px', 
            backgroundColor: 'var(--platform-card-bg)', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
        },
        title: { 
            color: 'var(--platform-text-primary)', 
            marginBottom: '1rem', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
        },
        input: { 
            flexGrow: 1, 
            padding: '0.75rem', 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '6px', 
            backgroundColor: 'var(--platform-card-bg)', 
            color: 'var(--platform-text-primary)', 
            fontSize: '0.9rem', 
            transition: 'all 0.2s ease' 
        },
        primaryButton: { 
            backgroundColor: 'var(--platform-accent)', 
            color: 'var(--platform-accent-text)', 
            border: 'none', 
            borderRadius: '6px', 
            padding: '0.75rem 1.25rem', 
            cursor: 'pointer', 
            fontSize: '0.9rem', 
            fontWeight: '500', 
            transition: 'all 0.2s ease', 
            whiteSpace: 'nowrap', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem' 
        },
        secondaryButton: { 
            backgroundColor: 'transparent', 
            color: 'var(--platform-text-secondary)', 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '6px', 
            padding: '0.75rem 1rem', 
            cursor: 'pointer', 
            fontSize: '0.85rem', 
            fontWeight: '500', 
            transition: 'all 0.2s ease' 
        },
        actionButton: { 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer', 
            fontSize: '0.9rem', 
            padding: '0.5rem', 
            borderRadius: '6px', 
            transition: 'all 0.2s ease', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        },
        editButton: { 
            color: 'var(--platform-text-secondary)' 
        },
        deleteButton: { 
            color: 'var(--platform-danger)' 
        },
        listItem: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.75rem 0', 
            borderBottom: '1px solid var(--platform-border-color)', 
            transition: 'background-color 0.2s ease' 
        },
        categoryName: { 
            color: 'var(--platform-text-primary)', 
            fontSize: '0.95rem', 
            fontWeight: '500' 
        },
        emptyState: { 
            color: 'var(--platform-text-secondary)', 
            textAlign: 'center', 
            marginTop: '1.5rem', 
            fontSize: '0.9rem', 
            fontStyle: 'italic', 
            padding: '1.5rem', 
            border: '2px dashed var(--platform-border-color)', 
            borderRadius: '8px', 
            backgroundColor: 'var(--platform-bg)' 
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Завантаження категорій...</div>;

    return (
        <div style={styles.container}>
            <h4 style={styles.title}>📂 Категорії товарів</h4>

            <form onSubmit={handleAddCategory} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <input 
                    type="text" 
                    placeholder="Назва нової категорії" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)} 
                    required 
                    disabled={actionLoading} 
                    style={{ ...styles.input, opacity: actionLoading ? 0.6 : 1 }} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'} 
                    onBlur={(e) => e.target.style.borderColor = 'var(--platform-border-color)'} 
                />
                <button 
                    type="submit" 
                    disabled={actionLoading} 
                    style={{ ...styles.primaryButton, opacity: actionLoading ? 0.6 : 1 }}
                >
                    {actionLoading ? '⏳' : '➕'} Додати
                </button>
            </form>

            {categories.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {categories.map(category => (
                        <li key={category.id} style={styles.listItem}>
                            {editingCategoryId === category.id ? (
                                <form onSubmit={handleUpdateCategory} style={{ display: 'flex', flexGrow: 1, gap: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        value={editingCategoryName} 
                                        onChange={(e) => setEditingCategoryName(e.target.value)} 
                                        disabled={actionLoading} 
                                        autoFocus 
                                        style={{ ...styles.input, opacity: actionLoading ? 0.6 : 1 }} 
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading} 
                                        style={{ ...styles.primaryButton, padding: '0.75rem 1rem', opacity: actionLoading ? 0.6 : 1 }}
                                    >
                                        {actionLoading ? '⏳' : '💾'} Зберегти
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancelEdit} 
                                        disabled={actionLoading} 
                                        style={{ ...styles.secondaryButton, opacity: actionLoading ? 0.6 : 1 }}
                                    >
                                        Скасувати
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <span style={styles.categoryName}>{category.name}</span>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button 
                                            onClick={() => handleEditClick(category)} 
                                            disabled={actionLoading} 
                                            style={{ ...styles.actionButton, ...styles.editButton, opacity: actionLoading ? 0.6 : 1 }} 
                                            title="Редагувати назву"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCategory(category.id)} 
                                            disabled={actionLoading} 
                                            style={{ ...styles.actionButton, ...styles.deleteButton, opacity: actionLoading ? 0.6 : 1 }} 
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
            ) : (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                    <p style={{ margin: 0 }}>Немає створених категорій</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                        Додайте першу категорію для організації товарів
                    </p>
                </div>
            )}
            
            {categories.length > 0 && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: 'var(--platform-bg)', 
                    borderRadius: '6px', 
                    border: '1px solid var(--platform-border-color)' 
                }}>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '0.8rem', 
                        color: 'var(--platform-text-secondary)', 
                        textAlign: 'center' 
                    }}>
                        📝 <strong>{categories.length}</strong> категорій
                    </p>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;
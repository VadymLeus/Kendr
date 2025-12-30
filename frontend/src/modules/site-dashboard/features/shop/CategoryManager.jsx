// frontend/src/modules/site-dashboard/features/shop/CategoryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../common/services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import { Input } from '../../../../common/components/ui/Input';
import { Button } from '../../../../common/components/ui/Button';
import { 
    IconSearch, IconFolder, IconPlus, IconTrash, 
    IconEdit, IconChevronLeft, IconChevronRight, IconSave,
    IconStar, IconHome, IconSettings, IconHeart, IconBox, 
    IconTag, IconShoppingBag, IconGrid
} from '../../../../common/components/ui/Icons';

const ICON_MAP = {
    folder: IconFolder, star: IconStar, home: IconHome,
    settings: IconSettings, heart: IconHeart, box: IconBox,
    tag: IconTag, bag: IconShoppingBag, grid: IconGrid
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

const CategoryManager = ({ siteId, onSavingChange }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const { confirm } = useConfirm();

    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [formData, setFormData] = useState({ id: null, name: '', icon: 'folder' });

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
        if (!loading) {
            if (catIdFromUrl === 'new') {
                setActiveCategory(null);
                setFormData({ id: null, name: '', icon: 'folder' });
                setIsPanelOpen(true);
            } else if (catIdFromUrl && categories.length > 0) {
                const catToEdit = categories.find(c => c.id.toString() === catIdFromUrl);
                if (catToEdit) {
                    setActiveCategory(catToEdit);
                    setFormData({ 
                        id: catToEdit.id, 
                        name: catToEdit.name, 
                        icon: catToEdit.icon || 'folder' 
                    });
                    setIsPanelOpen(true);
                }
            } else if (!catIdFromUrl && isPanelOpen && activeCategory) {
                 setActiveCategory(null);
                 setFormData({ id: null, name: '', icon: 'folder' });
            }
        }
    }, [loading, categories, searchParams]);

    const handleSelectCategory = (category) => {
        if (activeCategory && activeCategory.id === category.id) {
            setActiveCategory(null);
            setFormData({ id: null, name: '', icon: 'folder' });
            setSearchParams(prev => { prev.delete('categoryId'); return prev; });
        } else {
            setActiveCategory(category);
            setFormData({ id: category.id, name: category.name, icon: category.icon || 'folder' });
            setIsPanelOpen(true);
            setSearchParams(prev => { prev.set('categoryId', category.id); return prev; });
        }
    };

    const handleCreateNew = () => {
        setActiveCategory(null);
        setFormData({ id: null, name: '', icon: 'folder' });
        setIsPanelOpen(true);
        setSearchParams(prev => { prev.set('categoryId', 'new'); return prev; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { toast.warning("Введіть назву категорії"); return; }
        if (onSavingChange) onSavingChange(true);
        try {
            const payload = { siteId, name: formData.name, icon: formData.icon };
            if (formData.id) {
                await apiClient.put(`/categories/${formData.id}`, payload);
                toast.success('Категорію оновлено');
            } else {
                await apiClient.post('/categories', payload);
                toast.success('Категорію додано');
            }
            fetchData();
            if (!formData.id) setFormData({ id: null, name: '', icon: 'folder' }); 
        } catch (e) { console.error(e); toast.error('Помилка збереження'); } 
        finally { if (onSavingChange) onSavingChange(false); }
    };

    const handleDelete = async (e, id, name) => {
        e.stopPropagation();
        if (await confirm({ title: 'Видалити категорію?', message: `Ви впевнені?`, type: 'danger', confirmLabel: 'Видалити' })) {
            if (onSavingChange) onSavingChange(true);
            try {
                await apiClient.delete(`/categories/${id}`);
                if (activeCategory?.id === id) handleCreateNew();
                fetchData();
                toast.success('Категорію видалено');
            } catch (err) { toast.error('Не вдалося видалити'); } 
            finally { if (onSavingChange) onSavingChange(false); }
        }
    };

    const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    const getProductCount = (categoryId) => products.filter(p => p.category_id === categoryId).length;

    const styles = {
        container: { 
            display: 'flex', 
            gap: '20px', 
            alignItems: 'flex-start' 
        }, 
        
        listArea: { flex: 1, minWidth: 0 },
        
        toolbar: {
            padding: '16px 20px',
            background: 'var(--platform-bg)',
            border: '1px solid var(--platform-border-color)', 
            borderBottom: 'none',
            borderTopLeftRadius: '16px', 
            borderTopRightRadius: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
        },
        
        gridContainer: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)', 
            borderTop: '1px solid var(--platform-border-color)',
            borderBottomLeftRadius: '16px', 
            borderBottomRightRadius: '16px',
            padding: '20px'
        },

        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px',
        },

        card: (isSelected) => ({
            background: 'var(--platform-bg)',
            borderRadius: '12px',
            border: isSelected ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
            padding: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: isSelected ? '0 4px 12px rgba(var(--platform-accent-rgb), 0.15)' : 'none',
            transform: isSelected ? 'translateY(-2px)' : 'none',
            overflow: 'hidden' 
        }),

        collapseBtn: {
            position: 'sticky', top: '20px', 
            width: '24px', height: '48px', background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)', borderRadius: '6px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--platform-text-secondary)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10, marginTop: '60px'
        },

        panelArea: {
            width: isPanelOpen ? '350px' : '0px',
            minWidth: isPanelOpen ? '350px' : '0px',
            opacity: isPanelOpen ? 1 : 0,
            transition: 'all 0.3s ease',
            position: 'sticky', 
            top: '20px',
            display: 'flex',
            flexDirection: 'column'
        },
        
        panelHeader: {
            padding: '20px',
            background: 'var(--platform-bg)',
            border: '1px solid var(--platform-border-color)',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        },

        panelBody: {
            padding: '20px',
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderTop: '1px solid var(--platform-border-color)',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
        },
        
        iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px' },
        iconOption: (active) => ({
            aspectRatio: '1', borderRadius: '8px',
            border: `1px solid ${active ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
            background: active ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-bg)',
            color: active ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        })
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
             <style>{`
                .cat-card:hover { transform: translateY(-4px); border-color: var(--platform-accent) !important; }
            `}</style>

            <div style={styles.listArea}>
                <div style={styles.toolbar}>
                    <div style={{display: 'flex', gap: '12px', flex: 1}}>
                        <Input 
                            leftIcon={<IconSearch size={16}/>}
                            placeholder="Пошук категорії..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{margin: 0, width: '100%', maxWidth: '300px'}}
                            wrapperStyle={{margin: 0, width: '100%', maxWidth: '300px'}}
                        />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <span style={{fontSize: '0.9rem', color: 'var(--platform-text-secondary)'}}>
                            Всього: <b>{categories.length}</b>
                        </span>
                        <Button onClick={handleCreateNew} icon={<IconPlus size={16}/>}>Додати</Button>
                    </div>
                </div>

                <div style={styles.gridContainer}>
                    <div style={styles.grid}>
                        {filteredCategories.map(cat => {
                            const isSelected = activeCategory?.id === cat.id;
                            const count = getProductCount(cat.id);
                            const CatIcon = ICON_MAP[cat.icon] || IconFolder;
                            
                            return (
                                <div key={cat.id} style={styles.card(isSelected)} onClick={() => handleSelectCategory(cat)} className="cat-card">
                                    <div style={{position: 'absolute', top: '8px', right: '8px', zIndex: 2}}>
                                        <Button variant="square-danger" onClick={(e) => handleDelete(e, cat.id, cat.name)} style={{width: '28px', height: '28px'}}>
                                            <IconTrash size={14}/>
                                        </Button>
                                    </div>
                                    <div style={{marginBottom: '10px', opacity: 0.8, color: isSelected ? 'var(--platform-accent)' : 'var(--platform-text-secondary)'}}>
                                        <CatIcon size={40} />
                                    </div>
                                    <div style={{
                                        fontWeight: '600', 
                                        color: 'var(--platform-text-primary)', 
                                        marginBottom: '4px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                        width: '100%'
                                    }} title={cat.name}>
                                        {cat.name}
                                    </div>
                                    <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)', background: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: '10px'}}>{count} товарів</div>
                                    {isSelected && <div style={{marginTop: '10px', color: 'var(--platform-accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px'}}><IconEdit size={12}/> Редагування</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <button style={styles.collapseBtn} onClick={() => setIsPanelOpen(!isPanelOpen)}>
                {isPanelOpen ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            </button>

            <div style={styles.panelArea}>
                <div style={styles.panelHeader}>
                    <h3 style={{margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {formData.id ? <><IconEdit size={18} /> Редагування</> : <><IconPlus size={18} /> Нова категорія</>}
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} style={styles.panelBody}>
                    <div style={{marginBottom: '20px'}}>
                        <Input 
                            label="Назва категорії"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="Наприклад: Ноутбуки"
                            autoFocus
                            maxLength={30}
                        />
                    </div>

                    <div style={{marginBottom: '20px'}}>
                        <label style={{display:'block', marginBottom: '8px', fontSize:'0.9rem', fontWeight:'500', color:'var(--platform-text-secondary)'}}>
                            Іконка категорії
                        </label>
                        <div style={styles.iconGrid}>
                            {AVAILABLE_ICONS.map(iconName => {
                                const IconComponent = ICON_MAP[iconName];
                                const isActive = formData.icon === iconName;
                                return (
                                    <div key={iconName} style={styles.iconOption(isActive)} onClick={() => setFormData({...formData, icon: iconName})} title={iconName}>
                                        <IconComponent size={20} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    <div style={{paddingTop: '20px', borderTop: '1px solid var(--platform-border-color)', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <Button type="button" variant="outline" onClick={() => setIsPanelOpen(false)}>Закрити</Button>
                        <Button type="submit" variant="primary" icon={<IconSave size={16}/>}>
                            {formData.id ? 'Зберегти' : 'Створити'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryManager;
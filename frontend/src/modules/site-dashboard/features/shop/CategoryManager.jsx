// frontend/src/modules/site-dashboard/features/shop/CategoryManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../common/services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import { Input } from '../../../../common/components/ui/Input';
import { Button } from '../../../../common/components/ui/Button';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import { SplitViewLayout } from '../../../../common/components/layout/SplitViewLayout';
import {
    IconSearch, IconFolder, IconPlus, IconTrash,
    IconEdit, IconChevronLeft, IconChevronRight, IconSave,
    IconStar, IconHome, IconHeart, IconBox,
    IconTag, IconShoppingBag, IconGrid, IconX,
    IconCamera, IconMusic, IconSmartphone, IconCoffee,
    IconBriefcase, IconGift, IconTruck, IconZap,
    IconMapPin, IconImage, IconVideo, IconUser,
    IconType, IconList
} from '../../../../common/components/ui/Icons';

const ICON_MAP = {
    folder: IconFolder, grid: IconGrid, tag: IconTag, bag: IconShoppingBag,
    box: IconBox, star: IconStar, heart: IconHeart, home: IconHome,
    gift: IconGift, truck: IconTruck, zap: IconZap, camera: IconCamera,
    music: IconMusic, phone: IconSmartphone, coffee: IconCoffee, briefcase: IconBriefcase,
    map: IconMapPin, image: IconImage, video: IconVideo, user: IconUser
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

const SORT_FIELDS = [
    { value: 'name', label: 'За назвою', icon: IconType },
    { value: 'count', label: 'Кількість товарів', icon: IconList }
];

const CategoryManager = ({ siteId, onSavingChange }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    
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

    const getProductCount = useCallback((categoryId) => {
        return products.filter(p => p.category_id === categoryId).length;
    }, [products]);

    const processedCategories = useMemo(() => {
        let result = [...categories];
        if (search.trim()) {
            result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
        }
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'count') {
                comparison = getProductCount(a.id) - getProductCount(b.id);
            }
            return sortOrder === 'asc' ? comparison : comparison * -1;
        });
        return result;
    }, [categories, search, sortBy, sortOrder, getProductCount]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleSelectCategory = (category) => {
        if (activeCategory && activeCategory.id === category.id) {
            handleClear();
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

    const handleClear = () => {
        setActiveCategory(null);
        setFormData({ id: null, name: '', icon: 'folder' });
        setSearchParams(prev => { prev.delete('categoryId'); return prev; });
        if (window.innerWidth < 1100) setIsPanelOpen(false);
    };
    
    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSearchParams(prev => { prev.delete('categoryId'); return prev; });
    };

    const handleNameChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedName = formData.name.trim();

        if (!trimmedName) {
            toast.warning("Введіть назву категорії");
            return;
        }
        const isDuplicate = categories.some(cat =>
            cat.name.toLowerCase() === trimmedName.toLowerCase() &&
            cat.id !== formData.id
        );
        if (isDuplicate) {
            toast.error('Категорія з такою назвою вже існує!');
            return;
        }

        if (onSavingChange) onSavingChange(true);
        try {
            const payload = { siteId, name: trimmedName, icon: formData.icon };
            if (formData.id) {
                await apiClient.put(`/categories/${formData.id}`, payload);
                toast.success('Категорію оновлено');
            } else {
                await apiClient.post('/categories', payload);
                toast.success('Категорію додано');
            }
            fetchData();
            if (!formData.id) handleClear();
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || 'Помилка збереження');
        } finally {
            if (onSavingChange) onSavingChange(false);
        }
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

    const styles = {
        toolbar: {
            minHeight: '72px',
            padding: '12px 20px',
            background: 'var(--platform-bg)',
            border: '1px solid var(--platform-border-color)',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            flexShrink: 0
        },
        gridContainer: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderTop: '1px solid var(--platform-border-color)',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
            boxSizing: 'border-box'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
        },
        card: (isSelected) => ({
            background: 'var(--platform-bg)',
            borderRadius: '12px',
            border: isSelected ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
            padding: '24px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
            position: 'relative',
            boxShadow: isSelected ? '0 8px 20px rgba(var(--platform-accent-rgb), 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
            transform: isSelected ? 'translateY(-2px)' : 'none',
        }),
        panelHeader: {
            height: '72px',
            padding: '0 24px',
            background: 'var(--platform-bg)',
            border: '1px solid var(--platform-border-color)',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
        },
        panelBody: {
            padding: '24px',
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderTop: '1px solid var(--platform-border-color)',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        },
        iconGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginTop: '10px'
        },
        iconOption: (active) => ({
            aspectRatio: '1',
            borderRadius: '10px',
            border: `2px solid ${active ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
            background: active ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-bg)',
            color: active ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'all 0.2s ease',
            height: '100%'
        })
    };

    if (loading) return <div>Loading...</div>;

    const SidebarContent = (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
             <style>{`
                .cat-card:hover { transform: translateY(-5px) !important; box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important; border-color: var(--platform-accent) !important; }
                .cat-card:hover .cat-icon { transform: scale(1.1); color: var(--platform-accent); }
                .cat-card .cat-icon { transition: all 0.3s ease; }
                .icon-option:hover { border-color: var(--platform-accent) !important; background: var(--platform-hover-bg); transform: scale(1.05); }
             `}</style>
             <div style={styles.toolbar}>
                <div style={{display: 'flex', gap: '8px', flex: '1 1 300px', alignItems: 'center'}}>
                    <div style={{flex: 1, minWidth: '150px'}}>
                        <Input
                            leftIcon={<IconSearch size={16}/>}
                            placeholder="Пошук..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{margin: 0, width: '100%'}}
                            wrapperStyle={{margin: 0}}
                        />
                    </div>
                    
                    <div style={{width: '200px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0}}>
                        <div style={{flex: 1}}>
                            <CustomSelect 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                options={SORT_FIELDS}
                                placeholder="Сортування"
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={toggleSortOrder} 
                            style={{ padding: '0', height: '38px', width: '38px', minWidth: '38px', background: 'var(--platform-card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--platform-border-color)' }}
                        >
                            <span style={{ fontSize: '1.2rem', lineHeight: 1, fontWeight: 'bold' }}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </Button>
                    </div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <Button onClick={handleCreateNew} icon={<IconPlus size={16}/>}>Додати</Button>
                </div>
            </div>

            <div style={styles.gridContainer} className="custom-scrollbar">
                <div style={styles.grid}>
                    {processedCategories.map(cat => {
                        const isSelected = activeCategory?.id === cat.id;
                        const count = getProductCount(cat.id);
                        const CatIcon = ICON_MAP[cat.icon] || IconFolder;
                        return (
                            <div key={cat.id} style={styles.card(isSelected)} onClick={() => handleSelectCategory(cat)} className="cat-card">
                                <div style={{position: 'absolute', top: '8px', right: '8px', zIndex: 2}}>
                                    <Button variant="square-danger" onClick={(e) => handleDelete(e, cat.id, cat.name)} style={{width: '28px', height: '28px', opacity: 0.6}} title="Видалити">
                                        <IconTrash size={14}/>
                                    </Button>
                                </div>
                                <div style={{marginBottom: '12px', color: isSelected ? 'var(--platform-accent)' : 'var(--platform-text-secondary)'}} className="cat-icon">
                                    <CatIcon size={42} />
                                </div>
                                <div style={{fontWeight: '600', color: 'var(--platform-text-primary)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', width: '100%'}} title={cat.name}>
                                    {cat.name}
                                </div>
                                <div style={{fontSize: '0.75rem', color: 'var(--platform-text-secondary)', background: isSelected ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-bg)', border: `1px solid ${isSelected ? 'transparent' : 'var(--platform-border-color)'}`, padding: '4px 10px', borderRadius: '20px', fontWeight: '500'}}>
                                    {count} товарів
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const PanelContent = ({ isMobile }) => (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', borderRadius: isMobile ? 0 : '16px', overflow: 'hidden'}}>
            <div style={{...styles.panelHeader, borderTopLeftRadius: isMobile ? 0 : '16px'}}>
                <h3 style={{margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        {isMobile && (
                        <Button variant="ghost" onClick={handleClosePanel} style={{marginRight: '8px', padding: 0, width: '32px', height: '32px'}}>
                            <IconChevronLeft size={20} />
                        </Button>
                    )}
                    {formData.id ? <><IconEdit size={20} /> Редагування</> : <><IconPlus size={20} /> Нова категорія</>}
                </h3>
            </div>

            <form onSubmit={handleSubmit} style={{...styles.panelBody, borderBottomLeftRadius: isMobile ? 0 : '16px'}} className="custom-scrollbar">
                <div style={{marginBottom: '24px'}}>
                    <Input
                        label="Назва категорії"
                        value={formData.name}
                        onChange={handleNameChange}
                        required
                        placeholder="Наприклад: Ноутбуки"
                        maxLength={30}
                        style={{height: '48px', fontSize: '1rem'}}
                    />
                </div>

                <div style={{marginBottom: '24px', flex: 1}}>
                    <label style={{display:'block', marginBottom: '12px', fontSize:'0.95rem', fontWeight:'600', color:'var(--platform-text-primary)'}}>
                        Оберіть іконку
                    </label>
                    <div style={styles.iconGrid}>
                        {AVAILABLE_ICONS.map(iconName => {
                            const IconComponent = ICON_MAP[iconName];
                            const isActive = formData.icon === iconName;
                            return (
                                <div key={iconName} style={styles.iconOption(isActive)} onClick={() => setFormData({...formData, icon: iconName})} title={iconName} className="icon-option">
                                    <IconComponent size={24} />
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div style={{paddingTop: '24px', borderTop: '1px solid var(--platform-border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 'auto'}}>
                    <Button type="button" variant="secondary-danger" onClick={handleClear} title="Очистити форму" style={{justifyContent: 'center', height: '42px'}}>
                        <IconX size={18} /> Скасувати
                    </Button>
                    <Button type="submit" variant="primary" icon={<IconSave size={18}/>} style={{justifyContent: 'center', height: '42px'}}>
                        {formData.id ? 'Зберегти' : 'Створити'}
                    </Button>
                </div>
            </form>
        </div>
    );

    return (
        <SplitViewLayout 
            isOpen={isPanelOpen}
            onToggle={setIsPanelOpen}
            sidebar={SidebarContent}
            content={<PanelContent />}
            sidebarWidth="380px"
        />
    );
};

export default CategoryManager;
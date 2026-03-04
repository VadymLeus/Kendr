// frontend/src/modules/features/shop/components/CategoryManager.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../../shared/api/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../../shared/hooks/useConfirm';
import { Input } from '../../../../../shared/ui/elements/Input';
import { InputWithCounter } from '../../../../../shared/ui/complex/InputWithCounter';
import { Button } from '../../../../../shared/ui/elements/Button';
import CustomSelect from '../../../../../shared/ui/elements/CustomSelect';
import { SplitViewLayout } from '../../../../../shared/ui/layouts/SplitViewLayout';
import EmptyState from '../../../../../shared/ui/complex/EmptyState';
import LoadingState from '../../../../../shared/ui/complex/LoadingState';
import { Search, Folder, Plus, Trash, Edit, ChevronLeft, Save, Star, Home, Heart, Package, Tag, ShoppingBag, Grid, X, Camera, Music, Smartphone, Coffee, Briefcase, Gift, Truck, Zap, MapPin, Image, Video, User, Type, List, Store, CheckCircle, AlertCircle } from 'lucide-react';

const ICON_MAP = {
    folder: Folder, grid: Grid, tag: Tag, bag: ShoppingBag,
    box: Package, star: Star, heart: Heart, home: Home,
    gift: Gift, truck: Truck, zap: Zap, camera: Camera,
    music: Music, phone: Smartphone, coffee: Coffee, briefcase: Briefcase,
    map: MapPin, image: Image, video: Video, user: User
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);
const SORT_FIELDS = [
    { value: 'name', label: 'За назвою', icon: Type },
    { value: 'count', label: 'Кількість товарів', icon: List }
];

const useCategories = (siteId) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
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
    return { categories, products, loading, fetchData, setCategories };
};

const CategoryList = memo(({ 
    categories, products, search, setSearch, 
    sortBy, setSortBy, sortOrder, setSortOrder, 
    activeCategoryId, onSelect, onCreate, onDelete, maxCategories 
}) => {
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
    
    const isLimitReached = maxCategories !== Infinity && categories.length >= maxCategories;
    return (
        <div className="flex flex-col h-full bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl overflow-hidden">
            <div className="min-h-18 p-3 sm:px-5 border-b border-(--platform-border-color) flex justify-between items-center gap-3 flex-wrap bg-(--platform-bg) shrink-0">
                <div className="flex gap-2 flex-1 items-center flex-wrap">
                    <Input
                        leftIcon={<Search size={16}/>}
                        placeholder="Пошук..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        wrapperStyle={{margin: 0, flex: '1 1 180px'}}
                    />
                    <div className="flex gap-1 items-center">
                        <div className="w-48">
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
                            className="w-10.5 h-10.5 p-0 flex items-center justify-center shrink-0"
                        >
                            <span className="text-lg leading-none">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-sm font-semibold text-(--platform-text-secondary) flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--platform-card-bg) border border-(--platform-border-color)">
                        <Folder size={16} />
                        {categories.length} / {maxCategories === Infinity ? '∞' : maxCategories}
                    </div>
                    <Button 
                        onClick={onCreate} 
                        className="h-10.5 shrink-0"
                        disabled={isLimitReached}
                        title={isLimitReached ? "Досягнуто ліміт категорій" : "Додати категорію"}
                    >
                        Додати
                    </Button>
                </div>
            </div>
            {isLimitReached && (
                <div className="px-5 py-2 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-200 dark:border-orange-800/30 text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={14} /> Ви досягли ліміту категорій ({maxCategories}) для вашого тарифу.
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-5 bg-(--platform-card-bg) custom-scrollbar">
                {processedCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                        <EmptyState 
                            title={categories.length === 0 ? "Категорій немає" : "Категорій не знайдено"}
                            description={
                                categories.length === 0 
                                ? "Створіть першу категорію для структурування ваших товарів." 
                                : "За вашим запитом нічого не знайдено. Спробуйте змінити критерії пошуку."
                            }
                            icon={categories.length === 0 ? Store : Search}
                            action={
                                categories.length > 0 && search.trim() !== '' && (
                                    <Button variant="ghost" onClick={() => setSearch('')}>
                                        Очистити пошук
                                    </Button>
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                        {processedCategories.map(cat => {
                            const isSelected = activeCategoryId === cat.id;
                            const count = getProductCount(cat.id);
                            const CatIcon = ICON_MAP[cat.icon] || Folder;
                            return (
                                <div 
                                    key={cat.id} 
                                    onClick={() => onSelect(cat)} 
                                    className={`
                                        group relative flex flex-col items-center text-center p-6 bg-(--platform-bg) rounded-xl border cursor-pointer transition-all duration-200
                                        ${isSelected 
                                            ? 'border-(--platform-accent) ring-2 ring-(--platform-accent)/10 shadow-lg -translate-y-0.5' 
                                            : 'border-(--platform-border-color) hover:border-(--platform-accent) hover:-translate-y-1 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => onDelete(e, cat.id, cat.name)}
                                        className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-(--platform-bg)/90 backdrop-blur-md text-(--platform-text-secondary) opacity-0 group-hover:opacity-100 hover:border-(--platform-danger) hover:text-(--platform-danger) transition-all shadow-sm z-20 cursor-pointer"
                                        title="Видалити"
                                    >
                                        <X size={16} />
                                    </button>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-(--platform-bg)/90 backdrop-blur-md border border-(--platform-border-color) text-(--platform-accent) rounded-lg shadow-sm z-10 animate-in fade-in zoom-in duration-200 group-hover:opacity-0 transition-opacity">
                                            <CheckCircle size={18} />
                                        </div>
                                    )}
                                    <div className={`mb-3 transition-transform duration-300 transform-gpu group-hover:scale-110 ${isSelected ? 'text-(--platform-accent)' : 'text-(--platform-text-secondary) group-hover:text-(--platform-accent)'}`}>
                                        <CatIcon size={42} />
                                    </div>
                                    <div className="font-semibold text-(--platform-text-primary) mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full w-full" title={cat.name}>
                                        {cat.name}
                                    </div>
                                    <div className={`text-xs font-medium px-2.5 py-1 rounded-full border ${isSelected ? 'bg-(--platform-accent)/10 text-(--platform-text-secondary) border-transparent' : 'bg-(--platform-bg) text-(--platform-text-secondary) border-(--platform-border-color)'}`}>
                                        {count} товарів
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});

const CategoryEditor = memo(({ 
    formData, setFormData, onSubmit, onClear, 
    onClose, isMobile, onSavingChange 
}) => {
    const handleSubmit = (e) => {
        onSubmit(e);
    };
    return (
        <div className={`flex flex-col h-full bg-(--platform-card-bg) border border-(--platform-border-color) overflow-hidden ${isMobile ? 'border-0' : 'rounded-2xl'}`}>
            <div className="h-18 px-6 border-b border-(--platform-border-color) flex items-center justify-between bg-(--platform-bg) shrink-0">
                <h3 className="m-0 text-lg font-bold text-(--platform-text-primary) flex items-center gap-2.5">
                    {isMobile && (
                        <Button variant="ghost" onClick={onClose} className="p-0 w-8 h-8 mr-2"><ChevronLeft size={20} /></Button>
                    )}
                    {formData.id ? <><Edit size={20} /> Редагування</> : 'Нова категорія'}
                </h3>
                {!isMobile && (
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-transparent text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-accent) transition-all cursor-pointer"
                    >
                        <X size={20}/>
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-(--platform-card-bg)">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="mb-6">
                        <InputWithCounter
                            label="Назва категорії"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            placeholder="Наприклад: Ноутбуки"
                            limitKey="CATEGORY_NAME"
                            className="h-12 text-base"
                        />
                    </div>
                    <div className="mb-6 flex-1">
                        <label className="block mb-3 text-sm font-semibold text-(--platform-text-primary)">
                            Оберіть іконку
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {AVAILABLE_ICONS.map(iconName => {
                                const IconComponent = ICON_MAP[iconName];
                                const isActive = formData.icon === iconName;
                                return (
                                    <div 
                                        key={iconName} 
                                        onClick={() => setFormData(prev => ({...prev, icon: iconName}))} 
                                        title={iconName} 
                                        className={`
                                            group aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-200
                                            ${isActive 
                                                ? 'border-(--platform-accent) bg-(--platform-accent)/10 text-(--platform-accent)' 
                                                : 'border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-secondary) hover:border-(--platform-accent) hover:bg-(--platform-hover-bg)'
                                            }
                                        `}
                                    >
                                        <div className={`transition-transform duration-200 transform-gpu ${!isActive ? 'group-hover:scale-110' : ''}`}>
                                            <IconComponent size={24} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-(--platform-border-color) grid grid-cols-2 gap-4 mt-auto bg-(--platform-bg) shrink-0">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onClear} 
                        title="Скасувати зміни" 
                        className="justify-center h-10.5"
                    >
                        <X size={18} /> Скасувати
                    </Button>
                    <Button type="submit" variant="primary" icon={<Save size={18}/>} className="justify-center h-10.5">
                        {formData.id ? 'Зберегти' : 'Створити'}
                    </Button>
                </div>
            </form>
        </div>
    );
});

const CategoryManager = ({ siteId, onSavingChange, maxCategories }) => {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchParams, setSearchParams] = useSearchParams();
    const { confirm } = useConfirm();
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [formData, setFormData] = useState({ id: null, name: '', icon: 'folder' });
    const { categories, products, loading, fetchData, setCategories } = useCategories(siteId);
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

    const handleSelectCategory = useCallback((category) => {
        if (activeCategory && activeCategory.id === category.id) {
            setActiveCategory(null);
            setFormData({ id: null, name: '', icon: 'folder' });
            setSearchParams(prev => { prev.delete('categoryId'); return prev; });
            if (window.innerWidth < 1100) setIsPanelOpen(false);
        } else {
            setActiveCategory(category);
            setFormData({ id: category.id, name: category.name, icon: category.icon || 'folder' });
            setIsPanelOpen(true);
            setSearchParams(prev => { prev.set('categoryId', category.id); return prev; });
        }
    }, [activeCategory, setSearchParams]);

    const handleCreateNew = useCallback(() => {
        if (maxCategories !== Infinity && categories.length >= maxCategories) {
            toast.warning(`Досягнуто ліміт категорій (${maxCategories}) для вашого тарифу.`);
            return;
        }
        setActiveCategory(null);
        setFormData({ id: null, name: '', icon: 'folder' });
        setIsPanelOpen(true);
        setSearchParams(prev => { prev.set('categoryId', 'new'); return prev; });
    }, [categories.length, maxCategories, setSearchParams]);

    const handleClear = useCallback(() => {
        setActiveCategory(null);
        setFormData({ id: null, name: '', icon: 'folder' });
        setSearchParams(prev => { prev.delete('categoryId'); return prev; });
        if (window.innerWidth < 1100) setIsPanelOpen(false);
    }, [setSearchParams]);
    
    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false);
        setSearchParams(prev => { prev.delete('categoryId'); return prev; });
    }, [setSearchParams]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const trimmedName = formData.name.trim();
        if (!trimmedName) {
            toast.warning("Введіть назву категорії");
            return;
        }
        if (!formData.id && maxCategories !== Infinity && categories.length >= maxCategories) {
            toast.error(`Досягнуто ліміт категорій (${maxCategories}) для вашого тарифу.`);
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
    }, [formData, categories, maxCategories, onSavingChange, siteId, fetchData, handleClear]);

    const handleDelete = useCallback(async (e, id, name) => {
        e.stopPropagation();
        if (await confirm({ title: 'Видалити категорію?', message: `Ви впевнені, що хочете видалити категорію "${name}"?`, type: 'danger', confirmLabel: 'Видалити' })) {
            if (onSavingChange) onSavingChange(true);
            try {
                await apiClient.delete(`/categories/${id}`);
                if (activeCategory?.id === id) handleCreateNew();
                fetchData();
                toast.success('Категорію видалено');
            } catch (err) { 
                toast.error('Не вдалося видалити'); 
            } finally { 
                if (onSavingChange) onSavingChange(false); 
            }
        }
    }, [confirm, onSavingChange, activeCategory, handleCreateNew, fetchData]);
    
    if (loading) return <LoadingState title="Завантаження категорій..." />;
    return (
        <SplitViewLayout 
            isOpen={isPanelOpen}
            onToggle={setIsPanelOpen}
            sidebar={
                <CategoryList 
                    categories={categories}
                    products={products}
                    search={search}
                    setSearch={setSearch}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    activeCategoryId={activeCategory?.id}
                    onSelect={handleSelectCategory}
                    onCreate={handleCreateNew}
                    onDelete={handleDelete}
                    maxCategories={maxCategories}
                />
            }
            content={
                <CategoryEditor 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onClear={handleClear}
                    onClose={handleClosePanel}
                    onSavingChange={onSavingChange}
                    isMobile={window.innerWidth < 1100}
                />
            }
            sidebarWidth="380px"
        />
    );
};

export default CategoryManager;
// frontend/src/modules/dashboard/features/commerce/components/ProductManager.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../../../shared/api/api';
import ConfirmModal from '../../../../../shared/ui/complex/ConfirmModal';
import { Input } from '../../../../../shared/ui/elements/Input';
import { InputWithCounter } from '../../../../../shared/ui/complex/InputWithCounter';
import { Button } from '../../../../../shared/ui/elements/Button';
import CustomSelect from '../../../../../shared/ui/elements/CustomSelect';
import MediaPickerModal from '../../../../media/components/MediaPickerModal';
import { SplitViewLayout } from '../../../../../shared/ui/layouts/SplitViewLayout';
import EmptyState from '../../../../../shared/ui/complex/EmptyState';
import LoadingState from '../../../../../shared/ui/complex/LoadingState';
import { TEXT_LIMITS } from '../../../../../shared/config/limits';
import { BASE_URL } from '../../../../../shared/config';
import { ChevronLeft, Type, List, Search, Plus, Store, CheckCircle, Image, Trash, Edit, Save, Undo, X, Package, Download, AlertCircle } from 'lucide-react';

const SORT_FIELDS = [
    { value: 'name', label: 'За назвою', icon: Type },
    { value: 'price', label: 'За ціною', icon: List },
    { value: 'stock', label: 'За залишком', icon: List }
];

const getValidImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

const useProducts = (siteId) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category: 'all', sortBy: 'name', type: 'all' });
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                apiClient.get(`/products/site/${siteId}`),
                apiClient.get(`/categories/site/${siteId}`)
            ]);
            const productsData = (pRes.data || []).map(p => ({
                ...p,
                type: p.type || 'physical',
                variants: Array.isArray(p.variants) ? p.variants : 
                          (typeof p.variants === 'string' ? JSON.parse(p.variants) : []),
                image_gallery: Array.isArray(p.image_gallery) ? p.image_gallery : 
                               (typeof p.image_gallery === 'string' ? JSON.parse(p.image_gallery) : 
                               (p.image_url ? [p.image_url] : [])),
                category_ids: Array.isArray(p.categories) ? p.categories.map(c => c.id.toString()) : []
            }));
            setProducts(productsData);
            setCategories(cRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження');
        } finally {
            setLoading(false);
        }
    }, [siteId]);
    useEffect(() => { fetchData(); }, [fetchData]);
    const handleDelete = useCallback(async (id, onSuccess) => {
        try {
            await apiClient.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
            if (onSuccess) onSuccess();
            toast.success('Товар видалено');
        } catch (err) {
            toast.error('Помилка видалення');
        }
    }, []);
    return { 
        products, categories, loading, filters, setFilters,
        fetchData, handleDelete
    };
};

const VariantEditor = memo(({ variant, onChange, onRemove }) => {
    const [inputState, setInputState] = useState({ label: '', price: '', sale: '' });
    const [editingIndex, setEditingIndex] = useState(null);
    const [isVariantDeleteModalOpen, setIsVariantDeleteModalOpen] = useState(false);
    const [valueToDelete, setValueToDelete] = useState(null);
    useEffect(() => {
        if (editingIndex !== null && variant.values[editingIndex]) {
            const val = variant.values[editingIndex];
            setInputState({ 
                label: val.label, 
                price: val.priceModifier || '', 
                sale: val.salePercentage || '' 
            });
        } else {
            setInputState({ label: '', price: '', sale: '' });
        }
    }, [editingIndex, variant.values]);
    const handleSaveValue = () => {
        if (!inputState.label.trim()) return;
        const valueData = { 
            label: inputState.label.trim(), 
            priceModifier: parseFloat(inputState.price) || 0,
            salePercentage: parseInt(inputState.sale) || 0
        };
        let newValues = [...(variant.values || [])];
        if (editingIndex !== null) {
            newValues[editingIndex] = valueData;
        } else {
            newValues.push(valueData);
        }
        onChange({ ...variant, values: newValues });
        setEditingIndex(null);
        setInputState({ label: '', price: '', sale: '' });
    };
    return (
        <div className="bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-4 mb-3 relative">
            <div className="flex justify-between gap-2 mb-4">
                <Input 
                    value={variant.name} 
                    onChange={(e) => onChange({...variant, name: e.target.value})}
                    placeholder="Назва варіанту (напр. Розмір)"
                    className="m-0 font-semibold text-[0.95rem]"
                    wrapperStyle={{margin: 0, flex: 1}}
                />
                <button 
                    type="button"
                    onClick={() => setIsVariantDeleteModalOpen(true)} 
                    title="Видалити варіант"
                    className="h-10.5 w-10.5 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-transparent text-(--platform-text-secondary) hover:border-(--platform-danger) hover:text-(--platform-danger) transition-all cursor-pointer"
                >
                    <X size={18}/>
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                {variant.values && variant.values.map((val, idx) => {
                    const isActive = idx === editingIndex;
                    return (
                        <div 
                            key={idx} 
                            onClick={() => setEditingIndex(idx)}
                            className={`
                                flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm cursor-pointer border transition-all duration-200
                                ${isActive 
                                    ? 'bg-(--platform-accent)/10 border-(--platform-accent)' 
                                    : 'bg-(--platform-card-bg) border-(--platform-border-color) hover:border-(--platform-text-secondary)'
                                }
                            `}
                        >
                            <span>{val.label}</span>
                            {(val.priceModifier !== 0 || val.salePercentage > 0) && (
                                <span className="text-xs opacity-70">
                                    {val.priceModifier > 0 && `+${val.priceModifier}`}
                                    {val.salePercentage > 0 && ` (-${val.salePercentage}%)`}
                                </span>
                            )}
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setValueToDelete(idx);
                                }} 
                                title="Видалити значення"
                                className="h-6 w-6 ml-1 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-transparent text-(--platform-text-secondary) hover:border-(--platform-danger) hover:text-(--platform-danger) transition-all cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className={`
                border-t border-dashed border-(--platform-border-color) pt-4
                ${editingIndex !== null ? 'bg-(--platform-card-bg) rounded-lg p-3 mt-2' : ''}
            `}>
                <div className="text-sm font-semibold mb-3 text-(--platform-text-secondary) flex items-center gap-1.5">
                    {editingIndex !== null ? <><Edit size={14}/> Редагування значення</> : <><Plus size={14}/> Додати значення</>}
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 items-start mb-3">
                    <Input placeholder="Значення (XL)" value={inputState.label} onChange={e => setInputState({...inputState, label: e.target.value})} className="m-0" wrapperStyle={{margin:0}} />
                    <Input placeholder="+Ціна" type="number" value={inputState.price} onChange={e => setInputState({...inputState, price: e.target.value})} className="m-0" wrapperStyle={{margin:0}} />
                    <Input placeholder="Зниж. %" type="number" value={inputState.sale} onChange={e => setInputState({...inputState, sale: e.target.value})} className="m-0" wrapperStyle={{margin:0}} />
                </div>
                <div className="flex gap-2.5 mt-2.5">
                    {editingIndex !== null && (
                        <Button variant="secondary" onClick={() => {setEditingIndex(null); setInputState({label:'', price:'', sale:''});}} className="flex-1 justify-center h-10 text-sm" title="Скасувати">
                            <X size={16}/> Скасувати
                        </Button>
                    )}
                    <Button onClick={handleSaveValue} className="flex-1 justify-center h-10 text-sm">
                        {editingIndex !== null ? <><Save size={16}/> Зберегти</> : <><Plus size={16}/> Додати</>}
                    </Button>
                </div>
            </div>
            <ConfirmModal
                isOpen={isVariantDeleteModalOpen}
                title="Видалення варіанту"
                message={`Ви впевнені, що хочете видалити варіант "${variant.name || 'Без назви'}" та всі його значення?`}
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={() => {
                    setIsVariantDeleteModalOpen(false);
                    onRemove();
                }}
                onCancel={() => setIsVariantDeleteModalOpen(false)}
                type="danger"
            />
            <ConfirmModal
                isOpen={valueToDelete !== null}
                title="Видалення значення"
                message={`Ви впевнені, що хочете видалити значення "${valueToDelete !== null ? variant.values[valueToDelete]?.label : ''}"?`}
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={() => {
                    const newValues = variant.values.filter((_, i) => i !== valueToDelete);
                    onChange({ ...variant, values: newValues });
                    if (editingIndex === valueToDelete) setEditingIndex(null);
                    setValueToDelete(null);
                }}
                onCancel={() => setValueToDelete(null)}
                type="danger"
            />
        </div>
    );
});

const ProductTable = memo(({ 
    products, categories, loading, filters, setFilters, 
    sortOrder, setSortOrder, sortFields, onSelect, 
    onCreate, onDelete, selectedId, maxProducts 
}) => {
    const categoryOptions = [
        { value: 'all', label: 'Всі категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];
    const typeOptions = [
        { value: 'all', label: 'Всі типи' },
        { value: 'physical', label: 'Фізичні' },
        { value: 'digital', label: 'Цифрові' }
    ];
    
    const hasActiveFilters = filters.search.trim() !== '' || filters.category !== 'all' || filters.type !== 'all';
    const isLimitReached = maxProducts !== Infinity && products.length >= maxProducts;
    if (loading) return <LoadingState title="Завантаження товарів..." />;
    return (
        <div className="flex flex-col h-full bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) overflow-hidden">
            <div className="min-h-18 p-3 sm:px-5 border-b border-(--platform-border-color) flex justify-between items-center gap-3 flex-wrap bg-(--platform-bg)">
                <div className="flex gap-2 flex-1 items-center flex-wrap">
                    <Input 
                        leftIcon={<Search size={16}/>}
                        placeholder="Пошук..." 
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        wrapperStyle={{margin: 0, flex: '1 1 180px'}}
                    />
                    <div className="w-36">
                        <CustomSelect 
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                            options={typeOptions}
                        />
                    </div>
                    <div className="w-40">
                        <CustomSelect 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                            options={categoryOptions}
                        />
                    </div>
                    <div className="flex gap-1 items-center">
                        <div className="w-36">
                            <CustomSelect 
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value}))}
                                options={sortFields}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="w-10.5 h-10.5 p-0 flex items-center justify-center shrink-0"
                        >
                            <span className="text-lg leading-none">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-sm font-semibold text-(--platform-text-secondary) flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--platform-card-bg) border border-(--platform-border-color)">
                        <Package size={16} />
                        {products.length} / {maxProducts === Infinity ? '∞' : maxProducts}
                    </div>
                    <Button 
                        onClick={onCreate} 
                        className="h-10.5 shrink-0"
                        disabled={isLimitReached}
                        title={isLimitReached ? "Досягнуто ліміт товарів" : "Додати товар"}
                    >
                        Додати
                    </Button>
                </div>
            </div>
            {isLimitReached && (
                <div className="px-5 py-2 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-200 dark:border-orange-800/30 text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={14} /> Ви досягли ліміту товарів ({maxProducts}) для вашого тарифу.
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                        <EmptyState 
                            title={hasActiveFilters ? "Товарів не знайдено" : "Товарів немає"}
                            description={
                                hasActiveFilters 
                                ? "За вашим запитом або фільтрами нічого не знайдено. Спробуйте змінити критерії пошуку." 
                                : "Додайте свій перший товар, щоб почати продавати."
                            }
                            icon={hasActiveFilters ? Search : Store}
                            action={
                                hasActiveFilters && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setFilters({ search: '', category: 'all', sortBy: 'name', type: 'all' })}
                                    >
                                        Очистити фільтри
                                    </Button>
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 content-start">
                        {products.map(product => {
                            const isSelected = selectedId === product.id;
                            let categoryDisplay = '';
                            if (product.categories && product.categories.length > 0) {
                                categoryDisplay = product.categories.map(c => c.name).join(', ');
                            }
                            return (
                                <div 
                                    key={product.id} 
                                    onClick={() => onSelect(product)} 
                                    className={`
                                        group relative flex flex-col h-full bg-(--platform-bg) rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                                        ${isSelected 
                                            ? 'border-(--platform-accent) ring-1 ring-(--platform-accent) shadow-md -translate-y-1' 
                                            : 'border-(--platform-border-color) hover:border-(--platform-text-secondary)/30 hover:-translate-y-1 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="aspect-4/3 w-full bg-(--platform-hover-bg) relative border-b border-(--platform-border-color) flex items-center justify-center overflow-hidden shrink-0">
                                         {product.image_gallery?.[0] ? (
                                            <img src={getValidImageUrl(product.image_gallery[0])} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                         ) : (
                                            <Image size={40} className="opacity-20 text-(--platform-text-secondary)" />
                                         )}
                                         <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                                            {product.type === 'digital' ? (
                                                <div className="px-2.5 py-1 bg-(--platform-bg)/90 backdrop-blur-md rounded-lg text-[0.7rem] uppercase tracking-wider font-bold shadow-sm flex items-center gap-1.5 border border-(--platform-border-color) text-(--platform-accent)">
                                                    <Download size={12}/> Цифровий
                                                </div>
                                            ) : (
                                                <div className={`
                                                    px-2.5 py-1 bg-(--platform-bg)/90 backdrop-blur-md rounded-lg text-[0.7rem] uppercase tracking-wider font-bold shadow-sm flex items-center gap-1.5 border border-(--platform-border-color)
                                                    ${product.stock_quantity > 0 ? 'text-(--platform-success, #10b981)' : 'text-(--platform-danger)'}
                                                `}>
                                                    <Package size={12}/> {product.stock_quantity || 0} шт.
                                                </div>
                                            )}
                                         </div>
                                         {categoryDisplay && (
                                            <div className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] z-10">
                                                <div className="px-2.5 py-1 bg-(--platform-bg)/90 backdrop-blur-md rounded-lg text-[0.7rem] uppercase tracking-wider font-bold shadow-sm border border-(--platform-border-color) text-(--platform-text-secondary) truncate">
                                                    {categoryDisplay}
                                                </div>
                                            </div>
                                         )}
                                         <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onDelete(product); }}
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
                                    </div>
                                    <div className="p-4 flex flex-1 flex-col gap-3">
                                        <div className="font-semibold text-[0.95rem] leading-snug line-clamp-2 text-(--platform-text-primary)" title={product.name}>
                                            {product.name}
                                        </div>
                                        <div className="mt-auto flex items-center gap-2 pt-1">
                                            <div className="font-bold text-(--platform-text-primary) text-lg">
                                                {product.price}
                                            </div>
                                            {product.sale_percentage > 0 && (
                                                <div className="text-[0.7rem] font-bold text-(--platform-danger) bg-(--platform-danger)/10 px-2 py-1 rounded-md">
                                                    -{product.sale_percentage}%
                                                </div>
                                            )}
                                        </div>
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

const ProductEditorPanel = ({ 
    productToEdit, siteId, categories, onSuccess, 
    onSavingChange, onClose, onCancel, 
    isMobile 
}) => {
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const initialFormData = {
        id: null, name: '', description: '', price: 0,
        stock_quantity: 1, category_ids: [], image_gallery: [],
        variants: [], sale_percentage: 0,
        type: 'physical', digital_file_url: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const DESCRIPTION_LIMIT = 2000;
    const formCategoryOptions = categories.map(c => ({ value: c.id.toString(), label: c.name }));
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                ...productToEdit,
                category_ids: productToEdit.category_ids || [],
                type: productToEdit.type || 'physical',
                digital_file_url: productToEdit.digital_file_url || ''
            });
        } else {
            setFormData(initialFormData);
        }
    }, [productToEdit]);
    
    const handleClearForm = () => {
        setFormData(initialFormData);
        if (onCancel) onCancel();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.type === 'digital' && !formData.digital_file_url?.trim()) {
            toast.warning("Для цифрового товару обов'язково вкажіть посилання або текст!");
            return;
        }
        onSavingChange(true);
        try {
            const payload = { ...formData, site_id: siteId };
            if (payload.type === 'digital') {
                payload.stock_quantity = null;
            } else {
                payload.digital_file_url = null;
            }
            if (formData.id) await apiClient.put(`/products/${formData.id}`, payload);
            else await apiClient.post(`/products`, payload);
            toast.success('Збережено');
            onSuccess();
        } catch (e) { 
            toast.error('Помилка збереження'); 
        } finally { 
            onSavingChange(false); 
        }
    };

    return (
        <div className={`
            flex flex-col h-full bg-(--platform-card-bg) border border-(--platform-border-color) overflow-hidden
            ${isMobile ? 'border-0' : 'rounded-2xl'}
        `}>
            <MediaPickerModal
                isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)}
                onSelect={(files) => {
                    const paths = files.map(f => f.path_full);
                    setFormData(prev => ({...prev, image_gallery: [...new Set([...prev.image_gallery, ...paths])]}));
                    setShowMediaPicker(false);
                }}
                multiple={true} allowedTypes={['image']}
            />
            <div className="h-18 px-6 border-b border-(--platform-border-color) flex items-center justify-between bg-(--platform-bg) shrink-0">
                <h3 className="m-0 text-lg font-bold flex items-center gap-2.5 text-(--platform-text-primary)">
                    {isMobile && (
                        <Button variant="ghost" onClick={onClose} className="p-0 w-8 hover:bg-(--platform-hover-bg)"><ChevronLeft size={20}/></Button>
                    )}
                    {formData.id ? <><Edit size={20}/> Редагування</> : 'Новий товар'}
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
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-(--platform-text-primary)">Тип товару</label>
                        <div className="flex bg-(--platform-bg) p-1 rounded-lg gap-1 border border-(--platform-border-color)">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'physical'})}
                                className={`
                                    flex-1 py-2.5 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none outline-none
                                    ${formData.type === 'physical' 
                                        ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-[0_1px_3px_rgba(0,0,0,0.1)] font-semibold' 
                                        : 'text-(--platform-text-secondary) bg-transparent hover:text-(--platform-text-primary) hover:bg-(--platform-hover-bg)'}
                                `}
                            >
                                <Package size={16} />
                                Фізичний
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'digital'})}
                                className={`
                                    flex-1 py-2.5 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none outline-none
                                    ${formData.type === 'digital' 
                                        ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-[0_1px_3px_rgba(0,0,0,0.1)] font-semibold' 
                                        : 'text-(--platform-text-secondary) bg-transparent hover:text-(--platform-text-primary) hover:bg-(--platform-hover-bg)'}
                                `}
                            >
                                <Download size={16} />
                                Цифровий
                            </button>
                        </div>
                    </div>

                    <InputWithCounter 
                        label="Назва" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required 
                        limitKey="PRODUCT_NAME"
                    />
                    <div className="flex gap-3">
                        <Input 
                            label="Ціна" 
                            type="number" 
                            value={formData.price} 
                            onChange={e => setFormData({...formData, price: e.target.value})} 
                            wrapperStyle={{flex: 1}} 
                            required
                        />
                        <Input 
                            label="Знижка (%)" 
                            type="number" 
                            value={formData.sale_percentage} 
                            onChange={e => setFormData({...formData, sale_percentage: e.target.value})} 
                            wrapperStyle={{flex: 1}} 
                        />
                    </div>
                    {formData.type === 'physical' ? (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Input 
                                label="Залишок на складі (шт.)" 
                                type="number" 
                                value={formData.stock_quantity === null ? '' : formData.stock_quantity} 
                                onChange={e => setFormData({...formData, stock_quantity: e.target.value})} 
                                min="0"
                            />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Input 
                                label="Посилання на файл або секретний текст" 
                                type="text" 
                                value={formData.digital_file_url} 
                                onChange={e => setFormData({...formData, digital_file_url: e.target.value})} 
                                placeholder="https://drive.google.com/..." 
                                helperText="Покупець автоматично отримає це на email після успішної оплати."
                            />
                        </div>
                    )}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-(--platform-text-primary)">
                            Категорії (макс. 3)
                        </label>
                        <CustomSelect 
                            multiple={true}
                            maxSelections={3}
                            value={formData.category_ids || []} 
                            onChange={(e) => setFormData(prev => ({...prev, category_ids: e.target.value}))}
                            options={formCategoryOptions}
                            placeholder="Оберіть категорії..."
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-(--platform-text-primary)">Галерея</label>
                        <div className="grid grid-cols-4 gap-2">
                            {formData.image_gallery.map((img, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-(--platform-border-color) relative group">
                                    <img src={getValidImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-start justify-end p-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({...p, image_gallery: p.image_gallery.filter((_, idx) => idx !== i)}))} 
                                            className="h-8 w-8 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-(--platform-card-bg) text-(--platform-text-secondary) hover:border-(--platform-danger) hover:text-(--platform-danger) transition-all cursor-pointer shadow-sm"
                                        >
                                            <X size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => setShowMediaPicker(true)} 
                                className="aspect-square border border-dashed border-(--platform-border-color) rounded-lg flex items-center justify-center p-0 cursor-pointer bg-(--platform-bg) text-(--platform-text-secondary) transition-all duration-200 hover:border-(--platform-accent) hover:text-(--platform-accent) hover:bg-(--platform-hover-bg)"
                            >
                                <Plus size={24}/>
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-(--platform-border-color) pt-5">
                         <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-sm text-(--platform-text-primary)">Варіанти товару</span>
                            <Button type="button" variant="outline" onClick={() => setFormData(p => ({...p, variants: [...p.variants, {id: Date.now(), name: '', values: []}]}))} className="h-7.5 text-[0.8rem]"><Plus size={14}/> Додати</Button>
                         </div>
                         {formData.variants.map((v, i) => (
                            <VariantEditor key={v.id} variant={v} onRemove={() => setFormData(p => ({...p, variants: p.variants.filter((_, idx) => idx !== i)}))} onChange={upd => {
                                const vts = [...formData.variants]; vts[i] = upd; setFormData(p => ({...p, variants: vts}));
                            }} />
                         ))}
                    </div>
                    <div>
                        <textarea 
                            className="w-full min-h-25 p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) resize-y custom-scrollbar focus:outline-none focus:ring-2 focus:ring-(--platform-accent)/20 focus:border-(--platform-accent)"
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            placeholder="Опис товару..." 
                            maxLength={DESCRIPTION_LIMIT}
                        />
                        <div className="text-right text-[11px] text-(--platform-text-secondary) mt-1">
                            {formData.description.length} / {DESCRIPTION_LIMIT}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-(--platform-border-color) grid grid-cols-2 gap-4 mt-auto bg-(--platform-bg) shrink-0">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleClearForm} 
                        className="justify-center h-10.5"
                    >
                        <X size={18}/> Скасувати
                    </Button>
                    <Button type="submit" variant="primary" icon={<Save size={18}/>} className="justify-center h-10.5">
                        Зберегти
                    </Button>
                </div>
            </form>
        </div>
    );
};

const ProductManager = ({ siteId, onSavingChange, maxProducts }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        products, categories, loading, filters, setFilters, fetchData, handleDelete
    } = useProducts(siteId);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [activeProduct, setActiveProduct] = useState(null); 
    const [sortOrder, setSortOrder] = useState('asc');
    const [productToDelete, setProductToDelete] = useState(null);
    useEffect(() => {
        const prodIdFromUrl = searchParams.get('productId');
        if (!loading && products.length > 0) {
            if (prodIdFromUrl === 'new') {
                setActiveProduct(null);
                setIsPanelOpen(true);
            } else if (prodIdFromUrl) {
                const productToEdit = products.find(p => p.id.toString() === prodIdFromUrl);
                if (productToEdit) {
                    setActiveProduct(productToEdit);
                    setIsPanelOpen(true);
                }
            }
        }
    }, [loading, products, searchParams]);
    
    const processedProducts = useMemo(() => {
        let result = products.filter(product => {
            const matchesSearch = filters.search === '' || 
                product.name.toLowerCase().includes(filters.search.toLowerCase());
            const matchesCategory = filters.category === 'all' || 
                (product.category_ids && product.category_ids.includes(filters.category));
            const matchesType = filters.type === 'all' || product.type === filters.type;
            return matchesSearch && matchesCategory && matchesType;
        });
        result.sort((a, b) => {
            let comp = 0;
            if (filters.sortBy === 'name') comp = a.name.localeCompare(b.name);
            if (filters.sortBy === 'price') comp = a.price - b.price;
            if (filters.sortBy === 'stock') comp = a.stock_quantity - b.stock_quantity;
            return sortOrder === 'asc' ? comp : comp * -1;
        });
        return result;
    }, [products, filters, sortOrder]);
    
    const handleProductSelect = useCallback((product) => {
        if (activeProduct && activeProduct.id === product.id) {
            setActiveProduct(null);
            setSearchParams(prev => { prev.delete('productId'); return prev; });
        } else {
            setActiveProduct(product);
            setIsPanelOpen(true); 
            setSearchParams(prev => { prev.set('productId', product.id); return prev; });
        }
    }, [activeProduct, setSearchParams]);
    
    const handleCreateNew = useCallback(() => {
        if (maxProducts !== Infinity && products.length >= maxProducts) {
            toast.warning(`Досягнуто ліміт товарів (${maxProducts}) для вашого тарифу.`);
            return;
        }
        setActiveProduct(null);
        setIsPanelOpen(true);
        setSearchParams(prev => { prev.set('productId', 'new'); return prev; });
    }, [maxProducts, products.length, setSearchParams]);
    
    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false);
        setSearchParams(prev => { prev.delete('productId'); return prev; });
    }, [setSearchParams]);
    
    const handleCancelForm = useCallback(() => {
        setActiveProduct(null);
        setSearchParams(prev => { prev.delete('productId'); return prev; });
        if (window.innerWidth < 1100) {
            setIsPanelOpen(false);
        }
    }, [setSearchParams]);
    
    const handleRequestDelete = useCallback((product) => {
        setProductToDelete(product);
    }, []);
    
    const handleConfirmDelete = useCallback(() => {
        if (productToDelete) {
            handleDelete(productToDelete.id, () => {
                if (activeProduct && activeProduct.id === productToDelete.id) {
                    handleClosePanel();
                    setActiveProduct(null);
                }
            });
            setProductToDelete(null);
        }
    }, [productToDelete, handleDelete, activeProduct, handleClosePanel]);
    
    return (
        <>
            <SplitViewLayout
                isOpen={isPanelOpen}
                onToggle={setIsPanelOpen}
                sidebar={
                    <ProductTable
                        products={processedProducts}
                        categories={categories}
                        loading={loading}
                        filters={filters}
                        setFilters={setFilters}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        sortFields={SORT_FIELDS}
                        onSelect={handleProductSelect}
                        onCreate={handleCreateNew}
                        onDelete={handleRequestDelete}
                        selectedId={activeProduct?.id}
                        maxProducts={maxProducts}
                    />
                }
                content={
                    <ProductEditorPanel
                        productToEdit={activeProduct}
                        siteId={siteId}
                        categories={categories}
                        onSuccess={fetchData}
                        onClose={handleClosePanel}
                        onCancel={handleCancelForm}
                        onSavingChange={onSavingChange}
                    />
                }
            />
            <ConfirmModal
                isOpen={!!productToDelete}
                title="Видалення товару"
                message={`Ви впевнені, що хочете видалити товар "${productToDelete?.name}"? Цю дію неможливо скасувати.`}
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={handleConfirmDelete}
                onCancel={() => setProductToDelete(null)}
                type="danger"
            />
        </>
    );
};

export default ProductManager;
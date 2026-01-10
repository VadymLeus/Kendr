// frontend/src/modules/dashboard/features/ProductManager.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { Input } from '../../../shared/ui/elements/Input';
import { Button } from '../../../shared/ui/elements/Button';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import MediaPickerModal from '../../media/components/MediaPickerModal';
import { SplitViewLayout } from '../../../shared/ui/layouts/SplitViewLayout';
import { 
    IconChevronLeft, IconChevronRight, IconType, 
    IconList, IconSearch, IconPlus, IconShop, 
    IconCheckCircle, IconImage, IconTrash, 
    IconEdit, IconSave, IconUndo, IconX, IconSettings 
} from '../../../shared/ui/elements/Icons';

const API_URL = 'http://localhost:5000';

const SORT_FIELDS = [
    { value: 'name', label: 'За назвою', icon: IconType },
    { value: 'price', label: 'За ціною', icon: IconList },
    { value: 'stock', label: 'За залишком', icon: IconList }
];

const useProducts = (siteId) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category: 'all' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                apiClient.get(`/products/site/${siteId}`),
                apiClient.get(`/categories/site/${siteId}`)
            ]);
            
            const productsData = (pRes.data || []).map(p => ({
                ...p,
                variants: Array.isArray(p.variants) ? p.variants : 
                         (typeof p.variants === 'string' ? JSON.parse(p.variants) : []),
                image_gallery: Array.isArray(p.image_gallery) ? p.image_gallery : 
                             (typeof p.image_gallery === 'string' ? JSON.parse(p.image_gallery) : 
                             (p.image_url ? [p.image_url] : []))
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
        <div className="bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-4 mb-3">
            <div className="flex justify-between gap-2 mb-4">
                <Input 
                    value={variant.name} 
                    onChange={(e) => onChange({...variant, name: e.target.value})}
                    placeholder="Назва опції (напр. Розмір)"
                    style={{margin: 0, fontWeight: '600', fontSize: '0.95rem'}}
                    wrapperStyle={{margin: 0, flex: 1}}
                />
                <Button variant="square-danger" onClick={onRemove} title="Видалити опцію">
                    <IconTrash size={18}/>
                </Button>
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
                            <span 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newValues = variant.values.filter((_, i) => i !== idx);
                                    onChange({ ...variant, values: newValues });
                                    if (editingIndex === idx) setEditingIndex(null);
                                }} 
                                className="opacity-50 hover:opacity-100 hover:text-red-500 ml-1 flex items-center"
                            >
                                <IconX size={14} />
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className={`
                border-t border-dashed border-(--platform-border-color) pt-4
                ${editingIndex !== null ? 'bg-(--platform-card-bg) rounded-lg p-3 mt-2' : ''}
            `}>
                <div className="text-sm font-semibold mb-3 text-(--platform-text-secondary) flex items-center gap-1.5">
                    {editingIndex !== null ? <><IconEdit size={14}/> Редагування значення</> : <><IconPlus size={14}/> Додати значення</>}
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 items-start mb-3">
                    <Input placeholder="Значення (XL)" value={inputState.label} onChange={e => setInputState({...inputState, label: e.target.value})} style={{margin:0}} wrapperStyle={{margin:0}} />
                    <Input placeholder="+Ціна" type="number" value={inputState.price} onChange={e => setInputState({...inputState, price: e.target.value})} style={{margin:0}} wrapperStyle={{margin:0}} />
                    <Input placeholder="Зниж. %" type="number" value={inputState.sale} onChange={e => setInputState({...inputState, sale: e.target.value})} style={{margin:0}} wrapperStyle={{margin:0}} />
                </div>
                <div className="flex gap-2.5 mt-2.5">
                    <Button onClick={handleSaveValue} style={{flex: 1, justifyContent: 'center'}}>
                        {editingIndex !== null ? <><IconSave size={18}/> Зберегти зміни</> : <><IconPlus size={18}/> Додати</>}
                    </Button>
                    {editingIndex !== null && (
                        <Button variant="secondary" onClick={() => {setEditingIndex(null); setInputState({label:'', price:'', sale:''});}} style={{flex: 1, justifyContent: 'center'}} title="Скасувати">
                            <IconUndo size={18}/> Скасувати
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
});

const ProductTable = memo(({ 
    products, categories, loading, filters, setFilters, 
    sortOrder, setSortOrder, sortFields, onSelect, 
    onCreate, onDelete, selectedId, API_URL 
}) => {
    const categoryOptions = [
        { value: 'all', label: 'Всі категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

    if (loading) return <div className="p-10 text-center text-(--platform-text-secondary)">Завантаження...</div>;

    return (
        <div className="flex flex-col h-full bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) overflow-hidden">
            <div className="min-h-18 p-3 sm:px-5 border-b border-(--platform-border-color) flex justify-between items-center gap-3 flex-wrap bg-(--platform-bg)">
                <div className="flex gap-2 flex-1 items-center flex-wrap">
                    <Input 
                        leftIcon={<IconSearch size={16}/>}
                        placeholder="Пошук..." 
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        wrapperStyle={{margin: 0, flex: '1 1 200px'}}
                    />
                    <div className="w-45">
                        <CustomSelect 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                            options={categoryOptions}
                        />
                    </div>
                    <div className="flex gap-1 items-center">
                        <div className="w-40">
                            <CustomSelect 
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value}))}
                                options={sortFields}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <span className="text-lg leading-none">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        </Button>
                    </div>
                </div>
                <Button onClick={onCreate} icon={<IconPlus size={18}/>} style={{height: '42px'}}>Додати</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-(--platform-text-secondary) py-10">
                        <div className="w-20 h-20 rounded-full bg-(--platform-bg) border border-(--platform-border-color) flex items-center justify-center mb-4">
                            <IconShop size={40} className="opacity-30"/>
                        </div>
                        <h3 className="text-lg font-semibold text-(--platform-text-primary) mb-1">Товарів не знайдено</h3>
                        <p className="text-sm opacity-70 max-w-62.5 text-center mb-6">
                            Спробуйте змінити фільтри або додайте новий товар.
                        </p>
                        <Button onClick={onCreate} variant="secondary">
                            Додати перший товар
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 content-start">
                        {products.map(product => {
                            const isSelected = selectedId === product.id;
                            return (
                                <div 
                                    key={product.id} 
                                    onClick={() => onSelect(product)} 
                                    className={`
                                        group relative flex flex-col h-full bg-(--platform-bg) rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                                        ${isSelected 
                                            ? 'border-(--platform-accent) ring-2 ring-(--platform-accent)/20 shadow-lg -translate-y-1' 
                                            : 'border-(--platform-border-color) hover:border-(--platform-accent) hover:-translate-y-1 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="h-35 bg-slate-50 relative border-b border-(--platform-border-color) flex items-center justify-center overflow-hidden">
                                         {product.image_gallery?.[0] ? (
                                            <img src={`${API_URL}${product.image_gallery[0]}`} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                         ) : (
                                            <IconImage size={32} className="opacity-20 text-slate-400" />
                                         )}
                                         
                                         <div className={`
                                            absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[0.7rem] font-bold z-10 border border-slate-100
                                            ${product.stock_quantity > 0 ? 'text-emerald-500' : 'text-red-500'}
                                         `}>
                                             {product.stock_quantity} шт.
                                         </div>
                                         
                                         <button
                                             onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                                             className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer z-20 text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:border-red-500 hover:scale-110"
                                             title="Видалити"
                                         >
                                            <IconX size={16} />
                                         </button>
 
                                         {isSelected && (
                                            <div className="absolute top-2 right-10 text-(--platform-accent) bg-white rounded-full p-0.5 shadow-sm z-10 animate-in fade-in zoom-in duration-200">
                                                <IconCheckCircle size={20} />
                                            </div>
                                         )}
                                    </div>
                                    <div className="p-3 flex flex-1 flex-col justify-between gap-2">
                                        <div className="font-medium text-sm leading-tight line-clamp-2 text-(--platform-text-primary)">
                                            {product.name}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="font-bold text-(--platform-text-primary) text-base">
                                                {product.price} ₴
                                            </div>
                                            {product.sale_percentage > 0 && (
                                                <div className="text-xs text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
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
        stock_quantity: 1, category_id: '', image_gallery: [],
        variants: [], sale_percentage: 0
    };
    
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                ...productToEdit,
                category_id: productToEdit.category_id ? productToEdit.category_id.toString() : ''
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
        onSavingChange(true);
        try {
            const payload = { ...formData, site_id: siteId };
            if (formData.id) await apiClient.put(`/products/${formData.id}`, payload);
            else await apiClient.post(`/products`, payload);
            toast.success('Збережено');
            onSuccess();
        } catch (e) { toast.error('Помилка'); }
        finally { onSavingChange(false); }
    };

    const categoryOptions = [
        { value: '', label: 'Без категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

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
                        <Button variant="ghost" onClick={onClose} className="p-0 w-8 hover:bg-(--platform-hover-bg)"><IconChevronLeft/></Button>
                    )}
                    {formData.id ? <><IconEdit/> Редагування</> : 'Новий товар'}
                </h3>
                {!isMobile && (
                    <Button variant="ghost" onClick={onClose} className="hover:bg-(--platform-hover-bg)"><IconX/></Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">
                    <Input label="Назва" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    
                    <div className="flex gap-3">
                        <Input label="Ціна (₴)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} wrapperStyle={{flex: 1}} />
                        <Input label="Знижка (%)" type="number" value={formData.sale_percentage} onChange={e => setFormData({...formData, sale_percentage: e.target.value})} wrapperStyle={{flex: 1}} />
                    </div>
                    
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-(--platform-text-primary)">Категорія</label>
                        <CustomSelect value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} options={categoryOptions} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-(--platform-text-primary)">Галерея</label>
                        <div className="grid grid-cols-4 gap-2">
                            {formData.image_gallery.map((img, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-(--platform-border-color) relative group">
                                    <img src={`${API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-start justify-end p-1">
                                        <button type="button" onClick={() => setFormData(p => ({...p, image_gallery: p.image_gallery.filter((_, idx) => idx !== i)}))} className="bg-red-500 text-white rounded cursor-pointer w-5 h-5 flex items-center justify-center border-none">
                                            <IconX size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => setShowMediaPicker(true)} 
                                className="aspect-square border border-dashed border-(--platform-border-color) rounded-lg flex items-center justify-center p-0 cursor-pointer bg-(--platform-bg) text-(--platform-text-secondary) transition-all duration-200 hover:border-(--platform-accent) hover:text-(--platform-accent) hover:bg-(--platform-hover-bg)"
                            >
                                <IconPlus/>
                            </button>
                        </div>
                    </div>
                    
                    <div className="border-t border-(--platform-border-color) pt-5">
                         <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-sm text-(--platform-text-primary)">Опції (варіанти)</span>
                            <Button type="button" variant="outline" onClick={() => setFormData(p => ({...p, variants: [...p.variants, {id: Date.now(), name: '', values: []}]}))} style={{height:'30px', fontSize:'0.8rem'}}><IconPlus size={14}/> Додати</Button>
                         </div>
                         {formData.variants.map((v, i) => (
                            <VariantEditor key={v.id} variant={v} onRemove={() => setFormData(p => ({...p, variants: p.variants.filter((_, idx) => idx !== i)}))} onChange={upd => {
                                const vts = [...formData.variants]; vts[i] = upd; setFormData(p => ({...p, variants: vts}));
                            }} />
                         ))}
                    </div>
                    
                    <textarea 
                        className="w-full min-h-25 p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) resize-y custom-scrollbar focus:outline-none focus:ring-2 focus:ring-(--platform-accent)/20 focus:border-(--platform-accent)"
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        placeholder="Опис товару..." 
                    />
                </div>
                
                <div className="p-6 border-t border-(--platform-border-color) grid grid-cols-2 gap-4 mt-auto bg-(--platform-bg) shrink-0">
                    <Button 
                        type="button" 
                        variant="outline-danger" 
                        onClick={handleClearForm} 
                        style={{justifyContent: 'center', height: '42px'}}
                    >
                        <IconX size={18}/> Скасувати
                    </Button>
                    <Button type="submit" variant="primary" icon={<IconSave size={18}/>} style={{justifyContent: 'center', height: '42px'}}>
                        Зберегти
                    </Button>
                </div>
            </form>
        </div>
    );
};

const ProductManager = ({ siteId, onSavingChange }) => {
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
            const matchesCategory = filters.category === 'all' || product.category_id === parseInt(filters.category);
            return matchesSearch && matchesCategory;
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
        setActiveProduct(null);
        setIsPanelOpen(true);
        setSearchParams(prev => { prev.set('productId', 'new'); return prev; });
    }, [setSearchParams]);

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
                        API_URL={API_URL}
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
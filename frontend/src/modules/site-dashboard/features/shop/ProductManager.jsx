// frontend/src/modules/site-dashboard/features/shop/ProductManager.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../../common/services/api';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import { Input } from '../../../../common/components/ui/Input';
import { Button } from '../../../../common/components/ui/Button';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import MediaPickerModal from '../../../media/components/MediaPickerModal';
import { SplitViewLayout } from '../../../../common/components/layout/SplitViewLayout';
import { 
    IconChevronLeft, IconChevronRight, IconType, 
    IconList, IconSearch, IconPlus, IconShop, 
    IconCheckCircle, IconImage, IconTrash, 
    IconEdit, IconSave, IconUndo, IconX, IconSettings 
} from '../../../../common/components/ui/Icons';

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

    const styles = {
        container: {
            background: 'var(--platform-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '12px'
        },
        header: { display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' },
        tagsArea: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' },
        tag: (isActive) => ({
            background: isActive ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-card-bg)',
            border: `1px solid ${isActive ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s'
        }),
        editorArea: {
            borderTop: '1px dashed var(--platform-border-color)', 
            paddingTop: '16px',
            background: editingIndex !== null ? 'var(--platform-card-bg)' : 'transparent',
            borderRadius: '8px',
            padding: editingIndex !== null ? '12px' : '16px 0 0 0'
        },
        inputGrid: {
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'start', marginBottom: '12px'
        },
        buttonRow: { display: 'flex', gap: '10px', marginTop: '10px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Input 
                    value={variant.name} 
                    onChange={(e) => onChange({...variant, name: e.target.value})}
                    placeholder="Назва опції (напр. Розмір)"
                    style={{margin: 0, fontWeight: '700', fontSize: '0.95rem'}}
                    wrapperStyle={{margin: 0, flex: 1}}
                />
                <Button variant="square-danger" onClick={onRemove} title="Видалити опцію">
                    <IconTrash size={18}/>
                </Button>
            </div>

            <div style={styles.tagsArea}>
                {variant.values && variant.values.map((val, idx) => (
                    <div key={idx} style={styles.tag(idx === editingIndex)} onClick={() => setEditingIndex(idx)}>
                        <span>{val.label}</span>
                        {(val.priceModifier !== 0 || val.salePercentage > 0) && (
                            <span style={{fontSize: '0.8em', opacity: 0.7}}>
                                {val.priceModifier > 0 && `+${val.priceModifier}`}
                                {val.salePercentage > 0 && ` (-${val.salePercentage}%)`}
                            </span>
                        )}
                        <span onClick={(e) => {
                            e.stopPropagation();
                            const newValues = variant.values.filter((_, i) => i !== idx);
                            onChange({ ...variant, values: newValues });
                            if (editingIndex === idx) setEditingIndex(null);
                        }} style={{opacity: 0.5, display: 'flex', marginLeft: 'auto'}}>
                            <IconX size={14} />
                        </span>
                    </div>
                ))}
            </div>

            <div style={styles.editorArea}>
                <div style={{fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    {editingIndex !== null ? <><IconEdit size={14}/> Редагування значення</> : <><IconPlus size={14}/> Додати значення</>}
                </div>
                <div style={styles.inputGrid}>
                    <Input placeholder="Значення (XL)" value={inputState.label} onChange={e => setInputState({...inputState, label: e.target.value})} style={{margin:0}} wrapperStyle={{margin:0}} />
                    <Input placeholder="+Ціна" type="number" value={inputState.price} onChange={e => setInputState({...inputState, price: e.target.value})} style={{margin:0}} wrapperStyle={{margin:0}} />
                    <Input placeholder="Зниж. %" type="number" value={inputState.sale} onChange={e => setInputState({...inputState, sale: e.target.value})} style={{margin:0}} wrapperStyle={{margin:0}} />
                </div>
                <div style={styles.buttonRow}>
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
    onCreate, selectedId, API_URL 
}) => {
    const categoryOptions = [
        { value: 'all', label: 'Всі категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

    const styles = {
        container: {
            background: 'var(--platform-card-bg)', 
            borderRadius: '16px',
            border: '1px solid var(--platform-border-color)',
            display: 'flex', flexDirection: 'column', 
            height: '100%', overflow: 'hidden',
        },
        toolbar: {
            padding: '12px 20px', borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: '12px', flexWrap: 'wrap', background: 'var(--platform-bg)'
        },
        scrollArea: {
            padding: '20px', overflowY: 'auto', flex: 1,
            maxHeight: 'calc(692px - 72px)', 
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gridAutoRows: '220px', gap: '16px', alignContent: 'start'
        },
        card: (isSelected) => ({
            background: 'var(--platform-bg)', borderRadius: '12px',
            border: isSelected ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
            overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s ease',
            position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',
            boxShadow: isSelected ? '0 8px 20px rgba(var(--platform-accent-rgb), 0.15)' : 'none',
            transform: isSelected ? 'translateY(-2px)' : 'none'
        })
    };

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Завантаження...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.toolbar}>
                <div style={{display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                    <Input 
                        leftIcon={<IconSearch size={16}/>}
                        placeholder="Пошук..." 
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        wrapperStyle={{margin: 0, flex: '1 1 200px'}}
                    />
                    <div style={{width: '180px'}}>
                        <CustomSelect 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                            options={categoryOptions}
                        />
                    </div>
                    <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                        <div style={{width: '160px'}}>
                            <CustomSelect 
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value}))}
                                options={sortFields}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            style={{ width: '38px', height: '38px', padding: 0, background: 'var(--platform-card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <span style={{fontSize: '1.2rem', lineHeight: 1}}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        </Button>
                    </div>
                </div>
                <Button onClick={onCreate} icon={<IconPlus size={18}/>}>Додати</Button>
            </div>

            <div className="custom-scrollbar" style={styles.scrollArea}>
                <div style={styles.grid}>
                    {products.map(product => (
                        <div key={product.id} style={styles.card(selectedId === product.id)} onClick={() => onSelect(product)} className="product-card">
                            <div style={{height: '130px', background: '#f1f5f9', position: 'relative', borderBottom: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                 {product.image_gallery?.[0] ? (
                                    <img src={`${API_URL}${product.image_gallery[0]}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                 ) : <IconImage size={32} style={{opacity: 0.2}} />}
                                 
                                 <div style={{position: 'absolute', top: '8px', left: '8px', padding: '2px 8px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', color: product.stock_quantity > 0 ? '#10b981' : '#ef4444', zIndex: 2}}>
                                    {product.stock_quantity} шт.
                                 </div>
                                 {selectedId === product.id && (
                                    <div style={{position: 'absolute', top: '8px', right: '8px', color: 'var(--platform-accent)', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 2}}>
                                        <IconCheckCircle size={20} />
                                    </div>
                                 )}
                            </div>
                            <div style={{padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                <div style={{fontWeight: '600', fontSize: '0.85rem', lineHeight: '1.2', height: '32px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'var(--platform-text-primary)'}}>
                                    {product.name}
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px'}}>
                                    <div style={{fontWeight: 'bold', color: 'var(--platform-text-primary)', fontSize: '1rem'}}>
                                        {product.price} ₴
                                    </div>
                                    {product.sale_percentage > 0 && (
                                        <div style={{fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px'}}>
                                            -{product.sale_percentage}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div style={{textAlign: 'center', padding: '60px', color: 'var(--platform-text-secondary)'}}>
                        <IconShop size={48} style={{opacity: 0.2, marginBottom: '16px'}}/>
                        <p>Товарів не знайдено</p>
                    </div>
                )}
            </div>
            <style>{`.product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: var(--platform-accent) !important; }`}</style>
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

    const styles = `
        .close-btn-hover:hover {
            background-color: var(--platform-hover-bg) !important;
            color: var(--platform-text-primary) !important;
        }
        .add-photo-btn {
            aspect-ratio: 1; 
            border: 1px dashed var(--platform-border-color); 
            border-radius: 8px;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            cursor: pointer;
            background: var(--platform-bg); 
            color: var(--platform-text-secondary); 
            transition: all 0.2s ease;
        }
        .add-photo-btn:hover {
            border-color: var(--platform-accent); color: var(--platform-accent); background: var(--platform-hover-bg);
        }
        .photo-thumb-overlay {
            position: absolute; top: 0; right: 0; bottom: 0; left: 0;
            background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s; border-radius: 8px;
        }
        .photo-thumb:hover .photo-thumb-overlay { opacity: 1; }
    `;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)', borderRadius: isMobile ? '0' : '16px', overflow: 'hidden'
        }}>
            <style>{styles}</style>
            <MediaPickerModal
                isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)}
                onSelect={(files) => {
                    const paths = files.map(f => f.path_full);
                    setFormData(prev => ({...prev, image_gallery: [...new Set([...prev.image_gallery, ...paths])]}));
                    setShowMediaPicker(false);
                }}
                multiple={true} allowedTypes={['image']}
            />

            <div style={{height: '72px', padding: '0 24px', borderBottom: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--platform-bg)'}}>
                <h3 style={{margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--platform-text-primary)'}}>
                    {isMobile && (
                        <Button variant="ghost" onClick={onClose} style={{padding: 0, width: '32px'}} className="close-btn-hover"><IconChevronLeft/></Button>
                    )}
                    {formData.id ? <><IconEdit/> Редагування</> : <><IconPlus/> Новий товар</>}
                </h3>
                {!isMobile && (
                    <Button variant="ghost" onClick={onClose} className="close-btn-hover"><IconX/></Button>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                <div className="custom-scrollbar" style={{flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <Input label="Назва" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <div style={{display: 'flex', gap: '12px'}}>
                        <Input label="Ціна (₴)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{flex: 1}} />
                        <Input label="Знижка (%)" type="number" value={formData.sale_percentage} onChange={e => setFormData({...formData, sale_percentage: e.target.value})} style={{flex: 1}} />
                    </div>
                    <div>
                        <label style={{display:'block', marginBottom: '8px', fontSize:'0.9rem', fontWeight:'600', color: 'var(--platform-text-primary)'}}>Категорія</label>
                        <CustomSelect value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} options={categoryOptions} />
                    </div>
                    <div>
                        <label style={{display:'block', marginBottom: '8px', fontSize:'0.9rem', fontWeight:'600', color: 'var(--platform-text-primary)'}}>Галерея</label>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px'}}>
                            {formData.image_gallery.map((img, i) => (
                                <div key={i} style={{aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--platform-border-color)', position: 'relative'}} className="photo-thumb">
                                    <img src={`${API_URL}${img}`} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                    <div className="photo-thumb-overlay">
                                        <button type="button" onClick={() => setFormData(p => ({...p, image_gallery: p.image_gallery.filter((_, idx) => idx !== i)}))} style={{position:'absolute', top:4, right:4, background:'red', color:'white', border:'none', borderRadius:4, cursor:'pointer', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <IconX size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => setShowMediaPicker(true)} className="add-photo-btn"><IconPlus/></button>
                        </div>
                    </div>
                    <div style={{borderTop: '1px solid var(--platform-border-color)', paddingTop: '20px'}}>
                         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                            <span style={{fontWeight:'bold', fontSize:'0.9rem', color: 'var(--platform-text-primary)'}}>Опції (варіанти)</span>
                            <Button type="button" variant="outline" onClick={() => setFormData(p => ({...p, variants: [...p.variants, {id: Date.now(), name: '', values: []}]}))} style={{height:'30px', fontSize:'0.8rem'}}><IconPlus size={14}/> Додати</Button>
                         </div>
                         {formData.variants.map((v, i) => (
                            <VariantEditor key={v.id} variant={v} onRemove={() => setFormData(p => ({...p, variants: p.variants.filter((_, idx) => idx !== i)}))} onChange={upd => {
                                const vts = [...formData.variants]; vts[i] = upd; setFormData(p => ({...p, variants: vts}));
                            }} />
                         ))}
                    </div>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Опис товару..." style={{width:'100%', minHeight:'100px', padding:'10px', borderRadius:'8px', border:'1px solid var(--platform-border-color)', background:'var(--platform-bg)', color:'var(--platform-text-primary)'}} />
                </div>
                <div style={{padding: '16px 24px', borderTop: '1px solid var(--platform-border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--platform-bg)'}}>
                    <Button type="button" variant="secondary-danger" onClick={handleClearForm} style={{justifyContent: 'center'}}><IconX/> Скасувати</Button>
                    <Button type="submit" variant="primary" icon={<IconSave/>} style={{justifyContent: 'center'}}>Зберегти</Button>
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

    return (
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
    );
};

export default ProductManager;
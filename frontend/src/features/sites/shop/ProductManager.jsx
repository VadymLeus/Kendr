// frontend/src/features/sites/shop/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../services/api';
import ImageInput from '../../media/ImageInput';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';

const API_URL = 'http://localhost:5000';

const VariantEditor = ({ variant, onChange, onRemove, index }) => {
    const [newValueLabel, setNewValueLabel] = useState('');
    const [newValuePrice, setNewValuePrice] = useState('');
    const [newValueSale, setNewValueSale] = useState('');
    
    const [searchParams, setSearchParams] = useSearchParams();
    const { confirm } = useConfirm();
    const variantIdxParam = searchParams.get('variantIdx');
    const valueIdxParam = searchParams.get('valueIdx');
    
    const editingValueIndex = (variantIdxParam === String(index) && valueIdxParam !== null) 
        ? parseInt(valueIdxParam) 
        : null;

    useEffect(() => {
        if (editingValueIndex !== null && variant.values && variant.values[editingValueIndex]) {
            const val = variant.values[editingValueIndex];
            setNewValueLabel(val.label);
            setNewValuePrice(val.priceModifier || '');
            setNewValueSale(val.salePercentage || '');
        } else {
            setNewValueLabel('');
            setNewValuePrice('');
            setNewValueSale('');
        }
    }, [editingValueIndex, variant.values]);

    const handleSaveValue = (e) => {
        if (e) e.preventDefault();
        
        const label = newValueLabel.trim();
        if (!label) return;
        
        const valueData = { 
            label: label, 
            priceModifier: parseFloat(newValuePrice) || 0,
            salePercentage: parseInt(newValueSale) || 0
        };

        let newValues = [...(variant.values || [])];

        if (editingValueIndex !== null) {
            newValues[editingValueIndex] = valueData;
            toast.info('Значення оновлено');
        } else {
            newValues.push(valueData);
        }
        
        onChange({ ...variant, values: newValues });
        resetInput();
    };

    const startEditing = (valIdx) => {
        setSearchParams(prev => {
            prev.set('variantIdx', String(index));
            prev.set('valueIdx', String(valIdx));
            return prev;
        });
    };

    const resetInput = () => {
        setSearchParams(prev => {
            prev.delete('variantIdx');
            prev.delete('valueIdx');
            return prev;
        });
    };

    const handleRemoveValue = async (idx, label, e) => {
        e.stopPropagation();
        const isConfirmed = await confirm({
            title: "Видалити значення?",
            message: `Ви впевнені, що хочете видалити варіант "${label}"?`,
            type: "danger",
            confirmLabel: "Видалити",
            cancelLabel: "Скасувати"
        });

        if (isConfirmed) {
            const newValues = variant.values.filter((_, i) => i !== idx);
            onChange({ ...variant, values: newValues });
            
            if (editingValueIndex === idx) resetInput();
        }
    };

    const handleRemoveVariant = async () => {
        const isConfirmed = await confirm({
            title: "Видалити опцію?",
            message: `Ви впевнені, що хочете видалити опцію "${variant.name || 'Без назви'}" та всі її значення?`,
            type: "danger",
            confirmLabel: "Видалити",
            cancelLabel: "Скасувати"
        });

        if (isConfirmed) {
            onRemove();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveValue();
        }
    };

    const primaryButton = {
        background: 'var(--platform-accent)', 
        color: 'var(--platform-accent-text)',
        padding: '8px', 
        borderRadius: '6px', 
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
        padding: '8px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonHover = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    const dangerButton = {
        background: 'rgba(229, 62, 62, 0.1)', 
        border: '1px solid rgba(229, 62, 62, 0.2)', 
        cursor: 'pointer', 
        color: '#e53e3e', 
        width: '34px', 
        height: '34px', 
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const dangerButtonHover = {
        background: '#e53e3e',
        color: 'white',
        transform: 'scale(1.05)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.3)'
    };

    const removeValueBtnStyle = {
        border: 'none', 
        background: 'transparent', 
        cursor: 'pointer', 
        color: 'var(--platform-text-secondary)',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 0 0 4px',
        flexShrink: 0,
        transition: 'all 0.2s ease'
    };

    const removeValueBtnHover = {
        color: '#e53e3e',
        transform: 'scale(1.2)'
    };

    const styles = {
        container: {
            border: '1px solid var(--platform-border-color)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            background: 'var(--platform-bg)', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease'
        },
        header: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '12px',
            gap: '10px',
            width: '100%'
        },
        valuesList: { 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '10px', 
            marginBottom: '12px' 
        },
        valueTag: (isEditing) => ({
            background: isEditing ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
            border: isEditing ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            minWidth: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }),
        textContainer: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: 0
        },
        truncatedText: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500,
            display: 'block'
        },
        priceText: {
            fontSize: '0.75em',
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        saleText: { 
            fontSize: '0.75em', 
            color: '#e53e3e', 
            fontWeight: 'bold', 
            marginLeft: '4px' 
        },
        inputField: { 
            width: '100%',
            padding: '8px 12px', 
            borderRadius: '8px', 
            border: '1px solid var(--platform-border-color)', 
            fontSize: '0.9rem', 
            background: 'var(--platform-card-bg)', 
            color: 'var(--platform-text-primary)',
            boxSizing: 'border-box',
            marginBottom: '8px',
            transition: 'all 0.2s ease'
        },
        inputFieldHover: {
            borderColor: 'var(--platform-accent)',
            boxShadow: '0 0 0 1px var(--platform-accent)'
        },
        label: {
            fontSize: '0.8rem', 
            fontWeight: '500', 
            display: 'block', 
            marginBottom: '6px', 
            color: 'var(--platform-text-secondary)'
        },
        optionNameInput: {
            padding: '8px 12px', 
            borderRadius: '8px', 
            border: '1px solid var(--platform-border-color)', 
            fontSize: '0.9rem', 
            background: 'var(--platform-card-bg)', 
            color: 'var(--platform-text-primary)',
            fontWeight: 'bold', 
            flex: 1,
            boxSizing: 'border-box',
            minWidth: 0,
            transition: 'all 0.2s ease'
        },
        optionNameInputHover: {
            borderColor: 'var(--platform-accent)',
            boxShadow: '0 0 0 1px var(--platform-accent)'
        },
        addButton: {
            ...primaryButton,
            background: editingValueIndex !== null ? '#ecc94b' : 'var(--platform-accent)',
            color: editingValueIndex !== null ? 'black' : 'var(--platform-accent-text)',
        },
        addButtonHover: {
            ...primaryButtonHover,
            background: editingValueIndex !== null ? '#d69e2e' : 'var(--platform-accent-hover)',
        },
        cancelButton: {
            ...secondaryButton,
            width: '100%'
        },
        cancelButtonHover: secondaryButtonHover,
        buttonContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            gridColumn: '1 / -1'
        },
        buttonWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1
        }
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <input 
                    type="text" 
                    value={variant.name} 
                    onChange={(e) => onChange({...variant, name: e.target.value})}
                    placeholder="Назва опції (напр. Розмір)"
                    style={styles.optionNameInput}
                    onMouseOver={(e) => handleMouseOver(e.target, styles.optionNameInputHover)}
                    onMouseOut={(e) => handleMouseOut(e.target, styles.optionNameInput)}
                />
                <button 
                    type="button" 
                    onClick={handleRemoveVariant} 
                    style={dangerButton}
                    title="Видалити опцію"
                    onMouseOver={(e) => handleMouseOver(e.target, dangerButtonHover)}
                    onMouseOut={(e) => handleMouseOut(e.target, dangerButton)}
                >
                    ×
                </button>
            </div>

            <div style={styles.valuesList}>
                {variant.values && variant.values.map((val, idx) => (
                    <div 
                        key={idx} 
                        style={styles.valueTag(idx === editingValueIndex)} 
                        onClick={() => startEditing(idx)}
                        title="Натисніть, щоб редагувати"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = 'var(--platform-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = idx === editingValueIndex ? 'var(--platform-accent)' : 'var(--platform-border-color)';
                        }}
                    >
                        <div style={styles.textContainer}>
                            <span style={styles.truncatedText}>
                                {idx === editingValueIndex ? '✏️ ' : ''}{val.label}
                            </span>
                            <div>
                                {val.priceModifier !== 0 && (
                                    <span style={{
                                        ...styles.priceText,
                                        color: val.priceModifier > 0 ? 'var(--platform-success)' : 'var(--platform-danger)', 
                                    }}>
                                        {val.priceModifier > 0 ? '+' : ''}{val.priceModifier} ₴
                                    </span>
                                )}
                                {val.salePercentage > 0 && (
                                    <span style={styles.saleText}>
                                        -{val.salePercentage}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={(e) => handleRemoveValue(idx, val.label, e)} 
                            style={removeValueBtnStyle}
                            onMouseOver={(e) => handleMouseOver(e.target, removeValueBtnHover)}
                            onMouseOut={(e) => handleMouseOut(e.target, removeValueBtnStyle)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div style={{
                borderTop: '1px dashed var(--platform-border-color)', 
                paddingTop: '12px', 
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                alignItems: 'end'
            }}>
                <div style={{gridColumn: '1 / -1'}}>
                    <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--platform-text-primary)'}}>
                        {editingValueIndex !== null ? `✏️ Редагування "${variant.values[editingValueIndex]?.label}"` : '➕ Додати нове значення'}
                    </span>
                </div>

                <div>
                    <label style={styles.label}>Значення</label>
                    <input 
                        type="text" 
                        value={newValueLabel} 
                        onChange={e => setNewValueLabel(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="XL" 
                        style={{...styles.inputField, marginBottom: 0}}
                        onMouseOver={(e) => handleMouseOver(e.target, styles.inputFieldHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, {...styles.inputField, marginBottom: 0})}
                    />
                </div>
                
                <div>
                    <label style={styles.label}>Ціна (₴)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={newValuePrice} 
                        onChange={e => setNewValuePrice(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="+/-" 
                        style={{...styles.inputField, marginBottom: 0}}
                        onMouseOver={(e) => handleMouseOver(e.target, styles.inputFieldHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, {...styles.inputField, marginBottom: 0})}
                    />
                </div>

                <div>
                    <label style={styles.label}>Знижка (%)</label>
                    <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={newValueSale} 
                        onChange={e => setNewValueSale(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="%" 
                        style={{...styles.inputField, marginBottom: 0}}
                        onMouseOver={(e) => handleMouseOver(e.target, styles.inputFieldHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, {...styles.inputField, marginBottom: 0})}
                    />
                </div>

                <div style={styles.buttonContainer}>
                    <div style={styles.buttonWrapper}>
                        <button 
                            type="button" 
                            onClick={handleSaveValue} 
                            style={styles.addButton}
                            onMouseOver={(e) => handleMouseOver(e.target, styles.addButtonHover)}
                            onMouseOut={(e) => handleMouseOut(e.target, styles.addButton)}
                        >
                            {editingValueIndex !== null ? '💾 Зберегти' : '➕ Додати'}
                        </button>
                    </div>
                    
                    {editingValueIndex !== null && (
                        <div style={styles.buttonWrapper}>
                            <button 
                                type="button" 
                                onClick={resetInput} 
                                style={styles.cancelButton}
                                onMouseOver={(e) => handleMouseOver(e.target, styles.cancelButtonHover)}
                                onMouseOut={(e) => handleMouseOut(e.target, styles.cancelButton)}
                            >
                                ↶ Скасувати
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProductManager = ({ siteId }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const initialFormState = { 
        id: null, 
        name: '', 
        description: '', 
        price: 0, 
        stock_quantity: 1, 
        category_id: null, 
        image_gallery: [],
        variants: [],
        sale_percentage: 0
    };
    const [formData, setFormData] = useState(initialFormState);

    const [filters, setFilters] = useState({
        search: '', 
        category: 'all'
    });

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
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const prodIdFromUrl = searchParams.get('productId');
        if (!loading && prodIdFromUrl && products.length > 0) {
            const productToEdit = products.find(p => p.id.toString() === prodIdFromUrl);
            if (productToEdit && formData.id !== productToEdit.id) {
                openEditor(productToEdit, false);
            }
        }
    }, [loading, products, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || formData.price <= 0) {
            toast.warning("Вкажіть назву та ціну (>0)");
            return;
        }
        
        const payload = { 
            ...formData, 
            site_id: siteId,
            variants: formData.variants.map(variant => ({
                ...variant,
                values: Array.isArray(variant.values) ? variant.values : []
            }))
        };
        
        try {
            if (formData.id) {
                await apiClient.put(`/products/${formData.id}`, payload);
                toast.success('Товар оновлено');
            } else {
                await apiClient.post(`/products`, payload);
                toast.success('Товар створено');
            }
            resetForm();
            fetchData();
        } catch (e) {
            console.error('Помилка збереження:', e);
            toast.error('Помилка збереження');
        }
    };

    const openEditor = (product, updateUrl = true) => {
        let gallery = [];
        if (Array.isArray(product.image_gallery)) {
            gallery = product.image_gallery;
        } else if (typeof product.image_gallery === 'string') {
            try { gallery = JSON.parse(product.image_gallery); } catch (e) { gallery = []; }
        } else if (product.image_url) {
            gallery = [product.image_url];
        }

        setFormData({ 
            ...product, 
            image_gallery: gallery,
            stock_quantity: product.stock_quantity || 0,
            variants: Array.isArray(product.variants) ? product.variants : [],
            sale_percentage: product.sale_percentage || 0
        });

        if (updateUrl) {
            setSearchParams(prev => {
                prev.set('productId', product.id);
                return prev;
            });
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setSearchParams(prev => {
            prev.delete('productId');
            prev.delete('variantIdx');
            prev.delete('valueIdx');
            return prev;
        });
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (await confirm({ 
            title: "Видалити товар?", 
            message: "Цю дію неможливо скасувати.", 
            type: 'danger',
            confirmLabel: "Видалити"
        })) {
            try {
                await apiClient.delete(`/products/${id}`);
                fetchData();
                if (formData.id === id) {
                    resetForm();
                }
                toast.success('Товар видалено');
            } catch (err) {
                toast.error('Помилка видалення');
            }
        }
    };

    const addVariant = () => {
        const newVariant = { 
            id: Date.now().toString(),
            name: '', 
            values: [] 
        };
        setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
    };

    const updateVariant = (idx, updatedVariant) => {
        const newVariants = [...formData.variants];
        newVariants[idx] = updatedVariant;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeVariant = (idx) => {
        const newVariants = formData.variants.filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleAddImage = (e) => {
        let val = e.target.value;
        if (typeof val !== 'string') {
            console.warn('Отримано не рядок у image_url:', val);
            val = ''; 
        }
        const relativeUrl = val.replace(API_URL, '');
        
        if (relativeUrl && !formData.image_gallery.includes(relativeUrl)) {
            setFormData(prev => ({
                ...prev,
                image_gallery: [...prev.image_gallery, relativeUrl]
            }));
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            image_gallery: prev.image_gallery.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleMakeCover = (index) => {
        if (index === 0) return;
        setFormData(prev => {
            const newGallery = [...prev.image_gallery];
            const targetImage = newGallery[index];
            newGallery.splice(index, 1);
            newGallery.unshift(targetImage);
            return { ...prev, image_gallery: newGallery };
        });
        toast.info("Обкладинку змінено");
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            product.description.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category === 'all' || product.category_id === parseInt(filters.category);
        
        return matchesSearch && matchesCategory;
    });

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

    const dangerButton = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid var(--platform-border-color)',
        color: '#e53e3e',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 2
    };

    const dangerButtonHover = {
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
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
    };

    const inputHoverStyle = {
        borderColor: 'var(--platform-accent)',
        boxShadow: '0 0 0 1px var(--platform-accent)'
    };

    const labelStyle = {
        fontSize:'0.85rem', 
        fontWeight:'500', 
        marginBottom:'6px', 
        display:'block', 
        color: 'var(--platform-text-secondary)'
    };

    const removeThumbBtnStyle = {
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: 'rgba(229, 62, 62, 0.9)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '22px',
        height: '22px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        zIndex: 5,
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    };

    const removeThumbBtnHover = {
        background: '#c53030',
        transform: 'scale(1.1)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.3)'
    };

    const makeCoverBtnStyle = {
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#ecc94b',
        border: 'none',
        borderRadius: '50%',
        width: '26px',
        height: '26px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        zIndex: 5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease'
    };

    const makeCoverBtnHover = {
        background: '#fff',
        transform: 'scale(1.1)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
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
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const editorCardStyle = {
        flex: '0 0 450px', 
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const scrollableFormStyle = {
        flex: 1,
        overflowY: 'auto',
        paddingRight: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    };

    const productsAreaStyle = {
        flex: 1,
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        padding: '24px',
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        minWidth: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const productGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '16px',
        overflowY: 'auto', 
        padding: '4px',
        alignContent: 'start',
        height: '100%'
    };

    const tileBaseStyle = {
        background: 'var(--platform-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        minHeight: '280px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    };

    const tileStyle = (isActive) => ({
        ...tileBaseStyle,
        border: isActive ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        boxShadow: isActive ? '0 4px 12px rgba(var(--platform-accent-rgb), 0.2)' : '0 2px 5px rgba(0,0,0,0.05)'
    });

    const tileHoverStyle = {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        borderColor: 'var(--platform-accent)'
    };

    const tileImageStyle = {
        width: '100%',
        height: '160px',
        minHeight: '160px',
        objectFit: 'cover',
        objectPosition: 'center',
        backgroundColor: '#f0f2f5',
        borderBottom: '1px solid var(--platform-border-color)',
        display: 'block'
    };

    const tileContentStyle = {
        padding: '14px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px'
    };

    const badgeStyle = (isStock) => ({
        position: 'absolute',
        top: '8px',
        left: '8px',
        background: isStock ? 'rgba(255, 255, 255, 0.95)' : '#fff5f5',
        color: isStock ? '#2f855a' : '#c53030',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
    });

    const saleBadgeStyle = {
        position: 'absolute',
        top: '8px',
        right: '45px',
        background: '#fff5f5',
        color: '#e53e3e',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 2
    };

    const galleryGridStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '10px'
    };

    const thumbnailStyle = {
        width: '80px',
        height: '80px',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--platform-border-color)',
        transition: 'all 0.2s ease'
    };

    const thumbImgStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    };

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Завантаження...</div>;

    return (
        <div style={containerStyle}>
            <div style={editorCardStyle}>
                <div style={{marginBottom: '20px', flexShrink: 0}}>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--platform-text-primary)'}}>
                        {formData.id ? '✏️ Редагування товару' : '➕ Новий товар'}
                    </h3>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--platform-text-secondary)'}}>
                        {formData.id ? 'Змініть дані та збережіть' : 'Заповніть картку товару'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    <div className="custom-scrollbar" style={scrollableFormStyle}>
                        <div>
                            <label style={labelStyle}>Назва товару</label>
                            <input 
                                type="text" 
                                style={inputStyle} 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required
                                onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                            />
                        </div>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <div style={{flex: 1}}>
                                <label style={labelStyle}>Ціна (₴)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    style={inputStyle} 
                                    value={formData.price} 
                                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                                    required
                                    onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={labelStyle}>Склад</label>
                                <input 
                                    type="number" 
                                    style={inputStyle} 
                                    value={formData.stock_quantity} 
                                    onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                                    onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                    onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={{...labelStyle, color: '#e53e3e'}}>Знижка (%)</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    style={{...inputStyle, borderColor: formData.sale_percentage > 0 ? '#e53e3e' : ''}}
                                    value={formData.sale_percentage} 
                                    onChange={e => setFormData({...formData, sale_percentage: parseInt(e.target.value)})} 
                                    onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                    onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, borderColor: formData.sale_percentage > 0 ? '#e53e3e' : ''})}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Категорія</label>
                            <select 
                                style={inputStyle} 
                                value={formData.category_id || ''} 
                                onChange={e => setFormData({...formData, category_id: e.target.value || null})}
                                onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                            >
                                <option value="">Без категорії</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Галерея зображень</label>
                            
                            <div style={{marginBottom: '10px'}}>
                                <ImageInput 
                                    value=""
                                    onChange={handleAddImage}
                                    aspect={1}
                                />
                            </div>

                            <div style={galleryGridStyle}>
                                {formData.image_gallery.map((img, idx) => (
                                    <div key={idx} style={thumbnailStyle}>
                                        <img 
                                            src={`${API_URL}${img}`} 
                                            alt={`img-${idx}`} 
                                            style={thumbImgStyle} 
                                        />
                                        
                                        <button 
                                            type="button" 
                                            style={removeThumbBtnStyle}
                                            onClick={() => handleRemoveImage(idx)}
                                            title="Видалити"
                                            onMouseOver={(e) => handleMouseOver(e.target, removeThumbBtnHover)}
                                            onMouseLeave={(e) => handleMouseOut(e.target, removeThumbBtnStyle)}
                                        >
                                            ×
                                        </button>

                                        {idx === 0 ? (
                                            <div style={{
                                                position: 'absolute', 
                                                bottom: 0, 
                                                left: 0, 
                                                right: 0, 
                                                background: 'rgba(0,0,0,0.6)', 
                                                color: 'white', 
                                                fontSize: '10px', 
                                                textAlign: 'center', 
                                                padding: '2px'
                                            }}>
                                                Обкладинка
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                style={makeCoverBtnStyle}
                                                onClick={() => handleMakeCover(idx)}
                                                title="Зробити головним фото"
                                                onMouseOver={(e) => handleMouseOver(e.target, makeCoverBtnHover)}
                                                onMouseLeave={(e) => handleMouseOut(e.target, makeCoverBtnStyle)}
                                            >
                                                ★
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            borderTop: '1px dashed var(--platform-border-color)', 
                            paddingTop: '12px'
                        }}>
                            <label style={{
                                fontSize:'0.9rem', 
                                fontWeight:'600', 
                                marginBottom:'10px', 
                                display:'block', 
                                color: 'var(--platform-text-primary)'
                            }}>
                                ⚙️ Варіанти товару
                            </label>
                            
                            {formData.variants.map((variant, idx) => (
                                <VariantEditor 
                                    key={variant.id || idx} 
                                    index={idx}
                                    variant={variant} 
                                    onChange={(updated) => updateVariant(idx, updated)}
                                    onRemove={() => removeVariant(idx)}
                                />
                            ))}

                            <button 
                                type="button" 
                                onClick={addVariant}
                                style={{
                                    ...inputStyle, 
                                    background: 'transparent', 
                                    border: '1px dashed var(--platform-accent)', 
                                    color: 'var(--platform-accent)', 
                                    cursor: 'pointer', 
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(var(--platform-accent-rgb), 0.05)';
                                    e.currentTarget.style.borderStyle = 'solid';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderStyle = 'dashed';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                + Додати опцію (Розмір, Колір...)
                            </button>
                        </div>

                        <div>
                            <label style={labelStyle}>Опис товару</label>
                            <textarea 
                                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, minHeight: '80px', resize: 'vertical'})}
                            />
                        </div>
                    </div>

                    <div style={{paddingTop: '20px', display: 'flex', gap: '10px', flexShrink: 0}}>
                        <button 
                            type="submit" 
                            style={primaryButton}
                            onMouseOver={(e) => handleMouseOver(e.target, primaryButtonHover)}
                            onMouseOut={(e) => handleMouseOut(e.target, primaryButton)}
                        >
                            {formData.id ? '💾 Зберегти зміни' : '➕ Створити товар'}
                        </button>
                        {formData.id && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                style={secondaryButton}
                                onMouseOver={(e) => handleMouseOver(e.target, secondaryButtonHover)}
                                onMouseOut={(e) => handleMouseOut(e.target, secondaryButton)}
                            >
                                ↶ Відміна
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={productsAreaStyle}>
                <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px', 
                    flexWrap: 'wrap', 
                    gap: '10px'
                }}>
                    <div style={{display: 'flex', gap: '10px', flex: 1, minWidth: '200px'}}>
                        <input 
                            placeholder="🔍 Пошук товару..." 
                            style={{...inputStyle, marginBottom: 0, width: '100%'}}
                            value={filters.search}
                            onChange={e => setFilters({...filters, search: e.target.value})}
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, marginBottom: 0, width: '100%'})}
                        />
                        <select 
                            style={{...inputStyle, marginBottom: 0, maxWidth: '180px'}}
                            value={filters.category}
                            onChange={e => setFilters({...filters, category: e.target.value})}
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, marginBottom: 0, maxWidth: '180px'})}
                        >
                            <option value="all">Всі категорії</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    
                    <div style={{
                        fontWeight: 'bold', 
                        color: 'var(--platform-text-primary)', 
                        whiteSpace: 'nowrap', 
                        marginLeft: '10px'
                    }}>
                        Всього товарів: <span style={{color: 'var(--platform-accent)', fontSize: '1.1rem'}}>{products.length}</span>
                    </div>
                </div>

                <div className="custom-scrollbar" style={productGridStyle}>
                    {filteredProducts.map(product => (
                        <div 
                            key={product.id}
                            style={tileStyle(formData.id === product.id)}
                            onClick={() => openEditor(product)}
                            onMouseEnter={(e) => {
                                handleMouseOver(e.currentTarget, {...tileStyle(formData.id === product.id), ...tileHoverStyle});
                            }}
                            onMouseLeave={(e) => {
                                handleMouseOut(e.currentTarget, tileStyle(formData.id === product.id));
                            }}
                        >
                            <div style={badgeStyle(product.stock_quantity > 0)}>
                                {product.stock_quantity > 0 ? `${product.stock_quantity} шт.` : 'Немає'}
                            </div>

                            {product.sale_percentage > 0 && (
                                <div style={saleBadgeStyle}>
                                    -{product.sale_percentage}%
                                </div>
                            )}

                            <button 
                                onClick={(e) => handleDelete(e, product.id)}
                                style={dangerButton}
                                title="Видалити"
                                onMouseOver={(e) => handleMouseOver(e.currentTarget, dangerButtonHover)}
                                onMouseLeave={(e) => handleMouseOut(e.currentTarget, dangerButton)}
                            >
                                ×
                            </button>

                            <img 
                                src={product.image_gallery?.[0] ? `${API_URL}${product.image_gallery[0]}` : 'https://placehold.co/300x200?text=No+Image'} 
                                alt={product.name}
                                style={tileImageStyle}
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/300x200?text=No+Image" 
                                }}
                            />

                            <div style={tileContentStyle}>
                                <div>
                                    <div style={{
                                        fontWeight: '600', 
                                        marginBottom: '6px', 
                                        lineHeight: '1.3', 
                                        fontSize: '0.95rem', 
                                        color: 'var(--platform-text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {product.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem', 
                                        color: 'var(--platform-text-secondary)', 
                                        marginBottom: '8px'
                                    }}>
                                        {categories.find(c => c.id === product.category_id)?.name || 'Без категорії'}
                                    </div>
                                    
                                    {product.variants && product.variants.length > 0 && (
                                        <div style={{
                                            fontSize: '0.7rem', 
                                            background: 'var(--platform-card-bg)', 
                                            border: '1px solid var(--platform-border-color)', 
                                            display: 'inline-block', 
                                            padding: '2px 8px', 
                                            borderRadius: '6px', 
                                            color: 'var(--platform-text-primary)'
                                        }}>
                                            🎨 {product.variants.length} опцій
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    marginTop: 'auto', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center'
                                }}>
                                    {product.sale_percentage > 0 ? (
                                        <>
                                            <span style={{textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--platform-text-secondary)', marginRight: '6px'}}>
                                                {product.price} ₴
                                            </span>
                                            <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#e53e3e'}}>
                                                {Math.round(product.price * (1 - product.sale_percentage / 100))} ₴
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--platform-accent)'}}>
                                            {product.price} ₴
                                        </span>
                                    )}
                                    {formData.id === product.id && (
                                        <span style={{
                                            fontSize: '0.7rem', 
                                            color: 'var(--platform-accent)', 
                                            fontStyle: 'italic',
                                            fontWeight: '600'
                                        }}>
                                            Редагується...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                        <div style={{
                            gridColumn: '1/-1', 
                            textAlign: 'center', 
                            color: 'var(--platform-text-secondary)', 
                            marginTop: '40px',
                            padding: '40px'
                        }}>
                            <div style={{fontSize: '3rem', marginBottom: '10px', opacity: 0.5}}>📦</div>
                            {products.length === 0 ? 'Список порожній' : 'Товарів не знайдено'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManager;
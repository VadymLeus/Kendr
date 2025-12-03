// frontend/src/modules/site-dashboard/features/shop/products/ProductFormModal.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../../common/services/api';
import { toast } from 'react-toastify';
import ImageInput from '../../../../media/components/ImageInput';
import { VariantEditor } from './VariantEditor';
import styles from './ProductFormModal.module.css';

const API_URL = 'http://localhost:5000';

export const ProductFormModal = ({ 
    productToEdit, 
    siteId, 
    categories, 
    onSuccess, 
    onSavingChange,
    onClose
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [formData, setFormData] = useState({ 
        id: null, 
        name: '', 
        description: '', 
        price: 0, 
        stock_quantity: 1, 
        category_id: null, 
        image_gallery: [],
        variants: [],
        sale_percentage: 0
    });

    useEffect(() => {
        if (productToEdit) {
            let gallery = [];
            if (Array.isArray(productToEdit.image_gallery)) {
                gallery = productToEdit.image_gallery;
            } else if (typeof productToEdit.image_gallery === 'string') {
                try { gallery = JSON.parse(productToEdit.image_gallery); } catch (e) { gallery = []; }
            } else if (productToEdit.image_url) {
                gallery = [productToEdit.image_url];
            }

            setFormData({ 
                ...productToEdit, 
                image_gallery: gallery,
                stock_quantity: productToEdit.stock_quantity || 0,
                variants: Array.isArray(productToEdit.variants) ? productToEdit.variants : [],
                sale_percentage: productToEdit.sale_percentage || 0
            });

            setSearchParams(prev => {
                prev.set('productId', productToEdit.id);
                return prev;
            });
        } else {
            setFormData({ 
                id: null, 
                name: '', 
                description: '', 
                price: 0, 
                stock_quantity: 1, 
                category_id: null, 
                image_gallery: [],
                variants: [],
                sale_percentage: 0
            });
            setSearchParams(prev => {
                prev.delete('productId');
                prev.delete('variantIdx');
                prev.delete('valueIdx');
                return prev;
            });
        }
    }, [productToEdit]);

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
        
        if (onSavingChange) onSavingChange(true);
        
        try {
            if (formData.id) {
                await apiClient.put(`/products/${formData.id}`, payload);
                toast.success('Товар оновлено');
            } else {
                await apiClient.post(`/products`, payload);
                toast.success('Товар створено');
            }
            resetForm();
            if (onSuccess) onSuccess();
        } catch (e) {
            console.error('Помилка збереження:', e);
            toast.error('Помилка збереження');
        } finally {
            setTimeout(() => {
                if (onSavingChange) onSavingChange(false);
            }, 500);
        }
    };

    const resetForm = () => {
        setFormData({ 
            id: null, 
            name: '', 
            description: '', 
            price: 0, 
            stock_quantity: 1, 
            category_id: null, 
            image_gallery: [],
            variants: [],
            sale_percentage: 0
        });
        setSearchParams(prev => {
            prev.delete('productId');
            prev.delete('variantIdx');
            prev.delete('valueIdx');
            return prev;
        });
        
        if (onClose) onClose();
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

    return (
        <div className={styles.editorCard}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {formData.id ? '✏️ Редагування товару' : '➕ Новий товар'}
                </h3>
                <p className={styles.subtitle}>
                    {formData.id ? 'Змініть дані та збережіть' : 'Заповніть картку товару'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={`${styles.customScrollbar} ${styles.scrollableForm}`}>
                    <div>
                        <label className={styles.label}>Назва товару</label>
                        <input 
                            type="text" 
                            className={styles.input}
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ціна (₴)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                className={styles.input}
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Склад</label>
                            <input 
                                type="number" 
                                className={styles.input}
                                value={formData.stock_quantity} 
                                onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{color: '#e53e3e'}}>Знижка (%)</label>
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                className={styles.saleInput}
                                value={formData.sale_percentage} 
                                onChange={e => setFormData({...formData, sale_percentage: parseInt(e.target.value)})} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className={styles.label}>Категорія</label>
                        <select 
                            className={styles.select}
                            value={formData.category_id || ''} 
                            onChange={e => setFormData({...formData, category_id: e.target.value || null})}
                        >
                            <option value="">Без категорії</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={styles.label}>Галерея зображень</label>
                        
                        <div style={{marginBottom: '10px'}}>
                            <ImageInput 
                                value=""
                                onChange={handleAddImage}
                                aspect={1}
                            />
                        </div>

                        <div className={styles.galleryGrid}>
                            {formData.image_gallery.map((img, idx) => (
                                <div key={idx} className={styles.thumbnail}>
                                    <img 
                                        src={`${API_URL}${img}`} 
                                        alt={`img-${idx}`} 
                                        className={styles.thumbImg}
                                    />
                                    
                                    <button 
                                        type="button" 
                                        className={styles.removeThumbBtn}
                                        onClick={() => handleRemoveImage(idx)}
                                        title="Видалити"
                                    >
                                        ×
                                    </button>

                                    {idx === 0 ? (
                                        <div className={styles.coverBadge}>
                                            Обкладинка
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.makeCoverBtn}
                                            onClick={() => handleMakeCover(idx)}
                                            title="Зробити головним фото"
                                        >
                                            ★
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.variantsSection}>
                        <label className={styles.variantsLabel}>
                            ⚙️ Варіанти товару
                        </label>
                        
                        {formData.variants.map((variant, idx) => (
                            <VariantEditor 
                                key={variant.id || idx} 
                                index={idx}
                                variant={variant} 
                                onChange={(updated) => updateVariant(idx, updated)}
                                onRemove={() => removeVariant(idx)}
                                onSavingChange={onSavingChange}
                            />
                        ))}

                        <button 
                            type="button" 
                            onClick={addVariant}
                            className={styles.addVariantBtn}
                        >
                            + Додати опцію (Розмір, Колір...)
                        </button>
                    </div>

                    <div>
                        <label className={styles.label}>Опис товару</label>
                        <textarea 
                            className={styles.textarea}
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className={styles.buttonsRow}>
                    <button 
                        type="submit" 
                        className={styles.primaryButton}
                    >
                        {formData.id ? '💾 Зберегти зміни' : '➕ Створити товар'}
                    </button>
                    {formData.id && (
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className={styles.secondaryButton}
                        >
                            ↶ Відміна
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProductFormModal;
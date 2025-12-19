// frontend/src/modules/site-dashboard/features/shop/products/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../../common/services/api';
import { toast } from 'react-toastify';
import { VariantEditor } from './VariantEditor';
import styles from './ProductFormModal.module.css';
import { IconPlus, IconTrash } from '../../../../../common/components/ui/Icons';
import MediaPickerModal from '../../../../media/components/MediaPickerModal';

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
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [formData, setFormData] = useState({ 
        id: null, name: '', description: '', price: 0, 
        stock_quantity: 1, category_id: '', image_gallery: [],
        variants: [], sale_percentage: 0
    });

    useEffect(() => {
        if (productToEdit) {
            let gallery = Array.isArray(productToEdit.image_gallery) 
                ? productToEdit.image_gallery 
                : (typeof productToEdit.image_gallery === 'string' 
                    ? JSON.parse(productToEdit.image_gallery || '[]') 
                    : []);

            setFormData({ 
                ...productToEdit, 
                image_gallery: gallery,
                variants: Array.isArray(productToEdit.variants) ? productToEdit.variants : [],
                category_id: productToEdit.category_id || ''
            });
            setSearchParams(prev => { prev.set('productId', productToEdit.id); return prev; });
        } else {
            setSearchParams(prev => { 
                prev.delete('productId'); prev.delete('variantIdx'); prev.delete('valueIdx'); 
                return prev; 
            });
            setFormData({ 
                id: null, name: '', description: '', price: 0, 
                stock_quantity: 1, category_id: '', image_gallery: [],
                variants: [], sale_percentage: 0
            });
        }
    }, [productToEdit, setSearchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || formData.price < 0) {
            toast.warning("Вкажіть назву та коректну ціну");
            return;
        }
        
        if (onSavingChange) onSavingChange(true);
        try {
            const payload = { ...formData, site_id: siteId };
            if (payload.category_id === '') payload.category_id = null;

            if (formData.id) await apiClient.put(`/products/${formData.id}`, payload);
            else await apiClient.post(`/products`, payload);
            
            toast.success(formData.id ? 'Товар оновлено' : 'Товар створено');
            if (onSuccess) onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Помилка збереження');
        } finally {
            if (onSavingChange) onSavingChange(false);
        }
    };

    const handleSelectMedia = (selectedFiles) => {
        const newImages = (Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles])
            .map(f => f.path_full);
            
        setFormData(prev => {
            const combined = [...prev.image_gallery];
            newImages.forEach(img => { if (!combined.includes(img)) combined.push(img); });
            return { ...prev, image_gallery: combined };
        });
        setShowMediaPicker(false);
    };

    const handleMakeCover = (index) => {
        if (index === 0) return;
        setFormData(prev => {
            const gallery = [...prev.image_gallery];
            const [item] = gallery.splice(index, 1);
            gallery.unshift(item);
            return { ...prev, image_gallery: gallery };
        });
    };

    return (
        <div className={styles.editorCard}>
            <MediaPickerModal 
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleSelectMedia}
                multiple={true}
                allowedTypes={['image']}
                title="Вибір фото для товару"
            />

            <div className={styles.header}>
                <h3 className={styles.title}>{formData.id ? '✏️ Редагування' : '➕ Новий товар'}</h3>
            </div>

            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={`${styles.customScrollbar} ${styles.scrollableForm}`}>
                    <label className={styles.label}>Назва</label>
                    <input type="text" className={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ціна</label>
                            <input type="number" className={styles.input} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Знижка %</label>
                            <input type="number" className={styles.saleInput} value={formData.sale_percentage} onChange={e => setFormData({...formData, sale_percentage: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Категорія</label>
                        <select 
                            className={styles.input} 
                            value={formData.category_id || ''} 
                            onChange={e => setFormData({...formData, category_id: e.target.value})}
                        >
                            <option value="">Без категорії</option>
                            {categories && categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <label className={styles.label}>Галерея</label>
                    <div className={styles.galleryGrid}>
                        {formData.image_gallery.map((img, idx) => (
                            <div key={idx} className={styles.thumbnail}>
                                <img src={img.startsWith('http') ? img : `${API_URL}${img}`} alt="" className={styles.thumbImg} />
                                <button type="button" className={styles.removeThumbBtn} onClick={() => setFormData(prev => ({...prev, image_gallery: prev.image_gallery.filter((_, i) => i !== idx)}))}><IconTrash size={12}/></button>
                                {idx === 0 ? <div className={styles.coverBadge}>Обкладинка</div> : <button type="button" className={styles.makeCoverBtn} onClick={() => handleMakeCover(idx)}>★</button>}
                            </div>
                        ))}
                        <button type="button" className={formData.image_gallery.length === 0 ? styles.addImagesBtnEmpty : styles.addImagesBtn} onClick={() => setShowMediaPicker(true)}>
                            <IconPlus size={24} /> <span>Додати фото</span>
                        </button>
                    </div>

                    <div className={styles.variantsSection}>
                        <label className={styles.variantsLabel}>⚙️ Опції (Розміри, кольори)</label>
                        {formData.variants.map((v, idx) => (
                            <VariantEditor 
                                key={v.id || idx} 
                                index={idx} 
                                variant={v} 
                                onChange={upd => {
                                    const vts = [...formData.variants]; 
                                    vts[idx] = upd; 
                                    setFormData({...formData, variants: vts});
                                }} 
                                onRemove={() => setFormData({...formData, variants: formData.variants.filter((_, i) => i !== idx)})} 
                                onSavingChange={onSavingChange}
                            />
                        ))}
                        <button type="button" className={styles.addVariantBtn} onClick={() => setFormData({...formData, variants: [...formData.variants, {id: Date.now(), name: '', values: []}]})}>+ Додати опцію</button>
                    </div>

                    <label className={styles.label}>Опис</label>
                    <textarea className={styles.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
                </div>

                <div className={styles.buttonsRow}>
                    <button type="submit" className={styles.primaryButton}>Зберегти</button>
                    <button type="button" onClick={onClose} className={styles.secondaryButton}>Відміна</button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormModal;
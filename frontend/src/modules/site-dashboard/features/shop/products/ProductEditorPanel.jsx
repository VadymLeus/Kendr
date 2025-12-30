// frontend/src/modules/site-dashboard/features/shop/products/ProductEditorPanel.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../../common/services/api';
import { toast } from 'react-toastify';
import { VariantEditor } from './VariantEditor';
import { 
    IconPlus, IconTrash, IconCamera, IconSettings, 
    IconSave, IconX, IconStar 
} from '../../../../../common/components/ui/Icons';
import { Input } from '../../../../../common/components/ui/Input';
import { Button } from '../../../../../common/components/ui/Button';
import CustomSelect from '../../../../../common/components/ui/CustomSelect';
import MediaPickerModal from '../../../../media/components/MediaPickerModal';

const API_URL = 'http://localhost:5000';

const ProductEditorPanel = ({ 
    productToEdit, 
    siteId, 
    categories, 
    onSuccess, 
    onSavingChange, 
    onClose,
    style
}) => {
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
                category_id: productToEdit.category_id ? productToEdit.category_id.toString() : ''
            });
        } else {
            setFormData({ 
                id: null, name: '', description: '', price: 0, 
                stock_quantity: 1, category_id: '', image_gallery: [],
                variants: [], sale_percentage: 0
            });
        }
    }, [productToEdit]);

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

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            ...style 
        },
        header: {
            padding: '16px 20px',
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--platform-bg)',
            minHeight: '64px',
            flexShrink: 0
        },
        title: {
            margin: 0,
            fontSize: '1.15rem',
            fontWeight: '700',
            color: 'var(--platform-text-primary)',
            display: 'flex', alignItems: 'center', gap: '8px'
        },
        scrollableContent: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        footer: {
            padding: '16px 24px',
            borderTop: '1px solid var(--platform-border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            background: 'var(--platform-bg)',
            flexShrink: 0
        },
        sectionTitle: {
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--platform-text-secondary)',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: '6px'
        },
        galleryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
        },
        thumb: {
            aspectRatio: '1',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--platform-border-color)',
            background: 'var(--platform-bg)'
        }
    };

    const categoryOptions = [
        { value: '', label: 'Без категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

    return (
        <div style={styles.container}>
            <MediaPickerModal 
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleSelectMedia}
                multiple={true}
                allowedTypes={['image']}
                title="Вибір фото для товару"
            />

            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>
                        {formData.id ? 'Редагування товару' : 'Створити товар'}
                    </h3>
                    {formData.id && <span style={{fontSize: '0.8em', color: 'var(--platform-text-secondary)'}}>ID: {formData.id}</span>}
                </div>
                <Button variant="ghost" onClick={onClose} style={{padding: '6px', height: 'auto'}}>
                    <IconX size={20} />
                </Button>
            </div>

            <form id="product-form" onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden'}}>
                <div className="custom-scrollbar" style={styles.scrollableContent}>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <Input 
                            label="Назва товару" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                            placeholder="Наприклад: Футболка біла"
                        />
                        
                        <div style={{display: 'flex', gap: '12px'}}>
                            <div style={{flex: 1}}>
                                <Input 
                                    label="Ціна (₴)" 
                                    type="number" 
                                    value={formData.price} 
                                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                                    required 
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <Input 
                                    label="Знижка (%)" 
                                    type="number" 
                                    value={formData.sale_percentage} 
                                    onChange={e => setFormData({...formData, sale_percentage: parseInt(e.target.value) || 0})} 
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{display:'block', marginBottom: '6px', fontSize:'0.9rem', fontWeight:'500', color:'var(--platform-text-secondary)'}}>Категорія</label>
                            <CustomSelect 
                                value={formData.category_id}
                                onChange={e => setFormData({...formData, category_id: e.target.value})}
                                options={categoryOptions}
                                placeholder="Оберіть категорію"
                            />
                        </div>
                    </div>

                    <div>
                        <div style={styles.sectionTitle}>
                            <IconCamera size={14}/> Галерея
                        </div>
                        
                        <div style={styles.galleryGrid}>
                            {formData.image_gallery.map((img, idx) => (
                                <div key={idx} style={styles.thumb}>
                                    <img 
                                        src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                                        alt="" 
                                        style={{width:'100%', height:'100%', objectFit:'cover'}} 
                                    />
                                    <div className="thumb-overlay" style={{position:'absolute', top:0, right:0, bottom:0, left:0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s'}}>
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, image_gallery: prev.image_gallery.filter((_, i) => i !== idx)}))} style={{position:'absolute', top:4, right:4, background:'#e53e3e', color:'white', border:'none', borderRadius:4, width:22, height:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <IconTrash size={12}/>
                                        </button>
                                        {idx !== 0 && (
                                            <button type="button" onClick={() => handleMakeCover(idx)} title="Зробити обкладинкою" style={{position:'absolute', bottom:4, left:4, background:'white', color:'#f59e0b', border:'none', borderRadius:4, width:22, height:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                <IconStar size={12} filled />
                                            </button>
                                        )}
                                    </div>
                                    {idx === 0 && <div style={{position:'absolute', bottom:0, width:'100%', textAlign:'center', background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.6rem', padding:'2px', fontWeight:'bold'}}>COVER</div>}
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => setShowMediaPicker(true)}
                                style={{
                                    border: '1px dashed var(--platform-border-color)',
                                    borderRadius: '8px',
                                    background: 'var(--platform-bg)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--platform-text-secondary)',
                                    aspectRatio: '1',
                                    transition: 'all 0.2s'
                                }}
                                className="add-img-btn"
                            >
                                <IconPlus size={24}/>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                            <div style={{...styles.sectionTitle, marginBottom: 0}}>
                                <IconSettings size={14}/> Опції товару
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                style={{padding: '6px 10px', fontSize: '0.8rem', height: 'auto'}}
                                onClick={() => setFormData({...formData, variants: [...formData.variants, {id: Date.now(), name: '', values: []}]})}
                            >
                                <IconPlus size={14}/> Опція
                            </Button>
                        </div>
                        
                        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
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
                            {formData.variants.length === 0 && (
                                <div style={{textAlign:'center', padding:'20px', border:'1px dashed var(--platform-border-color)', borderRadius:'8px', color:'var(--platform-text-secondary)', fontSize:'0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                                    <IconSettings size={24} style={{opacity: 0.3}}/>
                                    <span>Немає опцій (розмір, колір тощо)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                         <label style={{display:'block', marginBottom: '6px', fontSize:'0.9rem', fontWeight:'500', color:'var(--platform-text-secondary)'}}>Опис</label>
                         <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            rows={5}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '8px',
                                border: '1px solid var(--platform-border-color)',
                                background: 'var(--platform-bg)', color: 'var(--platform-text-primary)',
                                resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
                            }}
                         />
                    </div>
                </div>

                <div style={styles.footer}>
                    <Button type="button" variant="outline" onClick={onClose}>Закрити</Button>
                    <Button type="submit" variant="primary" icon={<IconSave size={16}/>}>
                        Зберегти
                    </Button>
                </div>
            </form>
            <style>{`
                .thumb:hover .thumb-overlay { opacity: 1 !important; }
                .add-img-btn:hover { border-color: var(--platform-accent) !important; color: var(--platform-accent) !important; background: var(--platform-card-bg) !important; }
            `}</style>
        </div>
    );
};

export default ProductEditorPanel;
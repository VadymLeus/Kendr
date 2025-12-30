// frontend/src/modules/site-dashboard/features/shop/products/VariantEditor.jsx
import React, { memo, useState, useEffect } from 'react';
import { useConfirm } from '../../../../../common/hooks/useConfirm';
import { Input } from '../../../../../common/components/ui/Input';
import { Button } from '../../../../../common/components/ui/Button';
import { IconEdit, IconPlus, IconX, IconSave, IconUndo, IconTrash } from '../../../../../common/components/ui/Icons';

const VariantEditor = memo(({ variant, onChange, onRemove }) => {
    const [inputState, setInputState] = useState({ label: '', price: '', sale: '' });
    const { confirm } = useConfirm();
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
        header: {
            display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '16px'
        },
        tagsArea: {
            display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px'
        },
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
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr', 
            gap: '12px', 
            alignItems: 'start',
            marginBottom: '12px'
        },
        buttonRow: {
            display: 'flex',
            gap: '10px',
            marginTop: '10px'
        }
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
                    <div 
                        key={idx} 
                        style={styles.tag(idx === editingIndex)}
                        onClick={() => setEditingIndex(idx)}
                    >
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
                    <Input 
                        placeholder="Значення (XL)" 
                        value={inputState.label} 
                        onChange={e => setInputState({...inputState, label: e.target.value})}
                        style={{margin:0}} wrapperStyle={{margin:0}}
                    />
                    <Input 
                        placeholder="+Ціна" 
                        type="number"
                        value={inputState.price} 
                        onChange={e => setInputState({...inputState, price: e.target.value})}
                        style={{margin:0}} wrapperStyle={{margin:0}}
                    />
                    <Input 
                        placeholder="Зниж. %" 
                        type="number"
                        value={inputState.sale} 
                        onChange={e => setInputState({...inputState, sale: e.target.value})}
                        style={{margin:0}} wrapperStyle={{margin:0}}
                    />
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

export { VariantEditor };
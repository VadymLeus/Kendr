// frontend/src/modules/site-dashboard/features/shop/products/VariantEditor.jsx

import React, { memo, useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConfirm } from '../../../../../common/hooks/useConfirm';
import { toast } from 'react-toastify';

const STATIC_STYLES = {
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
    }
};

const BUTTON_STYLES = {
    primary: {
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
    },
    secondary: {
        background: 'transparent', 
        border: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)', 
        width: 'auto',
        padding: '8px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    danger: {
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
    },
    removeValue: {
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
    }
};

const VariantEditor = memo(({ variant, onChange, onRemove, index, onSavingChange }) => {
    const [inputState, setInputState] = useState({ label: '', price: '', sale: '' });
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
            setInputState({ 
                label: val.label, 
                price: val.priceModifier || '', 
                sale: val.salePercentage || '' 
            });
        } else {
            setInputState({ label: '', price: '', sale: '' });
        }
    }, [editingValueIndex, variant.values]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setInputState(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSaveValue = useCallback((e) => {
        if (e) e.preventDefault();
        
        const label = inputState.label.trim();
        if (!label) return;
        
        const valueData = { 
            label: label, 
            priceModifier: parseFloat(inputState.price) || 0,
            salePercentage: parseInt(inputState.sale) || 0
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
    }, [inputState, variant, editingValueIndex, onChange]);

    const startEditing = useCallback((valIdx) => {
        setSearchParams(prev => {
            prev.set('variantIdx', String(index));
            prev.set('valueIdx', String(valIdx));
            return prev;
        });
    }, [index, setSearchParams]);

    const resetInput = useCallback(() => {
        setSearchParams(prev => {
            prev.delete('variantIdx');
            prev.delete('valueIdx');
            return prev;
        });
        setInputState({ label: '', price: '', sale: '' });
    }, [setSearchParams]);

    const handleRemoveValue = useCallback(async (idx, label, e) => {
        e.stopPropagation();
        const isConfirmed = await confirm({
            title: "Видалити значення?",
            message: `Ви впевнені, що хочете видалити варіант "${label}"?`,
            type: "danger",
            confirmLabel: "Видалити",
            cancelLabel: "Скасувати"
        });

        if (isConfirmed) {
            if (onSavingChange) onSavingChange(true);
            
            try {
                const newValues = variant.values.filter((_, i) => i !== idx);
                onChange({ ...variant, values: newValues });
                
                if (editingValueIndex === idx) resetInput();
            } finally {
                setTimeout(() => {
                    if (onSavingChange) onSavingChange(false);
                }, 300);
            }
        }
    }, [variant, confirm, onSavingChange, onChange, editingValueIndex, resetInput]);

    const handleRemoveVariant = useCallback(async () => {
        const isConfirmed = await confirm({
            title: "Видалити опцію?",
            message: `Ви впевнені, що хочете видалити опцію "${variant.name || 'Без назви'}" та всі її значення?`,
            type: "danger",
            confirmLabel: "Видалити",
            cancelLabel: "Скасувати"
        });

        if (isConfirmed) {
            if (onSavingChange) onSavingChange(true);
            
            try {
                onRemove();
            } finally {
                setTimeout(() => {
                    if (onSavingChange) onSavingChange(false);
                }, 300);
            }
        }
    }, [variant.name, confirm, onSavingChange, onRemove]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveValue();
        }
    }, [handleSaveValue]);

    return (
        <div style={STATIC_STYLES.container}>
            <div style={STATIC_STYLES.header}>
                <input 
                    type="text" 
                    value={variant.name} 
                    onChange={(e) => onChange({...variant, name: e.target.value})}
                    placeholder="Назва опції (напр. Розмір)"
                    style={STATIC_STYLES.optionNameInput}
                />
                <button 
                    type="button" 
                    onClick={handleRemoveVariant} 
                    style={BUTTON_STYLES.danger}
                    title="Видалити опцію"
                >
                    ×
                </button>
            </div>

            <div style={STATIC_STYLES.valuesList}>
                {variant.values && variant.values.map((val, idx) => (
                    <div 
                        key={idx} 
                        style={STATIC_STYLES.valueTag(idx === editingValueIndex)} 
                        onClick={() => startEditing(idx)}
                        title="Натисніть, щоб редагувати"
                    >
                        <div style={STATIC_STYLES.textContainer}>
                            <span style={STATIC_STYLES.truncatedText}>
                                {idx === editingValueIndex ? '✏️ ' : ''}{val.label}
                            </span>
                            <div>
                                {val.priceModifier !== 0 && (
                                    <span style={{
                                        ...STATIC_STYLES.priceText,
                                        color: val.priceModifier > 0 ? 'var(--platform-success)' : 'var(--platform-danger)', 
                                    }}>
                                        {val.priceModifier > 0 ? '+' : ''}{val.priceModifier} ₴
                                    </span>
                                )}
                                {val.salePercentage > 0 && (
                                    <span style={STATIC_STYLES.saleText}>
                                        -{val.salePercentage}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={(e) => handleRemoveValue(idx, val.label, e)} 
                            style={BUTTON_STYLES.removeValue}
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
                    <label style={STATIC_STYLES.label}>Значення</label>
                    <input 
                        type="text" 
                        name="label"
                        value={inputState.label} 
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="XL" 
                        style={{...STATIC_STYLES.inputField, marginBottom: 0}}
                    />
                </div>
                
                <div>
                    <label style={STATIC_STYLES.label}>Ціна (₴)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        name="price"
                        value={inputState.price} 
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="+/-" 
                        style={{...STATIC_STYLES.inputField, marginBottom: 0}}
                    />
                </div>

                <div>
                    <label style={STATIC_STYLES.label}>Знижка (%)</label>
                    <input 
                        type="number" 
                        min="0"
                        max="100"
                        name="sale"
                        value={inputState.sale} 
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="%" 
                        style={{...STATIC_STYLES.inputField, marginBottom: 0}}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    gridColumn: '1 / -1'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <button 
                            type="button" 
                            onClick={handleSaveValue} 
                            style={{
                                ...BUTTON_STYLES.primary,
                                background: editingValueIndex !== null ? '#ecc94b' : 'var(--platform-accent)',
                                color: editingValueIndex !== null ? 'black' : 'var(--platform-accent-text)',
                            }}
                        >
                            {editingValueIndex !== null ? '💾 Зберегти' : '➕ Додати'}
                        </button>
                    </div>
                    
                    {editingValueIndex !== null && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <button 
                                type="button" 
                                onClick={resetInput} 
                                style={{...BUTTON_STYLES.secondary, width: '100%'}}
                            >
                                ↶ Скасувати
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.variant === nextProps.variant && 
           prevProps.index === nextProps.index;
});

export { VariantEditor };
// frontend/src/components/editor/settings/CatalogSettings.jsx
import React, { useState } from 'react';

const CatalogSettings = ({ initialData, onSave, onClose, siteData }) => {
    const [data, setData] = useState({
        ...initialData,
        selectedProductIds: initialData.selectedProductIds || []
    });
    
    const allProducts = siteData?.products || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductToggle = (productId) => {
        setData(prev => {
            const currentIds = new Set(prev.selectedProductIds);
            if (currentIds.has(productId)) {
                currentIds.delete(productId);
            } else {
                currentIds.add(productId);
            }
            return { ...prev, selectedProductIds: Array.from(currentIds) };
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
    };

    const formGroupStyle = {
        marginBottom: '1.5rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--site-text-primary)',
        fontWeight: '500'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--site-border-color)',
        borderRadius: '4px',
        fontSize: '1rem',
        background: 'var(--site-card-bg)',
        color: 'var(--site-text-primary)'
    };

    const productsContainerStyle = {
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid var(--site-border-color)',
        borderRadius: '8px',
        padding: '1rem',
        background: 'var(--site-bg)'
    };

    const productItemStyle = {
        display: 'block',
        padding: '0.75rem 0',
        cursor: 'pointer',
        borderBottom: '1px solid var(--site-border-color)',
        color: 'var(--site-text-primary)',
        transition: 'background-color 0.2s ease'
    };

    const checkboxStyle = {
        marginRight: '10px',
        cursor: 'pointer'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--site-card-bg)',
        color: 'var(--site-text-primary)',
        border: '1px solid var(--site-border-color)'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--site-accent)',
        color: 'var(--site-accent-text)'
    };

    return (
        <form onSubmit={handleSave}>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок секції товарів:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні Товари'} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                    placeholder="Введіть заголовок секції"
                />
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Оберіть товари для відображення:</label>
                <div style={productsContainerStyle}>
                    {allProducts.length > 0 ? (
                        allProducts.map(product => (
                            <label 
                                key={product.id} 
                                style={productItemStyle}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--site-card-bg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={data.selectedProductIds.includes(product.id)}
                                    onChange={() => handleProductToggle(product.id)}
                                    style={checkboxStyle}
                                />
                                {product.name} ({product.price} грн.)
                            </label>
                        ))
                    ) : (
                        <p style={{ 
                            color: 'var(--site-text-secondary)', 
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}>
                            Для цього сайту ще не додано товарів.
                        </p>
                    )}
                </div>
            </div>

            <p style={{ 
                color: 'var(--site-text-secondary)', 
                marginTop: '15px',
                fontSize: '0.9rem',
                lineHeight: '1.4'
            }}>
                Для додавання, редагування або видалення самих товарів перейдіть на вкладку 
                <strong style={{color: 'var(--site-text-primary)'}}> "Товари та Категорії" </strong> 
                в меню управління сайтом.
            </p>

            <div style={buttonContainerStyle}>
                <button 
                    type="button" 
                    onClick={onClose}
                    style={secondaryButtonStyle}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--site-accent)';
                        e.target.style.color = 'var(--site-accent)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--site-border-color)';
                        e.target.style.color = 'var(--site-text-primary)';
                    }}
                >
                    Скасувати
                </button>
                <button 
                    type="submit" 
                    style={primaryButtonStyle}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--site-accent-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'var(--site-accent)';
                    }}
                >
                    Зберегти
                </button>
            </div>
        </form>
    );
};

export default CatalogSettings;
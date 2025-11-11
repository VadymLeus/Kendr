// frontend/src/components/editor/settings/CatalogSettings.jsx
import React from 'react';

const CatalogSettings = ({ data, onChange, siteData }) => {
    
    const allProducts = siteData?.products || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const handleProductToggle = (productId) => {
        const currentIds = new Set(data.selectedProductIds || []);
        if (currentIds.has(productId)) {
            currentIds.delete(productId);
        } else {
            currentIds.add(productId);
        }
        onChange({ ...data, selectedProductIds: Array.from(currentIds) });
    };

    const formGroupStyle = { marginBottom: '1.5rem' };
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

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Заголовок розділу:</label>
                <input 
                    type="text" 
                    name="title" 
                    value={data.title || 'Популярні товари'} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                    placeholder="Введіть заголовок розділу"
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
                                onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--site-card-bg)'; }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                            >
                                <input
                                    type="checkbox"
                                    checked={(data.selectedProductIds || []).includes(product.id)}
                                    onChange={() => handleProductToggle(product.id)}
                                    style={checkboxStyle}
                                />
                                {product.name} ({product.price} грн)
                            </label>
                        ))
                    ) : (
                        <p style={{ 
                            color: 'var(--site-text-secondary)', 
                            textAlign: 'center', 
                            fontStyle: 'italic' 
                        }}>
                            До цього сайту ще не додано жодного товару.
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
                Щоб додати, редагувати або видалити самі товари, перейдіть на вкладку
                <strong style={{color: 'var(--site-text-primary)'}}> "Товари та категорії" </strong> 
                в меню керування сайтом.
            </p>
        </div>
    );
};

export default CatalogSettings;
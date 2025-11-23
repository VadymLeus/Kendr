// frontend/src/features/editor/blocks/CategoriesGridBlock.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const CategoryItem = ({ item, isEditorPreview }) => {
    const cardBg = 'var(--site-card-bg)';
    const borderColor = 'var(--site-border-color)';
    const textPrimary = 'var(--site-text-primary)';
    
    const imageUrl = item.image
        ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`)
        : 'https://placehold.co/300x300/EFEFEF/31343C?text=Image';

    const cardStyle = {
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'block',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isEditorPreview ? '0 1px 4px rgba(0,0,0,0.05)' : 'none', 
    };

    const imageStyle = {
        width: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderBottom: `1px solid ${borderColor}`,
    };

    const titleStyle = {
        padding: '1rem',
        textAlign: 'center',
        fontWeight: '600',
        color: textPrimary,
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };
    
    if (isEditorPreview) {
        return (
            <a 
                href={item.link || '#'} 
                onClick={(e) => e.preventDefault()} 
                style={cardStyle}
                title="Це попередній перегляд, посилання вимкнено"
            >
                <img src={imageUrl} alt={item.title} style={imageStyle} />
                <h4 style={titleStyle}>{item.title || 'Новий елемент'}</h4>
            </a>
        );
    }

    return (
        <Link 
            to={item.link || '#'} 
            style={cardStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <img src={imageUrl} alt={item.title} style={imageStyle} />
            <h4 style={titleStyle}>{item.title || 'Новий елемент'}</h4>
        </Link>
    );
};

const CategoriesGridBlock = ({ blockData, isEditorPreview }) => {
    const { columns = 3, items = [] } = blockData;

    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    const borderColor = 'var(--site-border-color)';
    const siteBg = 'var(--site-bg)';
    
    const containerStyle = {
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: isEditorPreview ? siteBg : 'transparent',
        ...(isEditorPreview && {
             border: `1px dashed ${borderColor}`,
             borderRadius: '8px'
        })
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1.5rem',
    };

    if (items.length === 0) {
        return (
            <div style={{...containerStyle, textAlign: 'center', padding: '3rem'}}>
                <span style={{fontSize: '2rem'}}>🗂️</span>
                 <h4 style={{color: textPrimary, margin: '1rem 0 0.5rem 0'}}>Вітрина категорій</h4>
                <p style={{color: textSecondary, margin: 0}}>
                    Блок порожній. Додайте елементи у налаштуваннях.
                </p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                {items.map((item) => (
                    <CategoryItem 
                        key={item.id} 
                        item={item} 
                        isEditorPreview={isEditorPreview} 
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoriesGridBlock;
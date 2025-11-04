// frontend/src/components/media/ImageInput.jsx
import React, { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

const API_URL = 'http://localhost:5000';

const ImageInput = ({ value, onChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectImage = (newUrl) => {
        onChange(newUrl);
        setIsModalOpen(false);
    };

    const containerStyle = {
        width: '100%',
        position: 'relative',
        aspectRatio: '16 / 9',
        backgroundColor: 'var(--site-bg)',
        border: '1px solid var(--site-border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    };

    const placeholderStyle = {
        color: 'var(--site-text-secondary)',
        fontSize: '0.9rem'
    };

    const buttonContainerStyle = {
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        background: 'var(--site-card-bg)',
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid var(--site-border-color)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    };

    const buttonStyle = {
        background: 'var(--site-accent)',
        color: 'var(--site-accent-text)',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        background: 'var(--site-danger)',
        color: 'white'
    };

    const labelStyle = {
        display: 'block', 
        marginBottom: '0.5rem',
        color: 'var(--site-text-primary)',
        fontWeight: '500'
    };

    return (
        <div className="image-input-container">
            <label style={labelStyle}>Зображення:</label>
            <div style={containerStyle}>
                {value ? (
                    <img 
                        src={value.startsWith('http') ? value : `${API_URL}${value}`} 
                        alt="Попередній перегляд" 
                        style={imageStyle} 
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/400x300/AAAAAA/FFFFFF?text=Помилка+Завантаження" 
                        }}
                    />
                ) : (
                    <div style={placeholderStyle}>
                        <span>Немає зображення</span>
                    </div>
                )}
                
                <div style={buttonContainerStyle}>
                    <button 
                        type="button" 
                        style={buttonStyle}
                        onClick={() => setIsModalOpen(true)}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--site-accent-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'var(--site-accent)';
                        }}
                    >
                        {value ? 'Змінити' : 'Вибрати...'}
                    </button>
                    {value && (
                        <button 
                            type="button" 
                            style={deleteButtonStyle}
                            onClick={() => onChange('')}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--site-danger-hover, #c53030)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'var(--site-danger)';
                            }}
                        >
                            Видалити
                        </button>
                    )}
                </div>
            </div>
            
            <MediaPickerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
            />
        </div>
    );
};

export default ImageInput;
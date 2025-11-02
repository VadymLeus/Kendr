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
        backgroundColor: 'var(--platform-bg)',
        border: '1px solid var(--platform-border-color)',
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
        color: 'var(--platform-text-secondary)',
        fontSize: '0.9rem'
    };

    const buttonContainerStyle = {
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '5px 10px',
        borderRadius: '6px'
    };

    const buttonStyle = {
        background: '#f0f0f0',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer'
    };

    return (
        <div className="image-input-container">
            <label style={{display: 'block', marginBottom: '0.5rem'}}>Зображення:</label>
            <div style={containerStyle}>
                {value ? (
                    <img 
                        src={value.startsWith('http') ? value : `${API_URL}${value}`} 
                        alt="Попередній перегляд" 
                        style={imageStyle} 
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/AAAAAA/FFFFFF?text=Помилка" }}
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
                    >
                        {value ? 'Змінити' : 'Вибрати...'}
                    </button>
                    {value && (
                        <button 
                            type="button" 
                            style={{...buttonStyle, background: '#e53e3e', color: 'white'}}
                            onClick={() => onChange('')}
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
// frontend/src/shared/ui/elements/Avatar.jsx
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000'; 
const stringToColor = (string) => {
    if (!string) return '#cbd5e1'; 
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360); 
    return `hsl(${h}, 65%, 45%)`; 
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};

const Avatar = ({ url, name, size = 40, fontSize, className = '', style = {} }) => {
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [url]);

    const getFullUrl = (src) => {
        if (!src) return null;
        if (src.startsWith('blob:')) return src;
        if (src.startsWith('http')) return src;
        return `${API_URL}${src}`;
    };

    const finalUrl = getFullUrl(url);
    
    const containerBaseStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        ...style
    };

    if (finalUrl && !imgError) {
        return (
            <img 
                src={finalUrl} 
                alt={name || 'User'} 
                className={`object-cover ${className}`}
                style={{ ...containerBaseStyle, objectFit: 'cover' }}
                onError={() => setImgError(true)}
            />
        );
    }

    const bgColor = stringToColor(name || 'User');
    const calculatedFontSize = fontSize || `${Math.round(size * 0.45)}px`;

    return (
        <div 
            className={className}
            style={{ 
                ...containerBaseStyle, 
                backgroundColor: bgColor,
                color: '#fff',
                fontWeight: '600',
                fontSize: calculatedFontSize,
                textTransform: 'uppercase',
                userSelect: 'none'
            }}
            title={name}
        >
            {getInitials(name)}
        </div>
    );
};

export default Avatar;
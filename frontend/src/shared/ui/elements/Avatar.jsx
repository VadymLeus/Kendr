// frontend/src/shared/ui/elements/Avatar.jsx
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

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
        return `${BASE_URL}${src}`;
    };

    const finalUrl = getFullUrl(url);
    const sizeStyle = {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: fontSize || `${Math.round(size * 0.45)}px`,
        ...style
    };
    if (finalUrl && !imgError) {
        return (
            <div className={`avatar-container ${className}`} style={sizeStyle}>
                <img 
                    src={finalUrl} 
                    alt={name || 'User'} 
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            </div>
        );
    }

    const bgColor = stringToColor(name || 'User');
    return (
        <div 
            className={`avatar-container ${className}`}
            style={{ 
                ...sizeStyle, 
                backgroundColor: bgColor,
                color: '#ffffff',
            }}
            title={name}
        >
            {getInitials(name)}
        </div>
    );
};

export default Avatar;
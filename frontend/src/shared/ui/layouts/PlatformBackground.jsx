// frontend/src/shared/ui/layouts/PlatformBackground.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';

const API_URL = 'http://localhost:5000';
const PlatformBackground = () => {
    const { user } = useContext(AuthContext);

    if (!user || !user.platform_bg_url) return null;

    const bgUrl = user.platform_bg_url.startsWith('http') 
        ? user.platform_bg_url 
        : `${API_URL}${user.platform_bg_url}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: `blur(${user.platform_bg_blur || 0}px) brightness(${user.platform_bg_brightness || 100}%)`,
                backgroundColor: 'rgba(0,0,0,0.1)',
                transition: 'backdrop-filter 0.3s ease'
            }} />
        </div>
    );
};

export default PlatformBackground;
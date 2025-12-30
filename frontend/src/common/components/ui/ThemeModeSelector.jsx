// frontend/src/common/components/ui/ThemeModeSelector.jsx
import React from 'react';
import { IconSun, IconMoon } from './Icons';
import { resolveAccentColor } from '../../utils/themeUtils';

const ThemeModeSelector = ({ currentMode, accentColor, onChange }) => {
    const activeColor = resolveAccentColor(accentColor);

    const Card = ({ mode, label, icon: Icon, gradient }) => {
        const isActive = currentMode === mode;
        
        return (
            <div 
                style={{
                    border: `2px solid ${isActive ? activeColor : 'var(--platform-border-color)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'var(--platform-bg)',
                    boxShadow: isActive ? `0 4px 20px ${activeColor}33` : 'none',
                    position: 'relative'
                }}
                onClick={() => onChange(mode)}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.borderColor = activeColor;
                        e.currentTarget.style.boxShadow = `0 4px 20px ${activeColor}33`;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                <div style={{ height: '120px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: gradient, padding: '12px' }}>
                        <div style={{ height: '20px', background: activeColor, borderRadius: '4px', marginBottom: '12px', opacity: 0.8 }}></div>
                        <div style={{ display: 'flex', gap: '8px', height: 'calc(100% - 32px)' }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '1rem' }}>
                    <Icon size={20} color={isActive ? activeColor : 'currentColor'} /> 
                    <span>{label}</span>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px' }}>
            <Card 
                mode="light" 
                label="Світла тема" 
                icon={IconSun} 
                gradient="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" 
            />
            <Card 
                mode="dark" 
                label="Темна тема" 
                icon={IconMoon} 
                gradient="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)" 
            />
        </div>
    );
};

export default ThemeModeSelector;
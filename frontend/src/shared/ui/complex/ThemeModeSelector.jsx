// frontend/src/shared/ui/complex/ThemeModeSelector.jsx
import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { resolveAccentColor } from '../../lib/utils/themeUtils';

const ThemeModeSelector = ({ currentMode, accentColor, onChange }) => {
    const [hoveredMode, setHoveredMode] = useState(null);
    const activeColor = resolveAccentColor(accentColor);

    const Card = ({ mode, label, icon: Icon, gradient }) => {
        const isActive = currentMode === mode;
        const isHovered = hoveredMode === mode;

        return (
            <div
                style={{
                    border: `2px solid ${isActive || isHovered ? activeColor : 'var(--platform-border-color)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'var(--platform-bg)',
                    boxShadow: 'none',
                    position: 'relative'
                }}
                onClick={() => onChange(mode)}
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
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
                icon={Sun}
                gradient="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
            />
            <Card
                mode="dark"
                label="Темна тема"
                icon={Moon}
                gradient="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
            />
        </div>
    );
};

export default ThemeModeSelector;
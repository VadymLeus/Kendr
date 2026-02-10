// frontend/src/shared/ui/complex/ThemeModeSelector.jsx
import React, { useState } from 'react';
import { resolveAccentColor } from '../../utils/themeUtils';
import { Sun, Moon } from 'lucide-react';

const ThemeModeSelector = ({ currentMode, accentColor, onChange }) => {
    const [hoveredMode, setHoveredMode] = useState(null);
    const activeColor = resolveAccentColor(accentColor);
    const Card = ({ mode, label, icon: Icon, gradient }) => {
        const isActive = currentMode === mode;
        const isHovered = hoveredMode === mode;
        return (
            <div
                className={`
                    border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 relative bg-(--platform-bg)
                    ${isActive || isHovered ? '' : 'border-(--platform-border-color)'}
                `}
                style={{ 
                    borderColor: isActive || isHovered ? activeColor : undefined 
                }}
                onClick={() => onChange(mode)}
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
            >
                <div className="h-30 mb-4 rounded-lg overflow-hidden">
                    <div className="h-full p-3" style={{ background: gradient }}>
                        <div 
                            className="h-5 rounded mb-3 opacity-80" 
                            style={{ background: activeColor }}
                        ></div>
                        <div className="flex gap-2 h-[calc(100%-32px)]">
                            <div className="flex-1 bg-white/20 rounded"></div>
                            <div className="flex-1 bg-white/20 rounded"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 font-semibold text-(--platform-text-primary) text-base">
                    <Icon size={20} color={isActive ? activeColor : 'currentColor'} />
                    <span>{label}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mt-4">
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
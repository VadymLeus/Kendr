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
                    border-2 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 relative bg-(--platform-bg) shadow-sm
                    ${isActive || isHovered ? '' : 'border-(--platform-border-color)'}
                `}
                style={{ 
                    borderColor: isActive || isHovered ? activeColor : undefined 
                }}
                onClick={() => onChange(mode)}
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
            >
                <div className="h-28 sm:h-32 mb-4 rounded-lg overflow-hidden border border-(--platform-border-color)">
                    <div className="h-full p-3" style={{ background: gradient }}>
                        <div 
                            className="h-4 sm:h-5 rounded mb-2.5 sm:mb-3 opacity-80 shadow-sm" 
                            style={{ background: activeColor }}
                        ></div>
                        <div className="flex gap-2 h-[calc(100%-28px)] sm:h-[calc(100%-32px)]">
                            <div className="flex-1 bg-white/25 rounded shadow-sm"></div>
                            <div className="flex-1 bg-white/25 rounded shadow-sm"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 font-semibold text-(--platform-text-primary) text-sm sm:text-base">
                    <Icon size={18} className="sm:w-5 sm:h-5" color={isActive ? activeColor : 'currentColor'} />
                    <span>{label}</span>
                </div>
            </div>
        );
    };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
// frontend/src/shared/ui/complex/PasswordStrengthMeter.jsx
import React from 'react';
import { analyzePassword } from '../../utils/validationUtils';
import { Check, X } from 'lucide-react';

const PasswordStrengthMeter = ({ password }) => {
    const { score, checks } = analyzePassword(password);
    const getStrengthColorClass = () => {
        if (score <= 1) return 'bg-(--platform-danger)';
        if (score === 2 || score === 3) return 'bg-(--platform-warning)';
        return 'bg-(--platform-success)';
    };

    const getStrengthLabel = () => {
        if (!password || password.length === 0) return 'Рівень безпеки';
        if (score <= 2) return 'Слабкий';
        if (score === 3) return 'Середній';
        return 'Надійний';
    };

    const bars = [1, 2, 3, 4];
    const requirements = [
        { label: 'Мінімум 8 символів', met: checks.isLongEnough },
        { label: 'Велика літера (A-Z)', met: checks.hasCapital },
        { label: 'Мала літера (a-z)', met: checks.hasLower },
        { label: 'Цифра (0-9)', met: checks.hasNumber },
    ];

    return (
        <div className="mt-2 mb-4">
            <div className="flex gap-1 mb-2">
                {bars.map((barIndex) => (
                    <div 
                        key={barIndex}
                        className={`
                            h-1 flex-1 rounded-sm transition-colors duration-300
                            ${barIndex <= score ? getStrengthColorClass() : 'bg-(--platform-border-color)'}
                        `}
                    />
                ))}
            </div>
            <div className="text-xs text-(--platform-text-secondary) font-semibold mb-3 text-right">
                {getStrengthLabel()}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {requirements.map((req, index) => (
                    <div 
                        key={index} 
                        className={`
                            flex items-center gap-1.5 text-xs transition-colors duration-200
                            ${req.met ? 'text-(--platform-success)' : 'text-(--platform-text-secondary)'}
                        `}
                    >
                        {req.met ? (
                            <Check size={14} className="text-(--platform-success)" strokeWidth={3} />
                        ) : (
                            <X size={14} className="text-(--platform-text-secondary) opacity-50" />
                        )}
                        <span className={req.met ? 'opacity-100' : 'opacity-80'}>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
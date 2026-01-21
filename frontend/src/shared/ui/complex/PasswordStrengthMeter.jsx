// frontend/src/shared/ui/complex/PasswordStrengthMeter.jsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { analyzePassword } from '../../utils/validationUtils';

const PasswordStrengthMeter = ({ password }) => {
    const { score, checks } = analyzePassword(password);
    const getStrengthColor = () => {
        if (score <= 1) return '#e53e3e';
        if (score === 2 || score === 3) return '#ecc94b';
        return '#48bb78';
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
        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {bars.map((barIndex) => (
                    <div 
                        key={barIndex}
                        style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: barIndex <= score ? getStrengthColor() : 'var(--platform-border-color)',
                            transition: 'background-color 0.3s ease'
                        }} 
                    />
                ))}
            </div>

            <div style={{ 
                fontSize: '0.8rem', 
                color: 'var(--platform-text-secondary)', 
                fontWeight: '600',
                marginBottom: '12px',
                textAlign: 'right'
            }}>
                {getStrengthLabel()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {requirements.map((req, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontSize: '0.75rem',
                            color: req.met ? 'var(--platform-success)' : 'var(--platform-text-secondary)',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        {req.met ? (
                            <Check size={14} color="var(--platform-success)" strokeWidth={3} />
                        ) : (
                            <X size={14} color="var(--platform-text-secondary)" style={{ opacity: 0.5 }} />
                        )}
                        <span style={{ opacity: req.met ? 1 : 0.8 }}>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
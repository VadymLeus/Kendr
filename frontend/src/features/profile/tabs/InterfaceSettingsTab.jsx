// frontend/src/features/profile/tabs/InterfaceSettingsTab.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

// --- РАСШИРЕННАЯ ПАЛИТРА ЦВЕТОВ ---
const accentColors = [
    { name: 'Синій', value: 'blue', color: '#4299e1' },
    { name: 'Зелений', value: 'green', color: '#48bb78' },
    { name: 'Помаранчевий', value: 'orange', color: '#ed8936' },
    { name: 'Сірий', value: 'gray', color: '#718096' },
    { name: 'Жовтий', value: 'yellow', color: '#ecc94b' },
    { name: 'Червоний', value: 'red', color: '#f56565' },
    { name: 'Фіолетовий', value: 'purple', color: '#9f7aea' },
    { name: 'Лаймовий', value: 'lime', color: '#a0d468' },
];

const InterfaceSettingsTab = () => {
    const { platformMode, setPlatformMode, platformAccent, setPlatformAccent } = useContext(ThemeContext);

    const modes = [
        { value: 'light', label: 'Світлий' },
        { value: 'dark', label: 'Темний' },
        { value: 'system', label: 'Системний' }
    ];

    return (
        <div className="card">
            <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                Зовнішній вигляд платформи
            </h3>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                Налаштуйте вигляд інтерфейсу Kendr.
            </p>

            {/* Режим темы */}
            <div style={{ marginTop: '1.5rem' }}>
                <label style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    marginBottom: '1rem',
                    color: 'var(--platform-text-primary)'
                }}>
                    Режим:
                </label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {modes.map(mode => (
                        <label 
                            key={mode.value}
                            style={{
                                cursor: 'pointer', 
                                padding: '12px 16px', 
                                borderRadius: '8px', 
                                border: '1px solid',
                                borderColor: platformMode === mode.value ? 'var(--platform-accent)' : 'var(--platform-border-color)',
                                backgroundColor: platformMode === mode.value ? 'var(--platform-accent)' : 'transparent',
                                color: platformMode === mode.value ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)',
                                transition: 'all 0.2s ease',
                                fontWeight: platformMode === mode.value ? '500' : 'normal'
                            }}
                        >
                            <input
                                type="radio"
                                name="platformMode"
                                value={mode.value}
                                checked={platformMode === mode.value}
                                onChange={() => setPlatformMode(mode.value)}
                                style={{ marginRight: '8px' }}
                            />
                            {mode.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Акцентные цвета */}
            <div style={{ marginTop: '2rem' }}>
                <label style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    marginBottom: '1rem',
                    color: 'var(--platform-text-primary)'
                }}>
                    Акцентний колір:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {accentColors.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setPlatformAccent(opt.value)}
                            title={opt.name}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: opt.color,
                                border: platformAccent === opt.value ? 
                                    '3px solid var(--platform-text-primary)' : 
                                    '3px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: platformAccent === opt.value ? 'scale(1.1)' : 'scale(1)'
                            }}
                            aria-label={`Обрати ${opt.name} колір`}
                        />
                    ))}
                </div>
                <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    Поточний колір: {accentColors.find(color => color.value === platformAccent)?.name}
                </p>
            </div>
        </div>
    );
};

export default InterfaceSettingsTab;
// frontend/src/modules/profile/components/tabs/ProfileAppearanceTab.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../../../app/providers/ThemeContext';
import ThemeModeSelector from '../../../../common/components/ui/ThemeModeSelector';
import AccentColorSelector from '../../../../common/components/ui/AccentColorSelector';

const ProfileAppearanceTab = () => {
    const { platformMode, setPlatformMode, platformAccent, setPlatformAccent } = useContext(ThemeContext);
    const container = { maxWidth: '800px', margin: '0 auto' };
    const card = { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '16px', 
        border: '1px solid var(--platform-border-color)', 
        padding: '32px', 
        marginBottom: '24px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' 
    };
    const cardTitle = { 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        color: 'var(--platform-text-primary)', 
        margin: '0 0 8px 0' 
    };
    const section = { marginBottom: '28px' };
    
    return (
        <div style={container}>
            <div style={card}>
                <div style={section}>
                    <h3 style={cardTitle}>Тема інтерфейсу</h3>
                    <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                        Оберіть між світлою та темною темою для вашого дашборду.
                    </p>
                    <ThemeModeSelector 
                        currentMode={platformMode}
                        accentColor={platformAccent}
                        onChange={setPlatformMode}
                    />
                </div>

                <div style={{ marginBottom: 0 }}>
                     <AccentColorSelector 
                        value={platformAccent}
                        onChange={setPlatformAccent}
                        enableCustom={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileAppearanceTab;
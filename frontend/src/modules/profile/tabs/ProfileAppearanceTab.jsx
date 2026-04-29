// frontend/src/modules/profile/tabs/ProfileAppearanceTab.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../../app/providers/ThemeContext';
import ThemeModeSelector from '../../../shared/ui/complex/ThemeModeSelector';
import AccentColorSelector from '../../../shared/ui/complex/AccentColorSelector';
import { Palette } from 'lucide-react';

const ProfileAppearanceTab = () => {
    const { platformMode, setPlatformMode, platformAccent, setPlatformAccent } = useContext(ThemeContext);
    return (
        <div className="w-full max-w-200 mx-auto">
            <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-(--platform-text-primary) flex items-center gap-2.5 m-0 mb-1.5">
                        <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-(--platform-accent)" />
                        Тема інтерфейсу
                    </h3>
                    <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed mb-5 sm:mb-6">
                        Оберіть між світлою та темною темою для вашого дашборду.
                    </p>
                    <ThemeModeSelector 
                        currentMode={platformMode}
                        accentColor={platformAccent}
                        onChange={setPlatformMode}
                    />
                </div>
                <div className="pt-6 sm:pt-8 border-t border-(--platform-border-color)">
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
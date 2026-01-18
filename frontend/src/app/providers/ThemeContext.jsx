// frontend/src/app/providers/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'; 
import { AuthContext } from './AuthContext'; 
import apiClient from '../../shared/api/api';

export const ThemeContext = createContext(null);
export const ThemeProvider = ({ children }) => {
    const { user, updateUser, isLoading: isAuthLoading } = useContext(AuthContext);
    const [platformMode, setPlatformModeState] = useState('system');
    const [platformAccent, setPlatformAccentState] = useState('blue');
    const [siteMode, setSiteModeState] = useState('light');
    const [siteAccent, setSiteAccentState] = useState('orange');
    const [detectedSystemMode, setDetectedSystemMode] = useState('light');
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateSystemMode = (event) => {
            const newMode = event.matches ? 'dark' : 'light';
            setDetectedSystemMode(newMode);
            if (platformMode === 'system') {
                document.body.dataset.platformMode = newMode;
            }
        };

        updateSystemMode(mediaQuery);

        mediaQuery.addEventListener('change', updateSystemMode);
        return () => mediaQuery.removeEventListener('change', updateSystemMode);
    }, [platformMode]);

    useEffect(() => {
        if (isAuthLoading) return;
        const targetMode = user?.platform_theme_mode || localStorage.getItem('themeMode') || 'system';
        const targetAccent = user?.platform_theme_accent || localStorage.getItem('themeAccent') || 'blue';
        setPlatformModeState(targetMode);
        setPlatformAccentState(targetAccent);
        const effectiveMode = targetMode === 'system' ? detectedSystemMode : targetMode;
        document.body.dataset.platformMode = effectiveMode;
        document.body.dataset.platformAccent = targetAccent;
        if (!user) {
             if (targetMode !== 'system') localStorage.setItem('themeMode', targetMode);
             if (targetAccent !== 'blue') localStorage.setItem('themeAccent', targetAccent);
        }

    }, [user, isAuthLoading, detectedSystemMode]);

    const setPlatformMode = async (mode) => {
        setPlatformModeState(mode);
        const effectiveMode = mode === 'system' ? detectedSystemMode : mode;
        document.body.dataset.platformMode = effectiveMode;
        document.body.dataset.platformAccent = platformAccent;
        localStorage.setItem('themeMode', mode);

        if (user) {
            updateUser({ ...user, platform_theme_mode: mode });
            try {
                await apiClient.put('/users/profile', { platform_theme_mode: mode });
            } catch (error) {
                console.error("Помилка збереження режиму теми:", error);
            }
        }
    };

    const setPlatformAccent = async (accent) => {
        setPlatformAccentState(accent);
        const effectiveMode = platformMode === 'system' ? detectedSystemMode : platformMode;
        document.body.dataset.platformMode = effectiveMode;
        document.body.dataset.platformAccent = accent;
        localStorage.setItem('themeAccent', accent);

        if (user) {
            updateUser({ ...user, platform_theme_accent: accent });
            try {
                await apiClient.put('/users/profile', { platform_theme_accent: accent });
            } catch (error) {
                console.error("Помилка збереження акцентного кольору:", error);
            }
        }
    };

    const setSiteMode = (mode) => setSiteModeState(mode);
    const setSiteAccent = (accent) => setSiteAccentState(accent);

    return (
        <ThemeContext.Provider value={{
            platformMode,
            platformAccent,
            siteMode,
            siteAccent,
            setPlatformMode,
            setPlatformAccent,
            setSiteMode,
            setSiteAccent,
            detectedSystemMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
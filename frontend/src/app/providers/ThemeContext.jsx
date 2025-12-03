// frontend/src/app/providers/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import apiClient from '../../common/services/api';

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
        if (!isAuthLoading) {
            const initialMode = user?.platform_theme_mode || localStorage.getItem('themeMode') || 'system';
            const initialAccent = user?.platform_theme_accent || localStorage.getItem('themeAccent') || 'blue';
            
            setPlatformModeState(initialMode);
            setPlatformAccentState(initialAccent);
            
            const effectiveMode = initialMode === 'system' ? detectedSystemMode : initialMode;
            document.body.dataset.platformMode = effectiveMode;
            document.body.dataset.platformAccent = initialAccent;
            
            localStorage.setItem('themeMode', initialMode);
            localStorage.setItem('themeAccent', initialAccent);
        }
    }, [user, isAuthLoading, detectedSystemMode]);

    const setPlatformMode = async (mode) => {
        setPlatformModeState(mode);
        
        const effectiveMode = mode === 'system' ? detectedSystemMode : mode;
        document.body.dataset.platformMode = effectiveMode;
        document.body.dataset.platformAccent = platformAccent;
        
        localStorage.setItem('themeMode', mode);
        localStorage.setItem('themeAccent', platformAccent);

        if (user) {
            updateUser({ platform_theme_mode: mode });
            try {
                await apiClient.put('/users/profile/update', { 
                    platform_theme_mode: mode,
                    currentPassword: null
                });
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
        
        localStorage.setItem('themeMode', platformMode);
        localStorage.setItem('themeAccent', accent);

        if (user) {
            updateUser({ platform_theme_accent: accent });
            try {
                await apiClient.put('/users/profile/update', { 
                    platform_theme_accent: accent,
                    currentPassword: null
                });
            } catch (error) {
                console.error("Помилка збереження акцентного кольору:", error);
            }
        }
    };

    const setSiteMode = (mode) => {
        setSiteModeState(mode);
    };

    const setSiteAccent = (accent) => {
        setSiteAccentState(accent);
    };

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